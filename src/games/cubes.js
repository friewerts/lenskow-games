/**
 * Würfel zählen – räumliches Denken.
 * Bauwerke aus bunten Klötzen zählen. Auf Stufe 3 sind manche Würfel verdeckt:
 * Was oben liegt, braucht einen Würfel darunter. Nach der Lösung fällt das Bauwerk
 * kurz auseinander, damit man alle Würfel sieht.
 */
import './cubes.css'
import { h, s, shuffle, flash } from '../core/dom.js'
import { T, numberExclaim, numberWord } from '../data/texts.js'
import { makeCubeStructure } from './logic.js'

const ROUNDS = 5
const A = 20 // halbe Würfelbreite
const COLORS = [
  ['#ff8a8a', '#ff5a5f', '#d63c42'],
  ['#ffe08a', '#ffc93c', '#e0a400'],
  ['#8cc8ff', '#3a9bff', '#1f78d1'],
  ['#8fe0a6', '#47c46b', '#2a9a4c'],
  ['#c9b6ff', '#8b6cf6', '#6847d6'],
  ['#ffc08a', '#ff9f1c', '#db7c00'],
]

const iso = (x, y, z) => [(x - y) * A, ((x + y) * A) / 2 - z * A]
const pts = (list) => list.map((p) => p.join(',')).join(' ')

function faces({ x, y, z }) {
  return {
    top: [iso(x, y, z + 1), iso(x + 1, y, z + 1), iso(x + 1, y + 1, z + 1), iso(x, y + 1, z + 1)],
    right: [iso(x + 1, y, z + 1), iso(x + 1, y + 1, z + 1), iso(x + 1, y + 1, z), iso(x + 1, y, z)],
    left: [iso(x, y + 1, z + 1), iso(x + 1, y + 1, z + 1), iso(x + 1, y + 1, z), iso(x, y + 1, z)],
  }
}

const depthSort = (cubes) => [...cubes].sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z) || a.z - b.z)

/** Wie viele Pixel jedes Würfels sind sichtbar? (Zeichnen mit Kennfarben) */
function visibility(cubes) {
  const all = cubes.flatMap((c) => Object.values(faces(c)).flat())
  const minX = Math.min(...all.map((p) => p[0]))
  const minY = Math.min(...all.map((p) => p[1]))
  const W = Math.ceil(Math.max(...all.map((p) => p[0])) - minX) + 2
  const H = Math.ceil(Math.max(...all.map((p) => p[1])) - minY) + 2
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d', { willReadFrequently: true })
  const order = depthSort(cubes)
  order.forEach((c, i) => {
    g.fillStyle = `rgb(${i + 1},0,0)`
    for (const face of Object.values(faces(c))) {
      g.beginPath()
      face.forEach(([px, py], k) => (k ? g.lineTo(px - minX + 1, py - minY + 1) : g.moveTo(px - minX + 1, py - minY + 1)))
      g.closePath()
      g.fill()
    }
  })
  const data = g.getImageData(0, 0, W, H).data
  const counts = new Map()
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 250 || data[i + 1] || data[i + 2]) continue
    const id = data[i] - 1
    if (id >= 0) counts.set(id, (counts.get(id) || 0) + 1)
  }
  const full = A * A * 3 // ungefähre Fläche eines ganzen Würfels
  return order.map((c, i) => ({ ...c, visible: (counts.get(i) || 0) > full * 0.06 }))
}

/** Passendes Bauwerk für die Stufe (Stufe 1/2: alles sichtbar, Stufe 3: 1–3 verdeckte Würfel). */
function buildStructure(level) {
  let best = null
  for (let attempt = 0; attempt < 60; attempt++) {
    const st = makeCubeStructure(level)
    const vis = visibility(st.cubes)
    const hidden = vis.filter((c) => !c.visible)
    // oberster Würfel jeder Säule muss sichtbar sein – sonst kann man ihn nicht erschließen
    const tops = new Map()
    for (const c of vis) {
      const key = `${c.x},${c.y}`
      if (!tops.has(key) || tops.get(key).z < c.z) tops.set(key, c)
    }
    const topsVisible = [...tops.values()].every((c) => c.visible)
    const ok = level < 3 ? hidden.length === 0 : hidden.length >= 1 && hidden.length <= 3 && topsVisible
    if (ok) return { ...st, cubes: vis, hidden: hidden.length }
    if (!best && hidden.length === 0) best = { ...st, cubes: vis, hidden: 0 }
  }
  return best || { ...makeCubeStructure(1), hidden: 0, cubes: visibility(makeCubeStructure(1).cubes) }
}

function makeOptions(answer, count) {
  const set = new Set([answer])
  for (const d of shuffle([-1, 1, -2, 2, 3, -3])) {
    if (set.size >= count) break
    if (answer + d >= 1) set.add(answer + d)
  }
  return [...set].sort((a, b) => a - b)
}

