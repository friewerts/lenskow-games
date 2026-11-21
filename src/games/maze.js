/**
 * Labyrinth – vorausschauend planen, Feinmotorik.
 * Mit dem Finger die Figur über die Wege zum Ziel führen.
 */
import './maze.css'
import { s, makePicker } from '../core/dom.js'
import { emojiUrl } from '../core/img.js'
import { iconOf } from '../data/words.js'
import { MAZE_PAIRS } from '../data/content.js'
import { T } from '../data/texts.js'
import { generateMaze } from './logic.js'

const MAZES = 3
const SIZES = { 1: [4, 3], 2: [5, 4], 3: [7, 5] }
const CELL = 10

export default function maze(ctx) {
  const { stage, level } = ctx
  const nextPair = makePicker(MAZE_PAIRS)
  let index = 0

  const svg = s('svg', { class: 'maze-svg', role: 'img', 'aria-label': 'Labyrinth' })
  stage.append(svg)
  ctx.preload([T.mazeHowTo, ...MAZE_PAIRS.map((p) => p.say)])

  function startMaze() {
    ctx.setProgress(index, MAZES)
    const portrait = stage.clientHeight > stage.clientWidth * 1.1
    const [a, b] = SIZES[level]
    const cols = portrait ? b : a
    const rows = portrait ? a : b
    const m = generateMaze(cols, rows, level === 1 ? 2 : level === 2 ? 1 : 0)
    const pair = nextPair()
    const goal = cols * rows - 1
    const path = [0]
    let done = false

    const W = cols * CELL
    const H = rows * CELL
    svg.setAttribute('viewBox', `-2 -2 ${W + 4} ${H + 4}`)
    svg.style.setProperty('--ratio', `${(W + 4) / (H + 4)}`)
    svg.replaceChildren()

    const center = (c) => [(c % cols) * CELL + CELL / 2, Math.floor(c / cols) * CELL + CELL / 2]
    const roads = s('g', { class: 'maze-roads' })
    const roadsTop = s('g', { class: 'maze-roads-top' })
    for (const k of m.open) {
      const [c1, c2] = k.split('-').map(Number)
      const [x1, y1] = center(c1)
      const [x2, y2] = center(c2)
      roads.append(s('line', { x1, y1, x2, y2 }))
      roadsTop.append(s('line', { x1, y1, x2, y2 }))
    }
    const trail = s('polyline', { class: 'maze-trail', points: '' })
    const [gx, gy] = center(goal)
    const goalEl = s('g', { class: 'maze-goal', transform: `translate(${gx} ${gy})` }, s('circle', { r: 4.6, class: 'goal-ring' }), s('image', { href: emojiUrl(iconOf(pair.to)), x: -3.8, y: -3.8, width: 7.6, height: 7.6 }))
    const hero = s('g', { class: 'maze-hero' }, s('circle', { r: 4.4, class: 'hero-ring' }), s('image', { href: emojiUrl(iconOf(pair.from)), x: -4, y: -4, width: 8, height: 8 }))
    const placeHero = (c) => {
      const [x, y] = center(c)
      hero.style.transform = `translate(${x}px, ${y}px)`
    }
    svg.append(s('rect', { x: -2, y: -2, width: W + 4, height: H + 4, rx: 4, class: 'maze-grass' }), roads, roadsTop, trail, goalEl, hero)
    placeHero(0)

    const drawTrail = () => trail.setAttribute('points', path.map((c) => center(c).join(',')).join(' '))

    function step(cell) {
      const current = path[path.length - 1]
      if (cell === current) return
      if (path.length > 1 && cell === path[path.length - 2]) path.pop()
      else if (m.open.has(m.key(current, cell))) {
        const existing = path.indexOf(cell)
        if (existing >= 0) path.length = existing + 1
        else path.push(cell)
      } else return
      placeHero(path[path.length - 1])
      drawTrail()
      ctx.sfx.step(path.length)
      if (path[path.length - 1] === goal) finished()
    }

    /** Kürzester Weg über offene Gänge (für schnelle Fingerbewegungen). */
    function route(from, to, limit = 4) {
      const prev = new Map([[from, null]])
      const queue = [from]
      while (queue.length) {
        const c = queue.shift()
        if (c === to) break
        for (const n of m.neighbors(c)) {
          if (!prev.has(n) && m.open.has(m.key(c, n))) {
            prev.set(n, c)
            queue.push(n)
          }
        }
      }
      if (!prev.has(to)) return null
      const out = []
      for (let c = to; c !== from; c = prev.get(c)) out.unshift(c)
      return out.length <= limit ? out : null
    }

    async function finished() {
      done = true
      hero.classList.add('arrived')
      ctx.sfx.correct()
      ctx.burst(svg, { count: 14, spread: 150 })
      await ctx.praise()
      index++
      ctx.setProgress(index, MAZES)
      await ctx.wait(500)
      if (index >= MAZES) ctx.finish({ mistakes: 0, rounds: MAZES })
      else startMaze()
    }

    const toSvg = (e) => {
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      return pt.matrixTransform(svg.getScreenCTM().inverse())
    }
    const cellAt = ({ x, y }) => {
      const cx = Math.floor(x / CELL)
      const cy = Math.floor(y / CELL)
      if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return -1
      return cy * cols + cx
    }
    let pressing = false
    const handle = (e) => {
      if (done) return
      const cell = cellAt(toSvg(e))
      if (cell < 0) return
      const current = path[path.length - 1]
      if (cell === current) return
      const steps = route(current, cell)
      if (steps) steps.forEach((c) => !done && step(c))
    }
    svg.onpointerdown = (e) => {
      pressing = true
      svg.setPointerCapture?.(e.pointerId)
      handle(e)
    }
    svg.onpointermove = (e) => pressing && handle(e)
    svg.onpointerup = svg.onpointercancel = () => (pressing = false)

    ctx.setHelp(() => ctx.sayAll([pair.say, T.mazeHowTo]))
    const lines = [pair.say]
    if (index === 0 && ctx.firstTime) {
      lines.push(T.mazeHowTo)
      ctx.markIntroHeard()
    }
    ctx.sayAll(lines)
  }

  startMaze()
}
