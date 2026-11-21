/**
 * Memory – Gedächtnis und Konzentration.
 * Karten umdrehen und Paare finden. Jedes aufgedeckte Bild wird benannt.
 */
import './memory.css'
import { h, pick, pickN, shuffle } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { ICON } from '../core/icons.js'
import { MEMORY_THEMES } from '../data/content.js'
import { T, wordSay } from '../data/texts.js'

const PAIRS = { 1: 3, 2: 4, 3: 6 }

export default function memory(ctx) {
  const { stage, level } = ctx
  const pairs = PAIRS[level]
  const ids = pickN(pick(MEMORY_THEMES), pairs)
  const deck = shuffle([...ids, ...ids])
  let first = null
  let lock = false
  let found = 0
  let mismatches = 0

  const grid = h('div', { class: 'mem-grid' })
  stage.append(h('div', { class: 'memory' }, grid))
  ctx.preload([T.memoryHowTo, ...ids.map(wordSay)])
  ctx.setProgress(0, pairs)

  const cards = deck.map((id, i) => {
    const card = h(
      'button',
      { class: 'mem-card', dataset: { id }, style: { animationDelay: `${i * 50}ms` }, 'aria-label': 'Karte' },
      h('span', { class: 'mem-inner' }, h('span', { class: 'mem-face mem-back', html: ICON.star }), h('span', { class: 'mem-face mem-front' }, wordImg(id))),
    )
    card.addEventListener('click', () => flip(card))
    return card
  })
  grid.replaceChildren(...cards)

  // Raster so wählen, dass die Karten möglichst groß werden
  const layout = () => {
    const W = stage.clientWidth - 28
    const H = stage.clientHeight - 20
    const n = cards.length
    let best = { cols: 2, size: 0 }
    for (let cols = 2; cols <= 6; cols++) {
      const rows = Math.ceil(n / cols)
      const gap = 14
      const size = Math.min((W - (cols - 1) * gap) / cols, (H - (rows - 1) * gap) / rows)
      if (size > best.size) best = { cols, size }
    }
    grid.style.setProperty('--cols', best.cols)
    grid.style.setProperty('--card', `${Math.floor(Math.min(best.size, 220))}px`)
  }
  const observer = new ResizeObserver(layout)
  observer.observe(stage)
  ctx.onDispose(() => observer.disconnect())
  layout()

  async function flip(card) {
    if (lock || card.classList.contains('open') || card.classList.contains('matched')) return
    card.classList.add('open')
    ctx.sfx.flip()
    const id = card.dataset.id
    ctx.say(wordSay(id))
    if (!first) {
      first = card
      return
    }
    const a = first
    first = null
    if (a.dataset.id === id) {
      found++
      await ctx.wait(350)
      a.classList.add('matched')
      card.classList.add('matched')
      ctx.sfx.correct()
      ctx.burst(card, { count: 8, spread: 60 })
      ctx.setProgress(found, pairs)
      if (found === pairs) {
        lock = true
        await ctx.wait(500)
        await ctx.praise()
        ctx.finish({ mistakes: Math.max(0, mismatches - pairs), rounds: pairs })
      }
    } else {
      mismatches++
      lock = true
      await ctx.wait(1100)
      a.classList.remove('open')
      card.classList.remove('open')
      ctx.sfx.flip()
      lock = false
    }
  }

  ctx.setHelp(() => ctx.say(T.memoryHowTo))
  ctx.say(T.memoryHowTo)
}
