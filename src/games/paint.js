/**
 * Malen – freies Malen mit Farben, Regenbogenpinsel und Stempeln.
 * Bilder können im Stickerheft aufgehoben werden.
 */
import './paint.css'
import { h, flash } from '../core/dom.js'
import { emoji, preloadEmoji } from '../core/img.js'
import { ICON } from '../core/icons.js'
import { T } from '../data/texts.js'
import { addDrawing } from '../core/store.js'

const COLORS = ['#FF4D4D', '#FF9F1C', '#FFD93D', '#34C77B', '#3AA7FF', '#8B6CF6', '#FF7EB6', '#A0522D', '#3B3355']
const STAMPS = ['star', 'red-heart', 'blossom', 'butterfly', 'lady-beetle', 'tropical-fish', 'sun', 'rainbow', 'cat-face', 'dog-face', 'unicorn', 'automobile', 'deciduous-tree', 'balloon', 'crown', 'rocket']
const SIZES = { thin: 7, thick: 18 }

export default function paint(ctx) {
  const { stage } = ctx
  const canvas = h('canvas', { class: 'paint-canvas', 'aria-label': 'Malfläche' })
  const paper = h('div', { class: 'paint-paper' }, canvas)
  const g = canvas.getContext('2d')
  const stampImages = new Map()
  preloadEmoji(STAMPS).then((imgs) => imgs.forEach((img, i) => stampImages.set(STAMPS[i], img)))

  let color = COLORS[4]
  let tool = 'brush' // brush | rainbow | eraser | stamp
  let size = 'thick'
  let stamp = STAMPS[0]
  let hue = 0
  let dirty = false

  /* ---------- Werkzeugleiste ---------- */
  const swatches = [
    ...COLORS.map((c) => {
      const b = h('button', { class: 'swatch', style: { '--sw': c }, 'aria-label': 'Farbe' })
      b.addEventListener('click', () => {
        color = c
        if (tool !== 'brush') tool = 'brush'
        update()
        ctx.sfx.tap()
      })
      return b
    }),
  ]
  const rainbowBtn = h('button', { class: 'swatch rainbow', 'aria-label': 'Regenbogen' })
  rainbowBtn.addEventListener('click', () => {
    tool = 'rainbow'
    update()
    ctx.sfx.sparkle()
  })
  const sizeBtn = h('button', { class: 'tool size-btn', 'aria-label': 'Pinselgröße' }, h('span', { class: 'size-dot' }))
  sizeBtn.addEventListener('click', () => {
    size = size === 'thin' ? 'thick' : 'thin'
    update()
    ctx.sfx.tap()
  })
  const stampBtn = h('button', { class: 'tool stamp-btn', 'aria-label': 'Stempel' }, emoji(stamp))
  stampBtn.addEventListener('click', () => {
    ctx.sfx.tap()
    if (tool !== 'stamp') {
      tool = 'stamp'
      update()
    }
    togglePalette()
  })
  const eraserBtn = h('button', { class: 'tool', 'aria-label': 'Radiergummi', html: ICON.eraser })
  eraserBtn.addEventListener('click', () => {
    tool = 'eraser'
    update()
    ctx.sfx.tap()
  })
  const clearBtn = h('button', { class: 'tool tool-red', 'aria-label': 'Alles löschen', html: ICON.trash })
  clearBtn.addEventListener('click', askClear)
  const saveBtn = h('button', { class: 'tool tool-green', 'aria-label': 'Bild aufheben', html: ICON.save })
  saveBtn.addEventListener('click', save)

  const palette = h(
    'div',
    { class: 'stamp-palette', hidden: true },
    ...STAMPS.map((name) => {
      const b = h('button', { class: 'stamp-choice', 'aria-label': 'Stempel' }, emoji(name))
      b.addEventListener('click', () => {
        stamp = name
        stampBtn.replaceChildren(emoji(name))
        palette.hidden = true
        update()
        ctx.sfx.pop()
      })
      return b
    }),
  )
  function togglePalette() {
    palette.hidden = !palette.hidden
  }

  const toolbar = h(
    'div',
    { class: 'paint-tools' },
    h('div', { class: 'swatches' }, ...swatches, rainbowBtn),
    h('div', { class: 'tool-row' }, sizeBtn, stampBtn, eraserBtn, clearBtn, saveBtn),
  )
  stage.append(h('div', { class: 'paint' }, paper, toolbar, palette))

  function update() {
    swatches.forEach((b, i) => b.classList.toggle('active', tool === 'brush' && COLORS[i] === color))
    rainbowBtn.classList.toggle('active', tool === 'rainbow')
    eraserBtn.classList.toggle('active', tool === 'eraser')
    stampBtn.classList.toggle('active', tool === 'stamp')
    sizeBtn.classList.toggle('thin', size === 'thin')
    sizeBtn.style.setProperty('--dot', tool === 'rainbow' ? 'conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)' : tool === 'eraser' ? '#fff' : color)
    canvas.dataset.tool = tool
  }
  update()

  /* ---------- Zeichenfläche ---------- */
  let dpr = 1
  function resize() {
    const rect = paper.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const old = document.createElement('canvas')
    old.width = canvas.width
    old.height = canvas.height
    if (canvas.width) old.getContext('2d').drawImage(canvas, 0, 0)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    g.fillStyle = '#fff'
    g.fillRect(0, 0, canvas.width, canvas.height)
    if (old.width) g.drawImage(old, 0, 0, canvas.width, canvas.height)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(paper)
  ctx.onDispose(() => observer.disconnect())

  const strokes = new Map()
  const pos = (e) => {
    const r = canvas.getBoundingClientRect()
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr }
  }
  const strokeColor = () => {
    if (tool === 'eraser') return '#fff'
    if (tool === 'rainbow') {
      hue = (hue + 4) % 360
      return `hsl(${hue} 90% 55%)`
    }
    return color
  }
  const width = () => SIZES[size] * dpr * (tool === 'eraser' ? 2.2 : 1)

  function placeStamp(p) {
    const img = stampImages.get(stamp)
    if (!img) return
    const s = (size === 'thick' ? 110 : 64) * dpr
    g.save()
    g.translate(p.x, p.y)
    g.rotate(((Math.random() - 0.5) * Math.PI) / 6)
    g.drawImage(img, -s / 2, -s / 2, s, s)
    g.restore()
    ctx.sfx.stamp()
    dirty = true
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    palette.hidden = true
    canvas.setPointerCapture?.(e.pointerId)
    const p = pos(e)
    if (tool === 'stamp') return placeStamp(p)
    strokes.set(e.pointerId, { last: p, mid: p })
    g.beginPath()
    g.fillStyle = strokeColor()
    g.arc(p.x, p.y, width() / 2, 0, Math.PI * 2)
    g.fill()
    dirty = true
  })
  canvas.addEventListener('pointermove', (e) => {
    const st = strokes.get(e.pointerId)
    if (!st) return
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
    for (const ev of events) {
      const p = pos(ev)
      const mid = { x: (st.last.x + p.x) / 2, y: (st.last.y + p.y) / 2 }
      g.beginPath()
      g.moveTo(st.mid.x, st.mid.y)
      g.quadraticCurveTo(st.last.x, st.last.y, mid.x, mid.y)
      g.strokeStyle = strokeColor()
      g.lineWidth = width()
      g.lineCap = 'round'
      g.lineJoin = 'round'
      g.stroke()
      st.last = p
      st.mid = mid
    }
  })
  const end = (e) => strokes.delete(e.pointerId)
  canvas.addEventListener('pointerup', end)
  canvas.addEventListener('pointercancel', end)

  /* ---------- Löschen & Aufheben ---------- */
  function askClear() {
    ctx.sfx.tap()
    if (!dirty) return
    const close = () => dialog.remove()
    const dialog = h(
      'div',
      { class: 'paint-confirm' },
      h(
        'div',
        { class: 'paint-confirm-card' },
        h('div', { class: 'confirm-icon', html: ICON.trash }),
        h(
          'div',
          { class: 'confirm-actions' },
          h('button', {
            class: 'big-btn btn-red',
            'aria-label': 'Ja, löschen',
            html: ICON.check,
            onclick: () => {
              close()
              g.fillStyle = '#fff'
              g.fillRect(0, 0, canvas.width, canvas.height)
              dirty = false
              ctx.sfx.whoosh()
            },
          }),
          h('button', {
            class: 'big-btn btn-blue',
            'aria-label': 'Nein, behalten',
            html: ICON.close,
            onclick: () => {
              close()
              ctx.sfx.tap()
            },
          }),
        ),
      ),
    )
    stage.append(dialog)
    ctx.say(T.paintClear)
  }

  async function save() {
    if (!dirty) {
      ctx.sfx.tap()
      ctx.say(T.paintHello)
      return
    }
    const scale = Math.min(1, 900 / canvas.width)
    const out = document.createElement('canvas')
    out.width = Math.round(canvas.width * scale)
    out.height = Math.round(canvas.height * scale)
    out.getContext('2d').drawImage(canvas, 0, 0, out.width, out.height)
    addDrawing(out.toDataURL('image/jpeg', 0.82))
    dirty = false
    flash(paper, 'saved', 900)
    ctx.sfx.sparkle()
    ctx.burst(saveBtn, { count: 10, spread: 70 })
    await ctx.say(T.paintSaved)
  }

  ctx.idleHelp = false
  ctx.setHelp(() => ctx.say(T.paintHello))
  ctx.say(T.paintHello)
  ctx.preload([T.paintSaved, T.paintClear])
}
