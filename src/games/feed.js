/**
 * Tiere füttern – Mengen bilden.
 * Ein Tier wünscht sich eine bestimmte Anzahl Futter. Das Kind legt das Futter
 * auf den Teller (tippen oder ziehen) und bestätigt mit dem Haken.
 */
import './feed.css'
import { h, pick, pickN, shuffle, randInt, flash, clamp } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { ICON } from '../core/icons.js'
import { FEED_ANIMALS } from '../data/content.js'
import { T, feedRequest, numberWord } from '../data/texts.js'
import { moveInto, flyAway, tapOrDrag, hitTest, dotPattern } from './common.js'

const ROUNDS = 5
const RANGE = { 1: [1, 5], 2: [3, 8], 3: [5, 10] }

/** Zielzahlen: möglichst verschieden und gut über den Bereich verteilt. */
function makeTargets(lo, hi, n) {
  const pool = shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i))
  const out = []
  while (out.length < n) out.push(...shuffle(pool))
  return out.slice(0, n)
}

export default function feed(ctx) {
  const { stage, level } = ctx
  const animals = pickN(FEED_ANIMALS, ROUNDS)
  const targets = makeTargets(...RANGE[level], ROUNDS)
  let round = 0
  let mistakes = 0
  let roundMistakes = 0
  let busy = true

  const animalBox = h('div', { class: 'feed-animal' })
  const bubble = h('div', { class: 'feed-bubble', 'aria-live': 'polite' })
  const plateItems = h('div', { class: 'plate-items' })
  const plate = h('div', { class: 'feed-plate' }, plateItems)
  const tray = h('div', { class: 'feed-tray' })
  const check = h('button', { class: 'big-btn btn-green feed-check', 'aria-label': 'Fertig', html: ICON.check })
  const scene = h(
    'div',
    { class: `feed ${level === 1 ? 'show-numbers' : ''}` },
    h('div', { class: 'feed-top' }, animalBox, bubble),
    plate,
    h('div', { class: 'feed-bottom' }, tray, check),
  )
  stage.append(scene)

  ctx.preload([T.feedHungry, T.feedHowTo, T.feedTooFew, T.feedTooMany, T.feedEmpty, ...T.feedYummy, ...Array.from({ length: 12 }, (_, i) => numberWord(i + 1))])
  ctx.preload(animals.map((a, i) => feedRequest(a, targets[i])))

  const count = () => plateItems.children.length
  const renumber = () => [...plateItems.children].forEach((el, i) => (el.dataset.n = i + 1))

  // Jedes Futter hat einen festen Platz auf dem Tablett, damit nichts verrutscht.
  const inTray = (el) => el.parentElement?.classList.contains('tray-slot')

  function toPlate(el) {
    if (busy || !inTray(el)) return
    ctx.sfx.pop()
    moveInto(el, plateItems)
    renumber()
    ctx.say(numberWord(count()))
  }

  function toTray(el) {
    if (busy || el.parentElement !== plateItems) return
    ctx.sfx.pick()
    const slot = [...tray.children].find((s) => !s.firstChild)
    if (slot) moveInto(el, slot)
    delete el.dataset.n
    renumber()
    if (count()) ctx.say(numberWord(count()))
    else ctx.stopVoice()
  }

  function makeFood(foodId) {
    const el = h('button', { class: 'food', 'aria-label': 'Futter' }, wordImg(foodId))
    tapOrDrag(el, {
      canStart: () => !busy,
      onTap: () => (inTray(el) ? toPlate(el) : toTray(el)),
      onDrop: (point) => {
        if (inTray(el) && hitTest(plate, point, 24)) toPlate(el)
        else if (el.parentElement === plateItems && !hitTest(plate, point, 10)) toTray(el)
      },
    })
    return el
  }

  async function startRound() {
    busy = true
    roundMistakes = 0
    const animal = animals[round]
    const target = targets[round]
    scene.classList.toggle('show-numbers', level === 1)
    ctx.setProgress(round, ROUNDS)

    animalBox.replaceChildren(wordImg(animal.id, { cls: 'feed-animal-img' }))
    flash(animalBox, 'enter', 700)
    bubble.replaceChildren(h('span', { class: 'bubble-number' }, String(target)), level === 1 ? dotPattern(target, { cls: 'bubble-dots' }) : null)
    flash(bubble, 'enter', 700)

    plateItems.replaceChildren()
    const supply = clamp(target + randInt(2, 4), 5, 12)
    tray.replaceChildren(
      ...Array.from({ length: supply }, (_, i) => {
        const food = makeFood(animal.food)
        food.style.animationDelay = `${150 + i * 35}ms`
        return h('div', { class: 'tray-slot' }, food)
      }),
    )
    ctx.sfx.whoosh()

    const request = feedRequest(animal, target)
    ctx.setHelp(() => ctx.sayAll([request, T.feedHowTo]))
    busy = false

    const lines = [T.feedHungry, request]
    if (round === 0 && ctx.firstTime) {
      lines.push(T.feedHowTo)
      ctx.markIntroHeard()
    }
    await ctx.sayAll(round === 0 ? lines : [request])
  }

  async function onCheck() {
    if (busy) return
    const n = count()
    const target = targets[round]
    if (n === 0) {
      ctx.sfx.tap()
      ctx.say(T.feedEmpty)
      flash(plate, 'shake', 500)
      return
    }
    busy = true
    if (n === target) {
      ctx.sfx.correct()
      flash(check, 'bounce', 600)
      await ctx.wait(250)
      const img = animalBox.querySelector('img')
      const items = [...plateItems.children]
      items.forEach((el, i) => setTimeout(() => flyAway(el, img).then(() => el.remove()), i * 110))
      ctx.sfx.munch()
      await ctx.wait(items.length * 110 + 400)
      flash(animalBox, 'happy', 900)
      ctx.burst(animalBox, { count: 12, spread: 110 })
      await ctx.say(pick(T.feedYummy))
      round++
      ctx.setProgress(round, ROUNDS)
      if (round >= ROUNDS) {
        await ctx.wait(400)
        ctx.finish({ mistakes, rounds: ROUNDS })
        return
      }
      await ctx.wait(350)
      startRound()
    } else {
      mistakes++
      roundMistakes++
      ctx.sfx.wrong()
      flash(animalBox, 'shake', 500)
      if (roundMistakes >= 2) {
        // Hilfe: Zahlen auf dem Teller und Punktebild in der Sprechblase
        scene.classList.add('show-numbers')
        if (!bubble.querySelector('.dot-pattern')) bubble.append(dotPattern(target, { cls: 'bubble-dots' }))
      }
      busy = false
      await ctx.say(n < target ? T.feedTooFew : T.feedTooMany)
      if (roundMistakes >= 2) await ctx.say(feedRequest(animals[round], target))
    }
  }

  check.addEventListener('click', onCheck)
  startRound()
}
