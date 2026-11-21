/**
 * Waage – vergleichen und schlussfolgern.
 * Stufe 1: eine Waage („Was ist schwerer?“), ab Stufe 2 zwei Waagen
 * („Was ist am schwersten / leichtesten?“) – dafür muss man beide Waagen verbinden.
 */
import './scale.css'
import { h, s, flash } from '../core/dom.js'
import { SCALE_GIFTS } from '../data/content.js'
import { T, scaleAnswer } from '../data/texts.js'
import { makeScaleRound } from './logic.js'

const ROUNDS = 5
const TILT = 13

/** Geschenk als SVG-Gruppe; Ursprung = Mitte unten. */
function giftShape(gift) {
  return s(
    'g',
    { class: 'gift' },
    s('rect', { x: -24, y: -42, width: 48, height: 42, rx: 6, fill: gift.fill }),
    s('rect', { x: -27, y: -52, width: 54, height: 13, rx: 5, fill: gift.dark }),
    s('rect', { x: -4.5, y: -52, width: 9, height: 52, fill: gift.ribbon }),
    s('path', { d: 'M0 -52c-6-12-20-12-18-3 1 5 10 5 18 3zM0 -52c6-12 20-12 18-3-1 5-10 5-18 3z', fill: gift.ribbon, stroke: gift.dark, 'stroke-width': 1.5 }),
  )
}

function giftIcon(gift) {
  return s('svg', { viewBox: '-34 -70 68 74', class: 'gift-icon', 'aria-hidden': 'true' }, giftShape(gift))
}

/** Balkenwaage; Rückgabe: { el, tilt(direction) } (direction: -1 links schwer, 1 rechts schwer). */
function balance(left, right) {
  const pan = (x, gift, cls) =>
    s(
      'g',
      { class: `pan ${cls}`, style: `transform-origin:${x}px 70px` },
      s('line', { x1: x - 50, y1: 152, x2: x, y2: 70, class: 'string' }),
      s('line', { x1: x + 50, y1: 152, x2: x, y2: 70, class: 'string' }),
      s('path', { d: `M${x - 60} 152h120c-6 14-26 20-60 20s-54-6-60-20z`, class: 'pan-bowl' }),
      s('g', { transform: `translate(${x} 154) scale(1.3)` }, giftShape(gift)),
    )
  const beam = s(
    'g',
    { class: 'beam' },
    s('rect', { x: 60, y: 62, width: 280, height: 14, rx: 7, class: 'beam-bar' }),
    s('circle', { cx: 80, cy: 69, r: 6, class: 'beam-hook' }),
    s('circle', { cx: 320, cy: 69, r: 6, class: 'beam-hook' }),
    pan(80, left, 'pan-left'),
    pan(320, right, 'pan-right'),
  )
  const el = s(
    'svg',
    { viewBox: '0 0 400 270', class: 'balance', role: 'img', 'aria-label': 'Waage' },
    s('path', { d: 'M150 262h100l-22-26h-56z', class: 'balance-base' }),
    s('rect', { x: 193, y: 70, width: 14, height: 170, rx: 7, class: 'balance-pole' }),
    beam,
    s('circle', { cx: 200, cy: 69, r: 13, class: 'balance-pivot' }),
  )
  return {
    el,
    tilt(direction) {
      // negativer Winkel = gegen den Uhrzeigersinn = linke Seite geht nach unten
      const angle = direction * TILT
      beam.style.transform = `rotate(${angle}deg)`
      beam.querySelectorAll('.pan').forEach((p) => (p.style.transform = `rotate(${-angle}deg)`))
    },
  }
}

export default function scale(ctx) {
  const { stage, level } = ctx
  let round = 0
  let mistakes = 0
  let busy = true

  const scalesEl = h('div', { class: 'scales' })
  const options = h('div', { class: 'scale-options' })
  stage.append(h('div', { class: 'scale-game' }, scalesEl, options))
  ctx.preload([T.scaleHowTo, T.scaleHeavier, T.scaleHeaviest, T.scaleLightest])

  async function startRound() {
    busy = true
    let roundMistakes = 0
    ctx.setProgress(round, ROUNDS)
    const r = makeScaleRound(level, SCALE_GIFTS.length)
    const question = { heavier: T.scaleHeavier, heaviest: T.scaleHeaviest, lightest: T.scaleLightest }[r.question]
    const answerLine = scaleAnswer(SCALE_GIFTS[r.answer], r.question)
    ctx.preload([question, answerLine])

    const balances = r.scales.map((sc) => balance(SCALE_GIFTS[sc.left], SCALE_GIFTS[sc.right]))
    scalesEl.dataset.count = String(balances.length)
    scalesEl.replaceChildren(...balances.map((b, i) => h('div', { class: 'balance-wrap', style: { animationDelay: `${i * 150}ms` } }, b.el)))

    const buttons = r.gifts.map((g, i) => {
      const btn = h('button', { class: 'choice scale-choice', style: { animationDelay: `${300 + i * 90}ms` }, 'aria-label': SCALE_GIFTS[g].name }, giftIcon(SCALE_GIFTS[g]))
      btn.addEventListener('click', () => choose(btn, g))
      return btn
    })
    options.replaceChildren(...buttons)

    // Waagen neigen sich nacheinander
    await ctx.wait(500)
    for (const [i, sc] of r.scales.entries()) {
      balances[i].tilt(sc.heavy === sc.left ? -1 : 1)
      ctx.sfx.stamp()
      await ctx.wait(650)
    }

    async function choose(btn, g) {
      if (busy) return
      busy = true
      ctx.stopVoice()
      if (g === r.answer) {
        btn.classList.add('right')
        buttons.forEach((b) => b !== btn && b.classList.add('dim'))
        ctx.sfx.correct()
        ctx.burst(btn)
        await ctx.say(answerLine)
        await ctx.praise()
        round++
        ctx.setProgress(round, ROUNDS)
        await ctx.wait(450)
        if (round >= ROUNDS) ctx.finish({ mistakes, rounds: ROUNDS })
        else startRound()
      } else {
        mistakes++
        roundMistakes++
        ctx.sfx.wrong()
        flash(btn, 'wrong', 500)
        btn.classList.add('tried')
        if (roundMistakes >= 2) {
          scalesEl.querySelectorAll('.balance-wrap').forEach((w) => flash(w, 'bounce', 600))
          await ctx.sayAll([T.scaleHowTo, question])
        } else await ctx.tryAgain()
        busy = false
      }
    }

    ctx.setHelp(() => ctx.sayAll([T.scaleHowTo, question]))
    busy = false
    const lines = [question]
    if (round === 0) {
      lines.unshift(T.scaleHowTo)
      ctx.markIntroHeard()
    }
    await ctx.sayAll(lines)
  }

  startRound()
}