export default function cubes(ctx) {
  const { stage, level } = ctx
  let round = 0
  let mistakes = 0
  let busy = true
  let lastTotal = 0

  const field = h('div', { class: 'cubes-field' })
  const answers = h('div', { class: 'cubes-answers' })
  stage.append(h('div', { class: 'cubes' }, field, answers))
  ctx.preload([T.cubesQuestion, T.cubesHidden, T.cubesHint])

  async function startRound() {
    busy = true
    let roundMistakes = 0
    ctx.setProgress(round, ROUNDS)
    let st
    do st = buildStructure(level)
    while (st.total === lastTotal && Math.random() < 0.7)
    lastTotal = st.total
    const palette = shuffle(COLORS)

    // Zeichnen (von hinten nach vorne)
    const all = st.cubes.flatMap((c) => Object.values(faces(c)).flat())
    const minX = Math.min(...all.map((p) => p[0])) - A
    const minY = Math.min(...all.map((p) => p[1])) - A
    const W = Math.max(...all.map((p) => p[0])) - minX + A
    const H = Math.max(...all.map((p) => p[1])) - minY + A
    const size = Math.max(W, H) * 1.35
    const svg = s('svg', { viewBox: `${minX - (size - W) / 2} ${minY - (size - H) / 2} ${size} ${size}`, class: 'cubes-svg', role: 'img', 'aria-label': 'Bauwerk aus Würfeln' })
    const shadow = s('ellipse', { cx: (st.width - 1) * A * 0.5, cy: ((st.width + st.depth) * A) / 2 + 6, rx: (st.width + st.depth) * A * 0.75, ry: (st.width + st.depth) * A * 0.22, class: 'cubes-shadow' })
    svg.append(shadow)
    const groups = st.cubes.map((c, i) => {
      const [light, mid, dark] = palette[(c.x * 3 + c.y * 5 + c.z * 2 + i) % palette.length]
      const f = faces(c)
      const g = s(
        'g',
        { class: 'cube', style: `animation-delay:${i * 70}ms` },
        s('polygon', { points: pts(f.left), fill: mid }),
        s('polygon', { points: pts(f.right), fill: dark }),
        s('polygon', { points: pts(f.top), fill: light }),
      )
      svg.append(g)
      return { g, c }
    })
    field.replaceChildren(svg)

    // Hilfe/Lösung: Bauwerk auseinanderziehen, damit alle Würfel sichtbar werden
    const explode = (on) =>
      groups.forEach(({ g, c }) => {
        const [x0, y0] = iso(c.x, c.y, c.z)
        const [x1, y1] = iso(c.x * 1.45, c.y * 1.45, c.z * 1.45)
        g.style.transform = on ? `translate(${x1 - x0}px, ${y1 - y0}px)` : ''
      })
    const countAloud = async () => {
      for (let i = 0; i < groups.length; i++) {
        flash(groups[i].g, 'cube-pop', 450)
        ctx.sfx.step(i)
        await ctx.say(numberWord(i + 1))
      }
    }

    const options = makeOptions(st.total, level === 3 ? 4 : 3)
    const buttons = options.map((n, i) => {
      const btn = h('button', { class: 'choice number-choice cubes-choice', style: { animationDelay: `${250 + i * 70}ms` }, 'aria-label': numberWord(n) }, String(n))
      btn.addEventListener('click', () => choose(btn, n))
      return btn
    })
    answers.replaceChildren(...buttons)

    async function choose(btn, n) {
      if (busy) return
      busy = true
      ctx.stopVoice()
      if (n === st.total) {
        btn.classList.add('right')
        buttons.forEach((b) => b !== btn && b.classList.add('dim'))
        ctx.sfx.correct()
        ctx.burst(btn)
        if (st.hidden) {
          explode(true)
          await ctx.wait(700)
          await ctx.say(T.cubesHint)
        }
        await ctx.say(numberExclaim(st.total))
        await ctx.praise()
        round++
        ctx.setProgress(round, ROUNDS)
        await ctx.wait(400)
        if (round >= ROUNDS) ctx.finish({ mistakes, rounds: ROUNDS })
        else startRound()
      } else {
        mistakes++
        roundMistakes++
        ctx.sfx.wrong()
        flash(btn, 'wrong', 500)
        btn.classList.add('tried')
        if (roundMistakes >= 2) {
          explode(true)
          await ctx.wait(700)
          await countAloud()
          explode(false)
          buttons[options.indexOf(st.total)]?.classList.add('hint-pulse')
        } else await ctx.tryAgain()
        busy = false
      }
    }

    const lines = [T.cubesQuestion]
    if (st.hidden && (round === 0 || Math.random() < 0.3)) lines.unshift(T.cubesHidden)
    ctx.setHelp(() => ctx.sayAll(st.hidden ? [T.cubesHidden, T.cubesQuestion] : [T.cubesQuestion]))
    busy = false
    await ctx.wait(300)
    await ctx.sayAll(lines)
  }

  startRound()
}

