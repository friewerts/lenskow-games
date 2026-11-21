/**
 * Reihenfolge – Abläufe verstehen und ordnen.
 * Abwechselnd: Was passiert zuerst? (Ei → Küken → Huhn) und Sortieren nach Größe.
 */
import './order.css'
import { h, shuffle, flash, makePicker } from '../core/dom.js'
import { emoji, wordImg } from '../core/img.js'
import { ORDER_SEQUENCES, ORDER_SIZE_ITEMS } from '../data/content.js'
import { T } from '../data/texts.js'
import { makeSizeOrder } from './logic.js'
import { tapOrDrag, hitTest, moveInto } from './common.js'

const ROUNDS = 5
const MAX_STEPS = { 1: 3, 2: 4, 3: 5 }

export default function order(ctx) {
  const { stage, level } = ctx
  const sequences = ORDER_SEQUENCES.filter((sq) => sq.level <= level && sq.icons.length <= MAX_STEPS[level])
  const nextSequence = makePicker(sequences)
  const nextSizeItem = makePicker(ORDER_SIZE_ITEMS)
  let round = 0
  let mistakes = 0

  const slotsEl = h('div', { class: 'order-slots' })
  const tray = h('div', { class: 'order-tray' })
  const wrap = h('div', { class: 'order' }, slotsEl, tray)
  stage.append(wrap)
  ctx.preload([T.orderTime, T.orderSmallBig, T.orderBigSmall, T.orderWrong, ...sequences.map((sq) => sq.say)])

  function startRound() {
    ctx.setProgress(round, ROUNDS)
    const kind = round % 2 === 0 ? 'time' : 'size'
    let cardsData
    let question
    let story = null
    if (kind === 'time') {
      const seq = nextSequence()
      cardsData = seq.icons.map((icon, rank) => ({ rank, node: () => emoji(icon) }))
      question = T.orderTime
      story = seq.say
    } else {
      const sz = makeSizeOrder(level, [nextSizeItem()])
      cardsData = sz.scales.map((scale, rank) => ({ rank, scale, node: () => wordImg(sz.item) }))
      question = sz.descending ? T.orderBigSmall : T.orderSmallBig
    }
    const n = cardsData.length
    let busy = false
    wrap.style.setProperty('--n', n)

    const slots = cardsData.map((_, i) => h('div', { class: 'order-slot', dataset: { i }, style: { animationDelay: `${i * 80}ms` } }, h('span', { class: 'slot-number' }, String(i + 1))))
    slotsEl.replaceChildren(...slots.flatMap((slot, i) => (i ? [h('span', { class: 'order-arrow', 'aria-hidden': 'true' }, '›'), slot] : [slot])))

    const cards = shuffle(cardsData).map((d, i) => {
      const img = d.node()
      if (d.scale) img.style.transform = `scale(${d.scale})`
      const card = h('button', { class: 'order-card', dataset: { rank: d.rank }, style: { animationDelay: `${250 + i * 70}ms` }, 'aria-label': `Bild ${i + 1}` }, img)
      tapOrDrag(card, {
        canStart: () => !busy && !card.classList.contains('locked'),
        onTap: () => {
          if (busy || card.classList.contains('locked')) return
          ctx.sfx.tap()
          if (card.parentElement === tray) {
            const free = slots.find((sl) => !sl.querySelector('.order-card'))
            if (free) put(card, free)
          } else moveInto(card, tray)
        },
        onDrop: (point) => {
          const slot = slots.find((sl) => hitTest(sl, point, 8))
          if (slot) put(card, slot)
          else if (card.parentElement !== tray && hitTest(tray, point, 30)) moveInto(card, tray)
        },
      })
      return card
    })
    tray.replaceChildren(...cards)

    function put(card, slot) {
      const occupant = slot.querySelector('.order-card')
      if (occupant === card) return
      if (occupant?.classList.contains('locked')) return
      if (occupant) moveInto(occupant, tray)
      moveInto(card, slot)
      ctx.sfx.pop()
      if (slots.every((sl) => sl.querySelector('.order-card'))) check()
    }

    async function check() {
      busy = true
      await ctx.wait(350)
      const wrong = slots.filter((sl, i) => Number(sl.querySelector('.order-card').dataset.rank) !== i)
      if (!wrong.length) {
        ctx.sfx.correct()
        ctx.burst(slotsEl, { count: 14, spread: 160 })
        for (const [i, sl] of slots.entries()) {
          sl.querySelector('.order-card').classList.add('locked')
          flash(sl, 'bounce', 500)
          ctx.sfx.note([0, 2, 3, 5, 6][i] ?? i, 0.35)
          await ctx.wait(180)
        }
        if (story) await ctx.say(story)
        await ctx.praise()
        round++
        ctx.setProgress(round, ROUNDS)
        await ctx.wait(400)
        if (round >= ROUNDS) ctx.finish({ mistakes, rounds: ROUNDS })
        else startRound()
        return
      }
      mistakes++
      ctx.sfx.wrong()
      slots.forEach((sl) => {
        const card = sl.querySelector('.order-card')
        if (wrong.includes(sl)) flash(card, 'shake', 450)
        else card.classList.add('locked')
      })
      await ctx.wait(500)
      wrong.forEach((sl) => moveInto(sl.querySelector('.order-card'), tray))
      busy = false
      await ctx.say(T.orderWrong)
    }

    ctx.setHelp(() => ctx.say(question))
    ctx.say(question)
  }

  startRound()
}
