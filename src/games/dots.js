/**
 * Punkt zu Punkt – Zahlenreihe üben.
 * Punkte der Reihe nach antippen (oder mit dem Finger verbinden), bis ein Bild entsteht.
 */
import './dots.css'
import { h, s, flash, pickN } from '../core/dom.js'
import { T, DOT_SHAPE_SAY, numberWord } from '../data/texts.js'

const PICTURES = 3

function circle(cx, cy, r, n) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)]
  })
}

function star(cx, cy, outer, inner) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 ? inner : outer
    return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)]
  })
}

const SHAPES = {
  haus: {
    level: 1,
    pts: [[20, 88], [20, 48], [50, 16], [80, 48], [80, 88]],
    fill: '#FFCC80',
    deco: '<path d="M20 48 50 16 80 48Z" fill="#E57373"/><rect x="43" y="64" width="14" height="24" rx="2" fill="#8D6E63"/><rect x="27" y="56" width="12" height="12" rx="2" fill="#81D4FA" stroke="#fff" stroke-width="1.5"/><rect x="61" y="56" width="12" height="12" rx="2" fill="#81D4FA" stroke="#fff" stroke-width="1.5"/>',
  },
  diamant: {
    level: 1,
    pts: [[30, 22], [70, 22], [88, 42], [50, 86], [12, 42]],
    fill: '#4FC3F7',
    deco: '<path d="M12 42H88M30 22 40 42 50 86 60 42 70 22M40 42 50 22 60 42" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" opacity=".85"/>',
  },
  drachen: {
    level: 1,
    pts: [[50, 4], [78, 36], [50, 78], [22, 36]],
    fill: '#FF6B9A',
    deco: '<path d="M50 4V78M22 36H78" stroke="#fff" stroke-width="2.5"/><path d="M50 78c-6 5 6 9 0 14s5 6 3 9" fill="none" stroke="#7E57C2" stroke-width="2"/><path d="M46 86l4 3-4 3zM54 94l-4-3 4-3z" fill="#FFCA28"/>',
  },
  eis: {
    level: 1,
    pts: [[28, 40], [33, 22], [50, 12], [67, 22], [72, 40], [50, 92]],
    fill: '#F8BBD0',
    deco: '<path d="M28 40H72L50 92Z" fill="#E0A35B"/><path d="M38 40 58 80M50 40 64 66M62 40 67 50M62 40 42 80M50 40 36 66M38 40 33 50" stroke="#B9773A" stroke-width="1.5"/><circle cx="50" cy="9" r="4.5" fill="#E53935"/>',
  },
  boot: {
    level: 1,
    pts: [[52, 8], [80, 58], [92, 60], [78, 82], [24, 82], [10, 60], [52, 60]],
    fill: '#E3F2FD',
    deco: '<path d="M10 60H92L78 82H24Z" fill="#8D6E63"/><path d="M52 8 80 58H52Z" fill="#FFF8E1"/><path d="M52 8V60" stroke="#6D4C41" stroke-width="2.5"/><path d="M4 92c8-5 16 5 24 0s16 5 24 0 16 5 24 0 16 5 24 0" fill="none" stroke="#4FC3F7" stroke-width="3"/>',
  },
  krone: {
    level: 1,
    pts: [[14, 80], [14, 30], [32, 52], [50, 22], [68, 52], [86, 30], [86, 80]],
    fill: '#FFCA28',
    deco: '<circle cx="50" cy="64" r="6" fill="#E53935"/><circle cx="30" cy="66" r="4.5" fill="#42A5F5"/><circle cx="70" cy="66" r="4.5" fill="#66BB6A"/><circle cx="14" cy="28" r="3.5" fill="#FFE082"/><circle cx="50" cy="20" r="3.5" fill="#FFE082"/><circle cx="86" cy="28" r="3.5" fill="#FFE082"/>',
  },
  blitz: {
    level: 1,
    pts: [[56, 6], [24, 54], [46, 54], [36, 94], [78, 42], [54, 42], [70, 6]],
    fill: '#FFEB3B',
    deco: '',
  },
  fisch: {
    level: 2,
    pts: [[10, 50], [28, 30], [54, 26], [74, 42], [92, 26], [92, 74], [74, 58], [54, 74], [28, 70]],
    fill: '#4DD0E1',
    deco: '<circle cx="26" cy="46" r="3.2" fill="#263238"/><path d="M48 34c6 6 6 26 0 32M60 38c4 5 4 19 0 24" fill="none" stroke="#fff" stroke-width="2"/><path d="M15 56c3 2 6 2 9 0" stroke="#263238" stroke-width="1.6" fill="none"/>',
  },
  rakete: {
    level: 2,
    pts: [[50, 6], [64, 26], [64, 64], [80, 84], [62, 80], [38, 80], [20, 84], [36, 64], [36, 26]],
    fill: '#ECEFF1',
    deco: '<path d="M50 6 64 26H36Z" fill="#EF5350"/><circle cx="50" cy="44" r="7" fill="#4FC3F7" stroke="#90A4AE" stroke-width="2"/><path d="M64 64 80 84 62 80ZM36 64 20 84 38 80Z" fill="#EF5350"/><path d="M42 82 50 97 58 82Z" fill="#FFB300"/>',
  },
  pilz: {
    level: 2,
    pts: [[8, 52], [18, 28], [50, 12], [82, 28], [92, 52], [60, 52], [62, 88], [38, 88], [40, 52]],
    fill: '#EF5350',
    deco: '<path d="M60 52 62 88H38L40 52Z" fill="#FFF3E0"/><circle cx="30" cy="36" r="5" fill="#fff"/><circle cx="52" cy="26" r="6" fill="#fff"/><circle cx="72" cy="38" r="5" fill="#fff"/>',
  },
  auto: {
    level: 2,
    pts: [[8, 72], [8, 54], [24, 50], [34, 30], [66, 30], [78, 50], [92, 54], [92, 72]],
    fill: '#42A5F5',
    deco: '<path d="M37 34H49V50H29ZM53 34H64L72 50H53Z" fill="#E3F2FD"/><circle cx="28" cy="74" r="9" fill="#37474F"/><circle cx="28" cy="74" r="3.5" fill="#CFD8DC"/><circle cx="72" cy="74" r="9" fill="#37474F"/><circle cx="72" cy="74" r="3.5" fill="#CFD8DC"/><rect x="84" y="56" width="6" height="5" rx="1.5" fill="#FFF59D"/>',
  },
  katze: {
    level: 2,
    pts: [[18, 34], [26, 8], [42, 26], [58, 26], [74, 8], [82, 34], [86, 58], [70, 82], [30, 82], [14, 58]],
    fill: '#FFB74D',
    deco: '<path d="M27 15 33 28M73 15 67 28" stroke="#F48FB1" stroke-width="3" stroke-linecap="round"/><ellipse cx="38" cy="48" rx="4" ry="5.5" fill="#263238"/><ellipse cx="62" cy="48" rx="4" ry="5.5" fill="#263238"/><path d="M46 60h8l-4 4z" fill="#EC407A"/><path d="M50 64c-2 5-8 5-10 2M50 64c2 5 8 5 10 2M32 60H14M32 66l-15 4M68 60h18M68 66l15 4" fill="none" stroke="#5D4037" stroke-width="1.6" stroke-linecap="round"/>',
  },
  ballon: {
    level: 2,
    pts: circle(50, 40, 30, 10),
    smooth: true,
    fill: '#EF5350',
    deco: '<path d="M50 70c-4 8 6 12 0 20s4 6 2 9" fill="none" stroke="#8D6E63" stroke-width="1.8"/><path d="M46 74h8l-4-4z" fill="#C62828"/><ellipse cx="39" cy="28" rx="5" ry="8" fill="#fff" opacity=".5" transform="rotate(25 39 28)"/>',
  },
  herz: {
    level: 2,
    pts: [[50, 30], [61, 17], [78, 15], [90, 30], [85, 52], [50, 88], [15, 52], [10, 30], [22, 15], [39, 17]],
    smooth: true,
    corners: [0, 5],
    fill: '#FF5D8F',
    deco: '<ellipse cx="28" cy="32" rx="5" ry="8" fill="#fff" opacity=".45" transform="rotate(-35 28 32)"/>',
  },
  stern: {
    level: 2,
    pts: star(50, 52, 42, 18),
    fill: '#FFC53D',
    deco: '<circle cx="43" cy="50" r="2.6" fill="#5D4037"/><circle cx="57" cy="50" r="2.6" fill="#5D4037"/><path d="M45 57c3 3.5 7 3.5 10 0" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/>',
  },
  haus2: {
    level: 2,
    pts: [[16, 88], [16, 48], [50, 16], [66, 31], [66, 18], [76, 18], [76, 40], [84, 48], [84, 88]],
    fill: '#AED581',
    deco: '<path d="M16 48 50 16 84 48Z" fill="#8D6E63"/><rect x="66" y="18" width="10" height="17" fill="#795548"/><rect x="42" y="62" width="16" height="26" rx="2" fill="#6D4C41"/><rect x="24" y="56" width="12" height="12" rx="2" fill="#FFF59D"/><rect x="64" y="56" width="12" height="12" rx="2" fill="#FFF59D"/><path d="M71 14c-2-4 2-6 0-10" stroke="#B0BEC5" stroke-width="2" fill="none"/>',
  },
  tanne: {
    level: 3,
    pts: [[50, 6], [68, 30], [60, 30], [76, 52], [64, 52], [84, 76], [56, 76], [56, 92], [44, 92], [44, 76], [16, 76], [36, 52], [24, 52], [40, 30], [32, 30]],
    fill: '#43A047',
    deco: '<rect x="44" y="76" width="12" height="16" fill="#8D6E63"/><circle cx="48" cy="40" r="3" fill="#E53935"/><circle cx="60" cy="58" r="3" fill="#FFCA28"/><circle cx="38" cy="62" r="3" fill="#42A5F5"/><circle cx="66" cy="70" r="3" fill="#E53935"/><circle cx="30" cy="72" r="3" fill="#FFCA28"/><path d="M50 0l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="#FFD54F"/>',
  },
  schmetterling: {
    level: 3,
    pts: [[50, 28], [62, 12], [84, 10], [90, 30], [74, 46], [86, 62], [80, 84], [62, 86], [54, 70], [46, 70], [38, 86], [20, 84], [14, 62], [26, 46], [10, 30], [16, 10], [38, 12]],
    fill: '#AB47BC',
    deco: '<circle cx="72" cy="30" r="7" fill="#FFCA28"/><circle cx="28" cy="30" r="7" fill="#FFCA28"/><circle cx="70" cy="70" r="5" fill="#4FC3F7"/><circle cx="30" cy="70" r="5" fill="#4FC3F7"/><ellipse cx="50" cy="50" rx="4.5" ry="22" fill="#4E342E"/><path d="M48 29c-4-8-8-12-12-14M52 29c4-8 8-12 12-14" stroke="#4E342E" stroke-width="2" fill="none"/>',
  },
  burg: {
    level: 3,
    pts: [[12, 90], [12, 36], [22, 36], [22, 46], [32, 46], [32, 26], [42, 26], [42, 36], [58, 36], [58, 26], [68, 26], [68, 46], [78, 46], [78, 36], [88, 36], [88, 90]],
    fill: '#B0BEC5',
    deco: '<path d="M40 90V72a10 10 0 0 1 20 0v18Z" fill="#6D4C41"/><rect x="16" y="56" width="8" height="12" rx="4" fill="#455A64"/><rect x="76" y="56" width="8" height="12" rx="4" fill="#455A64"/><path d="M37 26V10l10 4-10 4M63 26V10l10 4-10 4" fill="#EF5350" stroke="#546E7A" stroke-width="1.5"/>',
  },
  hase: {
    level: 3,
    pts: [[30, 92], [22, 72], [24, 52], [34, 42], [30, 8], [42, 8], [46, 40], [54, 40], [58, 8], [70, 8], [66, 42], [76, 52], [78, 72], [70, 92]],
    fill: '#ECEFF1',
    deco: '<path d="M34 14h5l3 25h-6zM61 14h5l-2 25h-6z" fill="#F8BBD0"/><circle cx="40" cy="60" r="3.5" fill="#263238"/><circle cx="60" cy="60" r="3.5" fill="#263238"/><path d="M47 68h6l-3 3z" fill="#EC407A"/><path d="M50 71v4M50 75c-3 3-6 2-7 0M50 75c3 3 6 2 7 0" stroke="#5D4037" stroke-width="1.5" fill="none"/>',
  },
}

