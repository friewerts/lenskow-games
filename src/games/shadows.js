/**
 * Schatten – Formen erkennen.
 * Jedes Bild wird auf den passenden Schatten gezogen (oder angetippt und dann der Schatten).
 */
import './shadows.css'
import { h, pickN, shuffle, flash } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { SHADOW_POOL } from '../data/content.js'
import { T, wordSay } from '../data/texts.js'
import { tapOrDrag, hitTest, moveInto } from './common.js'

const BOARDS = 3
const PAIRS = { 1: 3, 2: 4, 3: 5 }

export default function shadows(ctx) {
  const { stage, level } = ctx
  const boards = Array.from({ length: BOARDS }, () => [])
  const pool = shuffle(SHADOW_POOL)
  boards.forEach((b, i) => b.push(...pool.slice(i * PAIRS[level], (i + 1) * PAIRS[level])))
  let board = 0
  let mistakes = 0

  const targets = h('div', { class: 'shadow-targets' })
  const tray = h('div', { class: 'shadow-tray' })
  stage.append(h('div', { class: 'shadows' }, targets, tray))
  ctx.preload([T.shadowsHowTo, ...boards.flat().map(wordSay)])

  function startBoard() {
    const ids = boards[board]
    let placed = 0
    let selected = null
    ctx.setProgress(board, BOARDS)

    const targetEls = shuffle(ids).map((id, i) =>
      h('div', { class: 'shadow-slot', role: 'button', tabindex: '0', dataset: { id }, style: { animationDelay: `${i * 70}ms` }, 'aria-label': 'Schatten' }, wordImg(id, { body: true, cls: 'shadow-img' })),
    )
    targets.dataset.count = String(ids.length)
    targets.replaceChildren(...targetEls)

    const select = (el) => {
      selected?.classList.remove('selected')
      selected = el
      el?.classList.add('selected')
    }

    async function tryPlace(item, slot) {
      if (slot.classList.contains('filled')) return false
      if (slot.dataset.id === item.dataset.id) {
        select(null)
        slot.classList.add('filled')
        item.classList.add('placed')
        const shadow = slot.querySelector('.shadow-img')
        moveInto(item, slot).then(() => shadow?.remove())
        ctx.sfx.correct()
        ctx.burst(slot, { count: 8, spread: 60 })
        placed++
        if (placed === ids.length) {
          await ctx.say(wordSay(item.dataset.id))
          await ctx.praise()
          board++
          ctx.setProgress(board, BOARDS)
          if (board >= BOARDS) {
            await ctx.wait(300)
            ctx.finish({ mistakes, rounds: BOARDS * PAIRS[level] })
          } else {
            await ctx.wait(500)
            startBoard()
          }
        } else ctx.say(wordSay(item.dataset.id))
        return true
      }
      mistakes++
      ctx.sfx.wrong()
      flash(slot, 'shake', 450)
      return false
    }

    const items = shuffle(ids).map((id, i) => {
      const item = h('button', { class: 'shadow-item', dataset: { id }, style: { animationDelay: `${200 + i * 70}ms` }, 'aria-label': wordSay(id) }, wordImg(id, { body: true }))
      tapOrDrag(item, {
        canStart: () => !item.classList.contains('placed'),
        onStart: () => {
          select(null)
          ctx.sfx.pick()
        },
        onTap: () => {
          if (item.classList.contains('placed')) return
          ctx.sfx.tap()
          select(selected === item ? null : item)
          if (selected) ctx.say(wordSay(id))
        },
        onDrop: (point) => {
          const slot = targetEls.find((t) => hitTest(t, point, 12))
          if (slot) tryPlace(item, slot)
        },
      })
      return item
    })
    tray.replaceChildren(...items)

    targetEls.forEach((slot) =>
      slot.addEventListener('click', () => {
        if (selected) tryPlace(selected, slot)
      }),
    )

    ctx.setHelp(() => ctx.say(T.shadowsHowTo))
    if (board === 0) ctx.say(T.shadowsHowTo)
  }

  startBoard()
}
