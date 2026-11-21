/**
 * Muster – Regelmäßigkeiten erkennen und fortsetzen.
 * Eine Perlenkette zeigt ein Muster (AB, AAB, ABC …). Was kommt als Nächstes?
 */
import './patterns.css'
import { h, s, shuffle, flash, makePicker, clamp } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { PATTERN_SETS } from '../data/content.js'
import { T } from '../data/texts.js'
import { makePattern } from './logic.js'

const ROUNDS = 5
const UNITS = {
  1: ['AB'],
  2: ['AB', 'AAB', 'ABB', 'ABC'],
  3: ['ABC', 'AABB', 'AAB', 'ABCD', 'ABAC', 'gap'],
}

export default function patterns(ctx) {
  const { stage, level } = ctx
  const nextSet = makePicker(PATTERN_SETS)
  const nextUnit = makePicker(UNITS[level], 1)
  let round = 0
  let mistakes = 0
  let busy = true

  const chain = h('div', { class: 'pattern-chain' })
  const options = h('div', { class: 'pattern-options' })
  stage.append(h('div', { class: 'patterns' }, chain, options))
  ctx.preload([T.patternQuestion, T.patternGap])

  const NOTE = { A: 0, B: 2, C: 4, D: 5 }

  async function playChain(slots, letters) {
    for (let i = 0; i < slots.length; i++) {
      if (!ctx.alive) return
      const letter = letters[i]
      if (slots[i].querySelector('img')) {
        flash(slots[i], 'bead-bounce', 400)
        ctx.sfx.note(NOTE[letter], 0.35)
      }
      await ctx.wait(190)
    }
  }

  async function startRound() {
    busy = true
    let roundMistakes = 0
    ctx.setProgress(round, ROUNDS)
    const set = shuffle(nextSet())
    const map = { A: set[0], B: set[1], C: set[2], D: set[3] }
    const maxSlots = clamp(Math.floor(stage.clientWidth / 62), 6, 9)
    const p = makePattern(nextUnit(), maxSlots)
    const answer = p.items[p.answerIndex]
    const question = p.gap ? T.patternGap : T.patternQuestion

    const slots = p.items.map((letter, i) => {
      const slot = h('div', { class: 'bead', style: { animationDelay: `${i * 50}ms` } })
      if (i === p.answerIndex) {
        slot.classList.add('missing')
        slot.append(h('span', { class: 'bead-q' }, '?'))
      } else slot.append(wordImg(map[letter]))
      return slot
    })
    chain.style.setProperty('--n', p.items.length)
    chain.replaceChildren(s('svg', { class: 'chain-string', viewBox: '0 0 100 10', preserveAspectRatio: 'none' }, s('path', { d: 'M0 5 Q 25 9 50 5 T 100 5' })), ...slots)

    // Antwortmöglichkeiten: alle Bilder des Musters plus eventuell ein weiteres
    const letters = [...new Set(p.unit)]
    const count = level === 1 ? 3 : Math.min(4, Math.max(3, letters.length))
    const optionLetters = shuffle([...letters, ...'ABCD'.split('').filter((l) => !letters.includes(l))].slice(0, count))
    const buttons = optionLetters.map((letter, i) => {
      const btn = h('button', { class: 'choice pattern-choice', style: { animationDelay: `${250 + i * 80}ms` } }, wordImg(map[letter]))
      btn.addEventListener('click', () => choose(btn, letter))
      return btn
    })
    options.replaceChildren(...buttons)

    async function choose(btn, letter) {
      if (busy) return
      busy = true
      ctx.stopVoice()
      if (letter === answer) {
        const target = slots[p.answerIndex]
        btn.classList.add('right')
        ctx.sfx.correct()
        target.classList.remove('missing')
        target.replaceChildren(wordImg(map[letter]))
        flash(target, 'bead-bounce', 500)
        ctx.burst(target)
        buttons.forEach((b) => b !== btn && b.classList.add('dim'))
        await ctx.wait(300)
        await playChain(slots, p.items)
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
        await ctx.tryAgain()
        if (roundMistakes >= 2) {
          // Hilfe: Muster vorspielen und richtige Antwort leuchten lassen
          await playChain(slots, p.items)
          buttons[optionLetters.indexOf(answer)]?.classList.add('hint-pulse')
        }
        busy = false
      }
    }

    ctx.setHelp(async () => {
      await playChain(slots, p.items)
      ctx.say(question)
    })
    await ctx.wait(350)
    await playChain(slots, p.items)
    busy = false
    await ctx.say(question)
  }

  startRound()
}