function pickPictures(level) {
  const ids = Object.keys(SHAPES)
  const pool = ids.filter((id) => SHAPES[id].level === level)
  const extra = level === 3 ? ['stern', 'katze'] : []
  return pickN([...pool, ...extra], PICTURES)
}

/** Geschlossener, weicher Pfad durch alle Punkte (Catmull-Rom), mit optionalen Ecken. */
function smoothPath(pts, corners = []) {
  const n = pts.length
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1 = corners.includes(i) ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = corners.includes((i + 1) % n) ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`
  }
  return `${d}Z`
}

export default function dots(ctx) {
  const { stage, level } = ctx
  const pictures = pickPictures(level)
  let index = 0
  let mistakes = 0

  const svg = s('svg', { viewBox: '-8 -8 116 116', class: 'dots-svg', role: 'img', 'aria-label': 'Punkt-zu-Punkt-Bild' })
  stage.append(h('div', { class: 'dots-wrap' }, svg))
  ctx.preload([T.dotsStart, T.dotsNext, ...Array.from({ length: 17 }, (_, i) => numberWord(i + 1)), ...pictures.map((id) => DOT_SHAPE_SAY[id])])

  function startPicture() {
    const id = pictures[index]
    const shape = SHAPES[id]
    const pts = shape.pts
    const n = pts.length
    const cx = pts.reduce((a, p) => a + p[0], 0) / n
    const cy = pts.reduce((a, p) => a + p[1], 0) / n
    let next = 0
    let done = false
    let idleTimer = 0

    ctx.setProgress(index, PICTURES)
    svg.replaceChildren()
    const fillLayer = s('g', { class: 'dots-fill' })
    const line = s('polyline', { class: 'dots-line', points: '' })
    const dotsLayer = s('g', { class: 'dots-points' })
    svg.append(fillLayer, line, dotsLayer)

    const dotEls = pts.map(([x, y], i) => {
      const dx = x - cx
      const dy = y - cy
      const len = Math.hypot(dx, dy) || 1
      const lx = x + (dx / len) * 7.5
      const ly = y + (dy / len) * 7.5 + 2.2
      const g = s('g', { class: 'dot', style: `animation-delay:${i * 40}ms` }, s('circle', { cx: x, cy: y, r: 6.5, class: 'dot-ring' }), s('circle', { cx: x, cy: y, r: 3.2, class: 'dot-core' }), s('text', { x: lx, y: ly, class: 'dot-label', 'text-anchor': 'middle' }))
      g.querySelector('text').textContent = String(i + 1)
      dotsLayer.append(g)
      return g
    })

    const showHint = (on) => dotEls.forEach((el, i) => el.classList.toggle('next', on && i === next))
    const alwaysHint = level === 1
    showHint(true)
    const armIdle = () => {
      clearTimeout(idleTimer)
      if (!alwaysHint) showHint(false)
      idleTimer = ctx.timeout(() => showHint(true), 7000)
    }

    function connect(i) {
      dotEls[i].classList.add('done')
      dotEls[i].classList.remove('next')
      line.setAttribute('points', pts.slice(0, i + 1).map((p) => p.join(',')).join(' '))
      ctx.sfx.step(i)
      ctx.say(numberWord(i + 1))
      next = i + 1
      if (next >= n) complete()
      else if (alwaysHint) showHint(true)
      else armIdle()
    }

    async function complete() {
      done = true
      clearTimeout(idleTimer)
      showHint(false)
      line.setAttribute('points', [...pts, pts[0]].map((p) => p.join(',')).join(' '))
      await ctx.wait(500)
      const d = shape.smooth ? smoothPath(pts, shape.corners) : `M${pts.map((p) => p.join(' ')).join(' L')}Z`
      const fill = s('path', { d, fill: shape.fill, class: 'dots-shape' })
      const deco = s('g', { class: 'dots-deco' })
      deco.innerHTML = shape.deco
      fillLayer.append(fill, deco)
      svg.classList.add('finished')
      ctx.sfx.correct()
      ctx.sfx.sparkle()
      ctx.burst(svg, { count: 14, spread: 160 })
      await ctx.say(DOT_SHAPE_SAY[id])
      await ctx.praise()
      index++
      ctx.setProgress(index, PICTURES)
      await ctx.wait(700)
      svg.classList.remove('finished')
      if (index >= PICTURES) ctx.finish({ mistakes, rounds: PICTURES * 3 })
      else startPicture()
    }

    // Zeiger: antippen oder mit dem Finger von Punkt zu Punkt fahren
    const toSvg = (e) => {
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      return pt.matrixTransform(svg.getScreenCTM().inverse())
    }
    const nearest = (p, radius) => {
      let best = -1
      let bestDist = radius
      pts.forEach(([x, y], i) => {
        const dist = Math.hypot(x - p.x, y - p.y)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      return best
    }
    let pressing = false
    svg.onpointerdown = (e) => {
      if (done) return
      pressing = true
      svg.setPointerCapture?.(e.pointerId)
      const i = nearest(toSvg(e), 9)
      if (i === -1) return
      if (i === next) connect(i)
      else if (i > next) {
        mistakes++
        ctx.sfx.wrong()
        flash(dotEls[i], 'shake-dot', 450)
        showHint(true)
        ctx.say(T.dotsNext)
      }
    }
    svg.onpointermove = (e) => {
      if (!pressing || done) return
      const i = nearest(toSvg(e), 6)
      if (i === next) connect(i)
    }
    svg.onpointerup = svg.onpointercancel = () => (pressing = false)

    ctx.setHelp(() => ctx.say(T.dotsStart))
    if (index === 0) ctx.say(T.dotsStart)
    if (!alwaysHint) armIdle()
  }

  startPicture()
}
