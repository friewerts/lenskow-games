/**
 * Wie viele? – Mengen erfassen und der richtigen Zahl zuordnen.
 * Bilder lassen sich antippen und werden dabei laut mitgezählt.
 */
import './count.css'
import { h, pick, shuffle, randInt, flash, makePicker } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { COUNT_THINGS } from '../data/content.js'
import { T, countQuestion, numberWord, numberExclaim } from '../data/texts.js'
import { dicePositions } from './common.js'

const ROUNDS = 5
const LEVELS = {
  1: { range: [1, 5], options: 3, kinds: ['scatter', 'scatter', 'dice'] },
  2: { range: [3, 8], options: 3, kinds: ['scatter', 'rows', 'dice', 'scatter'] },
  3: { range: [5, 10], options: 4, kinds: ['scatter', 'rows', 'scatter'] },
}

function makeOptions(answer, count, max) {
  const set = new Set([answer])
  const near = shuffle([answer - 1, answer + 1, answer - 2, answer + 2, answer + 3, answer - 3]).filter((n) => n >= 1 && n <= max)
  for (const n of near) {
    if (set.size >= count) break
    set.add(n)
  }
  while (set.size < count) set.add(randInt(1, max))
  return [...set].sort((a, b) => a - b)
}

/** Zufällige, nicht überlappende Positionen (in %) auf einem lockeren Raster. */
function scatterPositions(n, wide) {
  const cols = wide ? 5 : 3
  const rows = wide ? 3 : 4
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, n)
  return cells.map((c) => {
    const col = c % cols
    const row = Math.floor(c / cols)
    return [((col + 0.5 + (Math.random() - 0.5) * 0.35) / cols) * 100, ((row + 0.5 + (Math.random() - 0.5) * 0.35) / rows) * 100]
  })
}

export default function count(ctx) {
  const { stage, level } = ctx
  const cfg = LEVELS[level]
  const nextThing = makePicker(COUNT_THINGS)
  const nextKind = makePicker(cfg.kinds, 0)
  let round = 0
  let mistakes = 0
  let busy = true
  let lastAnswer = 0

  const field = h('div', { class: 'count-field' })
  const answers = h('div', { class: 'count-answers' })
  stage.append(h('div', { class: 'count' }, field, answers))
  ctx.preload([T.countHowTo, T.countHint, T.diceQuestion, ...Array.from({ length: 10 }, (_, i) => numberWord(i + 1)), ...Array.from({ length: 10 }, (_, i) => numberExclaim(i + 1))])

  async function startRound() {
    busy = true
    ctx.setProgress(round, ROUNDS)
    let answer
    do answer = randInt(...cfg.range)
    while (answer === lastAnswer)
    lastAnswer = answer
    let kind = nextKind()
    if (kind === 'dice' && answer > 6) kind = 'scatter'
    if (kind === 'rows' && answer < 4) kind = 'scatter'
    const thing = nextThing()
    const question = kind === 'dice' ? T.diceQuestion : countQuestion(thing)
    ctx.preload([question])

    // Spielfeld aufbauen
    let tapped = 0
    const items = []
    field.className = `count-field kind-${kind}`
    field.replaceChildren()
    if (kind === 'dice') {
      const die = h('div', { class: 'die' })
      for (const [x, y] of dicePositions(answer)) {
        const pip = h('button', { class: 'pip count-item', style: { left: `${x}%`, top: `${y}%` }, 'aria-label': 'Punkt' })
        die.append(pip)
        items.push(pip)
      }
      field.append(die)
    } else if (kind === 'rows') {
      const frame = h('div', { class: 'ten-frame' })
      for (let i = 0; i < 10; i++) {
        const cell = h('div', { class: 'frame-cell' })
        if (i < answer) {
          const item = h('button', { class: 'count-item', 'aria-label': thing.many }, wordImg(thing.id))
          cell.append(item)
          items.push(item)
        }
        frame.append(cell)
      }
      field.append(frame)
    } else {
      const wide = stage.clientWidth > stage.clientHeight * 1.15
      scatterPositions(answer, wide).forEach(([x, y], i) => {
        const item = h('button', { class: 'count-item scattered', style: { left: `${x}%`, top: `${y}%`, '--r': `${randInt(-14, 14)}deg`, animationDelay: `${i * 60}ms` }, 'aria-label': thing.many }, wordImg(thing.id))
        field.append(item)
        items.push(item)
      })
    }
    items.forEach((item) =>
      item.addEventListener('click', () => {
        if (item.dataset.n) return
        tapped++
        item.dataset.n = tapped
        item.classList.add('counted')
        ctx.sfx.step(tapped)
        ctx.say(numberWord(tapped))
      }),
    )

    // Antworten
    let roundMistakes = 0
    const options = makeOptions(answer, cfg.options, Math.max(cfg.range[1], 6))
    const buttons = options.map((n, i) => {
      const btn = h('button', { class: 'choice number-choice', style: { animationDelay: `${200 + i * 70}ms` }, 'aria-label': numberWord(n) }, String(n))
      btn.addEventListener('click', () => choose(btn, n))
      return btn
    })
    answers.replaceChildren(...buttons)

    async function choose(btn, n) {
      if (busy) return
      busy = true
      ctx.stopVoice()
      if (n === answer) {
        btn.classList.add('right')
        buttons.forEach((b) => b !== btn && b.classList.add('dim'))
        ctx.sfx.correct()
        ctx.burst(btn)
        items.forEach((item, i) => setTimeout(() => flash(item, 'bounce', 600), i * 70))
        await ctx.say(numberExclaim(answer))
        await ctx.praise()
        round++
        ctx.setProgress(round, ROUNDS)
        if (round >= ROUNDS) {
          await ctx.wait(300)
          ctx.finish({ mistakes, rounds: ROUNDS })
          return
        }
        await ctx.wait(400)
        startRound()
      } else {
        mistakes++
        roundMistakes++
        ctx.sfx.wrong()
        flash(btn, 'wrong', 500)
        btn.classList.add('tried')
        if (roundMistakes >= 2) {
          // Gemeinsam zählen
          await ctx.say(T.countHint)
          items.forEach((item) => {
            delete item.dataset.n
            item.classList.remove('counted')
          })
          for (let i = 0; i < items.length; i++) {
            items[i].dataset.n = i + 1
            items[i].classList.add('counted')
            flash(items[i], 'bounce', 500)
            ctx.sfx.step(i)
            await ctx.say(numberWord(i + 1))
          }
          tapped = items.length
          buttons.find((b) => b.textContent === String(answer))?.classList.add('hint-pulse')
        } else {
          await ctx.tryAgain()
        }
        busy = false
      }
    }

    ctx.setHelp(() => ctx.sayAll([question, T.countHowTo]))
    busy = false
    const lines = [question]
    if (round === 0 && ctx.firstTime) {
      lines.push(T.countHowTo)
      ctx.markIntroHeard()
    }
    await ctx.sayAll(lines)
  }

  startRound()
}
