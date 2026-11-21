/**
 * Was passt nicht? – Oberbegriffe bilden.
 * Drei Bilder gehören zusammen, eines nicht. Danach wird erklärt, warum.
 */
import './odd.css'
import { h, pick, flash, makePicker } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { ODD_CATEGORIES, ODD_LEVELS } from '../data/content.js'
import { T, wordSay } from '../data/texts.js'
import { makeOddRound } from './logic.js'

const ROUNDS = 5

export default function oddOneOut(ctx) {
  const { stage, level } = ctx
  const nextCategory = makePicker(ODD_LEVELS[level])
  let round = 0
  let mistakes = 0
  let busy = true

  const grid = h('div', { class: 'odd-grid' })
  stage.append(h('div', { class: 'odd' }, grid))
  ctx.preload([T.oddQuestion])

  async function startRound() {
    busy = true
    let roundMistakes = 0
    ctx.setProgress(round, ROUNDS)
    const r = makeOddRound(nextCategory())
    const explain = ODD_CATEGORIES[r.categoryId].say
    ctx.preload([wordSay(r.odd), explain])

    const buttons = r.options.map((id, i) => {
      const btn = h('button', { class: 'choice odd-choice', style: { animationDelay: `${i * 90}ms` }, 'aria-label': wordSay(id) }, wordImg(id))
      btn.addEventListener('click', () => choose(btn, id))
      return btn
    })
    grid.replaceChildren(...buttons)

    async function choose(btn, id) {
      if (busy) return
      busy = true
      ctx.stopVoice()
      if (id === r.odd) {
        btn.classList.add('right', 'odd-out')
        buttons.forEach((b) => b !== btn && b.classList.add('group'))
        ctx.sfx.correct()
        ctx.burst(btn)
        await ctx.say(wordSay(id))
        await ctx.say(explain)
        await ctx.praise()
        round++
        ctx.setProgress(round, ROUNDS)
        if (round >= ROUNDS) {
          await ctx.wait(300)
          ctx.finish({ mistakes, rounds: ROUNDS })
          return
        }
        await ctx.wait(450)
        startRound()
      } else {
        mistakes++
        roundMistakes++
        ctx.sfx.wrong()
        flash(btn, 'wrong', 500)
        await ctx.say(wordSay(id))
        await ctx.say(roundMistakes >= 2 ? T.oddQuestion : pick(T.tryAgain))
        if (roundMistakes >= 2) buttons[r.options.indexOf(r.odd)]?.classList.add('hint-pulse')
        busy = false
      }
    }

    ctx.setHelp(() => ctx.say(T.oddQuestion))
    busy = false
    await ctx.say(T.oddQuestion)
  }

  startRound()
}
