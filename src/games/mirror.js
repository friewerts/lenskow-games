/**
 * Spiegelbild – Symmetrie erkennen.
 * Links ist ein Muster, rechts malt das Kind das Spiegelbild.
 */
import './mirror.css'
import { h, flash, makePicker } from '../core/dom.js'
import { T } from '../data/texts.js'
import { makeMirrorPuzzle } from './logic.js'

const PUZZLES = 4
const SIZES = { 1: { rows: 3, cols: 2, count: 3 }, 2: { rows: 4, cols: 3, count: 5 }, 3: { rows: 5, cols: 3, count: 7 } }
const COLORS = ['#ff5d8f', '#3a9bff', '#ff9f1c', '#47c46b', '#8b6cf6']

export default function mirror(ctx) {
  const { stage, level } = ctx
  const { rows, cols, count } = SIZES[level]
  const nextColor = makePicker(COLORS)
  let index = 0
  let mistakes = 0

  const left = h('div', { class: 'mirror-grid left' })
  const right = h('div', { class: 'mirror-grid right' })
  const line = h('div', { class: 'mirror-line', 'aria-hidden': 'true' })
  const wrap = h('div', { class: 'mirror', style: { '--rows': rows, '--cols': cols } }, h('div', { class: 'mirror-board' }, left, line, right))
  stage.append(wrap)
  ctx.preload([T.mirrorHowTo, T.mirrorWrong])

  function startPuzzle() {
    ctx.setProgress(index, PUZZLES)
    const p = makeMirrorPuzzle(rows, cols, count)
    wrap.style.setProperty('--paint', nextColor())
    const key = (r, c) => `${r},${c}`
    const target = new Set(p.answer.map(({ r, c }) => key(r, c)))
    const given = new Set(p.cells.map(({ r, c }) => key(r, c)))
    const found = new Set()
    let roundMistakes = 0
    let done = false

    const cellEls = (side) =>
      Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const cell = h(side === 'left' ? 'div' : 'button', { class: 'mirror-cell', dataset: { r, c }, style: { animationDelay: `${i * 25}ms` }, 'aria-label': side === 'left' ? null : `Feld ${i + 1}` })
        if (side === 'left' && given.has(key(r, c))) cell.classList.add('on')
        return cell
      })
    const leftCells = cellEls('left')
    const rightCells = cellEls('right')
    left.replaceChildren(...leftCells)
    right.replaceChildren(...rightCells)

    const hint = () => {
      const missing = p.answer.find(({ r, c }) => !found.has(key(r, c)))
      if (!missing) return
      const ri = missing.r * cols + missing.c
      const li = missing.r * cols + (cols - 1 - missing.c)
      rightCells[ri].classList.add('hint-pulse')
      leftCells[li].classList.add('hint-pulse')
    }

    rightCells.forEach((cell) =>
      cell.addEventListener('click', async () => {
        if (done || cell.classList.contains('on')) return
        const k = key(Number(cell.dataset.r), Number(cell.dataset.c))
        if (target.has(k)) {
          found.add(k)
          cell.classList.remove('hint-pulse')
          cell.classList.add('on')
          leftCells.forEach((l) => l.classList.remove('hint-pulse'))
          ctx.sfx.pop()
          if (found.size === target.size) finished()
        } else {
          mistakes++
          roundMistakes++
          ctx.sfx.wrong()
          flash(cell, 'shake', 450)
          if (roundMistakes >= 2) hint()
          await ctx.say(T.mirrorWrong)
        }
      }),
    )

    async function finished() {
      done = true
      ctx.sfx.correct()
      ctx.burst(wrap, { count: 14, spread: 170 })
      wrap.classList.add('solved')
      await ctx.wait(700)
      wrap.classList.remove('solved')
      await ctx.praise()
      index++
      ctx.setProgress(index, PUZZLES)
      await ctx.wait(350)
      if (index >= PUZZLES) ctx.finish({ mistakes, rounds: PUZZLES * 2 })
      else startPuzzle()
    }

    ctx.setHelp(() => {
      hint()
      ctx.say(T.mirrorHowTo)
    })
    if (index === 0) ctx.say(T.mirrorHowTo)
  }

  startPuzzle()
}
