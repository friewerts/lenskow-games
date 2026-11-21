/**
 * Wer wohnt wo? – logisches Schließen mit Hinweisen.
 * Bildkarten (Tier ✓/✗ Haus) werden vorgelesen; das Kind setzt jedes Tier in sein Haus.
 */
import './houses.css'
import { h, s, pickN, shuffle, flash } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { ICON } from '../core/icons.js'
import { HOUSE_ANIMALS, HOUSE_COLORS } from '../data/content.js'
import { T, houseClue, wordSay } from '../data/texts.js'
import { makeHousePuzzle } from './logic.js'
import { tapOrDrag, hitTest, moveInto } from './common.js'

const ROUNDS = 4

function houseSvg(color, { mini = false } = {}) {
  return s(
    'svg',
    { viewBox: '0 0 100 100', class: mini ? 'house-svg mini' : 'house-svg', 'aria-hidden': 'true' },
    s('path', { d: 'M6 46 50 8 94 46Z', fill: color.dark, 'stroke-linejoin': 'round' }),
    s('rect', { x: 16, y: 40, width: 68, height: 56, rx: 7, fill: color.fill }),
    s('rect', { x: 26, y: 50, width: 14, height: 14, rx: 3, fill: '#fff', opacity: 0.85 }),
    s('rect', { x: 60, y: 50, width: 14, height: 14, rx: 3, fill: '#fff', opacity: 0.85 }),
    mini ? s('rect', { x: 40, y: 70, width: 20, height: 26, rx: 4, fill: color.dark }) : null,
  )
}

export default function houses(ctx) {
  const { stage, level } = ctx
  let round = 0
  let mistakes = 0

  const cluesEl = h('div', { class: 'house-clues' })
  const row = h('div', { class: 'house-row' })
  const tray = h('div', { class: 'house-tray' })
  stage.append(h('div', { class: 'houses' }, cluesEl, row, tray))
  ctx.preload([T.housesHowTo, T.housesDrag, T.housesWrong, T.housesRight])

  function startRound() {
    ctx.setProgress(round, ROUNDS)
    const puzzle = makeHousePuzzle(level)
    const animals = pickN(HOUSE_ANIMALS, puzzle.n)
    const colors = pickN(HOUSE_COLORS, puzzle.n)
    const clueTexts = puzzle.clues.map((cl) => houseClue(animals[cl.animal], colors[cl.house], cl.positive))
    ctx.preload(clueTexts)
    let busy = false
    let selected = null

    // Hinweiskarten
    const clueCards = puzzle.clues.map((cl, i) =>
      h(
        'button',
        { class: `clue-card ${cl.positive ? 'yes' : 'no'}`, style: { animationDelay: `${i * 120}ms` }, 'aria-label': clueTexts[i] },
        wordImg(animals[cl.animal].id),
        h('span', { class: 'clue-badge', html: cl.positive ? ICON.check : ICON.close }),
        houseSvg(colors[cl.house], { mini: true }),
      ),
    )
    clueCards.forEach((card, i) => card.addEventListener('click', () => (ctx.sfx.tap(), ctx.say(clueTexts[i]))))
    cluesEl.replaceChildren(...clueCards)

    // Häuser
    const houseEls = colors.map((color, k) => {
      const slot = h('div', { class: 'house-slot' })
      const el = h('div', { class: 'house', role: 'button', tabindex: '0', dataset: { k }, style: { animationDelay: `${150 + k * 90}ms` }, 'aria-label': `Haus ${color.id}` }, houseSvg(color), slot)
      el.addEventListener('click', () => {
        if (selected) putInto(selected, k)
      })
      return el
    })
    row.replaceChildren(...houseEls)
    const slotOf = (k) => houseEls[k].querySelector('.house-slot')

    // Tiere
    const animalEls = shuffle(animals.map((a, i) => ({ a, i }))).map(({ a, i }) => {
      const el = h('button', { class: 'house-animal', dataset: { i }, 'aria-label': wordSay(a.id) }, wordImg(a.id))
      tapOrDrag(el, {
        canStart: () => !busy,
        onStart: () => select(null),
        onTap: () => {
          if (busy) return
          ctx.sfx.tap()
          if (el.parentElement !== tray) {
            moveInto(el, tray)
            select(null)
            return
          }
          select(selected === el ? null : el)
        },
        onDrop: (point) => {
          const k = houseEls.findIndex((hEl) => hitTest(hEl, point, 10))
          if (k >= 0) putInto(el, k)
          else if (el.parentElement !== tray && hitTest(tray, point, 30)) moveInto(el, tray)
        },
      })
      return el
    })
    tray.replaceChildren(...animalEls)

    function select(el) {
      selected?.classList.remove('selected')
      selected = el
      el?.classList.add('selected')
    }

    function putInto(el, k) {
      if (busy) return
      const slot = slotOf(k)
      const occupant = slot.querySelector('.house-animal')
      if (occupant === el) return
      if (occupant) moveInto(occupant, tray)
      moveInto(el, slot)
      ctx.sfx.pop()
      select(null)
      if (animalEls.every((a) => a.parentElement !== tray)) check()
    }

    async function check() {
      busy = true
      await ctx.wait(350)
      const placement = []
      houseEls.forEach((_, k) => {
        const a = slotOf(k).querySelector('.house-animal')
        if (a) placement[Number(a.dataset.i)] = k
      })
      const broken = puzzle.clues.findIndex((cl) => (placement[cl.animal] === cl.house) !== cl.positive)
      if (broken < 0) {
        ctx.sfx.correct()
        houseEls.forEach((el, k) => ctx.timeout(() => flash(el, 'bounce', 600), k * 120))
        ctx.burst(row, { count: 14, spread: 160 })
        await ctx.say(T.housesRight)
        round++
        ctx.setProgress(round, ROUNDS)
        await ctx.wait(500)
        if (round >= ROUNDS) ctx.finish({ mistakes, rounds: ROUNDS })
        else startRound()
        return
      }
      mistakes++
      ctx.sfx.wrong()
      const card = clueCards[broken]
      card.classList.add('broken')
      flash(card, 'shake', 500)
      await ctx.say(T.housesWrong)
      await ctx.say(clueTexts[broken])
      card.classList.remove('broken')
      busy = false
    }

    const readClues = (lead = []) =>
      ctx.sayAll([...lead, ...clueTexts], {
        gap: 300,
        onStart: (i) => clueCards.forEach((c, k) => c.classList.toggle('speaking', k === i - lead.length)),
      }).then(() => clueCards.forEach((c) => c.classList.remove('speaking')))

    ctx.setHelp(() => readClues([T.housesDrag]))
    const lead = round === 0 ? [T.housesHowTo] : []
    if (round === 0 && ctx.firstTime) {
      lead.push(T.housesDrag)
      ctx.markIntroHeard()
    }
    readClues(lead)
  }

  startRound()
}
