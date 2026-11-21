/**
 * Bilder-Sudoku – logisches Schließen mit Regeln.
 * In jeder Reihe und jeder Spalte kommt jedes Bild genau einmal vor.
 */
import './sudoku.css'
import { h, flash, makePicker } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { SUDOKU_SETS } from '../data/content.js'
import { T, wordSay } from '../data/texts.js'
import { makeSudoku, sudokuCandidates } from './logic.js'
import { tapOrDrag, hitTest } from './common.js'

const PUZZLES = 3
const SIZES = { 1: { n: 3, blanks: 3 }, 2: { n: 4, blanks: 5 }, 3: { n: 4, blanks: 8 } }

export default function sudoku(ctx) {
  const { stage, level } = ctx
  const { n, blanks } = SIZES[level]
  const nextSet = makePicker(SUDOKU_SETS)
  let index = 0
  let mistakes = 0

  const grid = h('div', { class: 'sudoku-grid' })
  const palette = h('div', { class: 'sudoku-palette' })
  stage.append(h('div', { class: 'sudoku' }, grid, palette))
  ctx.preload([T.sudokuRule, T.sudokuHowTo, T.sudokuRow, T.sudokuCol, T.sudokuNotYet])

  function startPuzzle() {
    ctx.setProgress(index, PUZZLES)
    const symbols = nextSet().slice(0, n)
    const { solution, puzzle } = makeSudoku(n, blanks)
    const state = puzzle.map((row) => [...row])
    let selectedSymbol = null
    let selectedCell = null
    let roundMistakes = 0
    let done = false

    grid.style.setProperty('--n', n)
    const cells = []
    grid.replaceChildren(
      ...state.flatMap((row, r) =>
        row.map((v, c) => {
          const cell = h('button', { class: `sudoku-cell ${v == null ? 'empty' : 'fixed'}`, style: { animationDelay: `${(r * n + c) * 30}ms` }, 'aria-label': v == null ? 'Leeres Feld' : wordSay(symbols[v]) })
          if (v != null) cell.append(wordImg(symbols[v]))
          cell.addEventListener('click', () => onCell(r, c))
          cells.push(cell)
          return cell
        }),
      ),
    )
    const cellAt = (r, c) => cells[r * n + c]

    const symbolButtons = symbols.map((id, v) => {
      const btn = h('button', { class: 'choice sudoku-symbol', style: { animationDelay: `${200 + v * 60}ms` }, 'aria-label': wordSay(id) }, wordImg(id))
      tapOrDrag(btn, {
        canStart: () => !done,
        onStart: () => selectSymbol(v),
        onTap: () => {
          ctx.sfx.tap()
          if (selectedCell) place(selectedCell.r, selectedCell.c, v)
          else selectSymbol(selectedSymbol === v ? null : v)
        },
        onDrop: (point) => {
          const i = cells.findIndex((cell) => hitTest(cell, point, 4))
          if (i >= 0) place(Math.floor(i / n), i % n, v)
        },
      })
      return btn
    })
    palette.replaceChildren(...symbolButtons)

    function selectSymbol(v) {
      selectedSymbol = v
      symbolButtons.forEach((b, i) => b.classList.toggle('selected', i === v))
    }
    function selectCell(pos) {
      selectedCell = pos
      cells.forEach((cell) => cell.classList.remove('selected'))
      if (pos) cellAt(pos.r, pos.c).classList.add('selected')
    }

    function onCell(r, c) {
      if (done || state[r][c] != null) return
      ctx.sfx.tap()
      if (selectedSymbol != null) place(r, c, selectedSymbol)
      else selectCell(selectedCell && selectedCell.r === r && selectedCell.c === c ? null : { r, c })
    }

    function conflictCell(r, c, v) {
      for (let k = 0; k < n; k++) if (k !== c && state[r][k] === v) return { cell: cellAt(r, k), line: T.sudokuRow }
      for (let k = 0; k < n; k++) if (k !== r && state[k][c] === v) return { cell: cellAt(k, c), line: T.sudokuCol }
      return null
    }

    function showHint() {
      // ein Feld suchen, für das nur noch ein Bild in Frage kommt
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (state[r][c] != null) continue
          const cand = sudokuCandidates(state, n, r, c)
          if (cand.length === 1) {
            cellAt(r, c).classList.add('hint-pulse')
            symbolButtons[cand[0]].classList.add('hint-pulse')
            return
          }
        }
      }
    }
    const clearHint = () => [...cells, ...symbolButtons].forEach((el) => el.classList.remove('hint-pulse'))

    async function place(r, c, v) {
      if (done || state[r][c] != null) return
      const cell = cellAt(r, c)
      const conflict = conflictCell(r, c, v)
      if (conflict || solution[r][c] !== v) {
        mistakes++
        roundMistakes++
        ctx.sfx.wrong()
        flash(cell, 'shake', 450)
        if (conflict) flash(conflict.cell, 'conflict', 1200)
        if (roundMistakes >= 2) showHint()
        await ctx.say(conflict ? conflict.line : T.sudokuNotYet)
        return
      }
      clearHint()
      state[r][c] = v
      cell.classList.remove('empty', 'selected')
      cell.classList.add('placed')
      cell.replaceChildren(wordImg(symbols[v]))
      ctx.sfx.pop()
      selectCell(null)
      if (state.every((row) => row.every((x) => x != null))) finished()
    }

    async function finished() {
      done = true
      selectSymbol(null)
      cells.forEach((cell, i) => ctx.timeout(() => flash(cell, 'bounce', 500), i * 40))
      ctx.sfx.correct()
      ctx.burst(grid, { count: 14, spread: 150 })
      await ctx.wait(cells.length * 40 + 200)
      await ctx.praise()
      index++
      ctx.setProgress(index, PUZZLES)
      await ctx.wait(400)
      if (index >= PUZZLES) ctx.finish({ mistakes, rounds: PUZZLES * 2 })
      else startPuzzle()
    }

    ctx.setHelp(() => {
      showHint()
      ctx.sayAll([T.sudokuRule, T.sudokuHowTo])
    })
    if (index === 0) {
      const lines = [T.sudokuRule]
      if (ctx.firstTime) {
        lines.push(T.sudokuHowTo)
        ctx.markIntroHeard()
      }
      ctx.sayAll(lines)
    }
  }

  startPuzzle()
}
