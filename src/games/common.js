/** Gemeinsame Bausteine für mehrere Spiele. */
import { h, flash } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { wordSay } from '../data/texts.js'

/**
 * Element mit Animation in einen anderen Container verschieben (FLIP).
 * Gibt ein Promise zurück, das nach der Animation erfüllt wird.
 */
export function moveInto(el, container, { duration = 420, before = null, easing = 'cubic-bezier(.3,1.25,.5,1)' } = {}) {
  const from = el.getBoundingClientRect()
  el.style.transform = ''
  el.classList.remove('dragging')
  if (before) container.insertBefore(el, before)
  else container.append(el)
  const to = el.getBoundingClientRect()
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)
  const scale = to.width ? from.width / to.width : 1
  if (!el.animate || (Math.abs(dx) < 1 && Math.abs(dy) < 1)) return Promise.resolve()
  const anim = el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, zIndex: 20 },
      { transform: 'translate(0,0) scale(1)', zIndex: 20 },
    ],
    { duration, easing },
  )
  return anim.finished.catch(() => {})
}

/** Element zu einem Zielpunkt fliegen lassen (z. B. in den Mund des Tieres) und ausblenden. */
export function flyAway(el, target, { duration = 450, scale = 0.2 } = {}) {
  const from = el.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height * 0.55 - (from.top + from.height / 2)
  if (!el.animate) {
    el.remove()
    return Promise.resolve()
  }
  const anim = el.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(${(1 + scale) / 2})`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0 },
    ],
    { duration, easing: 'ease-in', fill: 'forwards' },
  )
  return anim.finished.catch(() => {})
}

/**
 * Tippen ODER Ziehen. onTap() bei kurzem Tippen, onDrop({x,y}) nach dem Ziehen.
 * Während des Ziehens folgt das Element dem Finger.
 */
export function tapOrDrag(el, { onTap, onDrop, onStart, canStart = () => true, threshold = 10 }) {
  let start = null
  let dragging = false
  let pointerId = null

  const reset = () => {
    el.classList.remove('dragging')
    el.style.transform = ''
    el.style.zIndex = ''
    start = null
    dragging = false
    pointerId = null
  }

  el.addEventListener('pointerdown', (e) => {
    if (pointerId !== null || !canStart()) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    pointerId = e.pointerId
    start = { x: e.clientX, y: e.clientY }
    el.setPointerCapture?.(e.pointerId)
  })
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId || !start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (!dragging && Math.hypot(dx, dy) > threshold) {
      dragging = true
      el.classList.add('dragging')
      el.style.zIndex = 30
      onStart?.()
    }
    if (dragging) el.style.transform = `translate(${dx}px, ${dy}px) scale(1.12)`
  })
  const end = (e, cancelled) => {
    if (e.pointerId !== pointerId) return
    const wasDragging = dragging
    const point = { x: e.clientX, y: e.clientY }
    if (!wasDragging) {
      reset()
      if (!cancelled) onTap?.()
      return
    }
    // Ziel unter dem Finger bestimmen, bevor das Element zurückspringt
    const result = cancelled ? false : onDrop?.(point)
    if (result === 'keep') {
      el.classList.remove('dragging')
      start = null
      dragging = false
      pointerId = null
      return
    }
    reset()
  }
  el.addEventListener('pointerup', (e) => end(e, false))
  el.addEventListener('pointercancel', (e) => end(e, true))
  el.addEventListener('lostpointercapture', (e) => {
    if (e.pointerId === pointerId) end(e, true)
  })
}

/** Ist der Punkt innerhalb des Elements (mit Toleranz)? */
export function hitTest(el, { x, y }, pad = 0) {
  const r = el.getBoundingClientRect()
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad
}

/** Würfelbild-Positionen (in %), für 1–10 Punkte. */
const DICE = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
}

/** Punktebild für eine Zahl (Würfel bis 6, darüber Zehnerfeld). */
export function dotPattern(n, { cls = '' } = {}) {
  const el = h('div', { class: `dot-pattern ${cls} ${n > 6 ? 'frame' : 'dice'}`, 'aria-hidden': 'true' })
  if (n <= 6) {
    for (const [x, y] of DICE[n]) el.append(h('span', { style: { left: `${x}%`, top: `${y}%` } }))
  } else {
    for (let i = 0; i < 10; i++) el.append(h('span', { class: i < n ? 'on' : 'off' }))
  }
  return el
}

/** Würfelpositionen für das Zählspiel (strukturiert dargestellte Mengen). */
export function dicePositions(n) {
  return DICE[n] || null
}

/** Optionen nacheinander vorlesen und dabei hervorheben. */
export async function speakChoices(ctx, buttons, texts, { lead = [] } = {}) {
  const all = [...lead, ...texts]
  const offset = lead.length
  const clear = () => buttons.forEach((b) => b.classList.remove('speaking'))
  const done = await ctx.sayAll(all, {
    gap: 180,
    onStart: (i) => {
      clear()
      if (i >= offset) buttons[i - offset]?.classList.add('speaking')
    },
  })
  clear()
  return done
}

/**
 * Bilder-Quiz mit Zielbild oben und 2–4 Antwortbildern (für Anlaute und Reime).
 * makeRound(i) → { target, correct, options, extra? }
 */
export function runPictureQuiz(ctx, { rounds = 5, cls = '', makeRound, renderTarget, question, intro, rightLines, wrongLines, onRight }) {
  const { stage } = ctx
  const target = document.createElement('button')
  target.className = 'quiz-target'
  target.setAttribute('aria-label', 'Frage noch einmal hören')
  const options = document.createElement('div')
  options.className = 'quiz-options'
  const wrap = document.createElement('div')
  wrap.className = `quiz ${cls}`
  wrap.append(target, options)
  stage.append(wrap)

  let round = 0
  let mistakes = 0
  let busy = true

  async function start() {
    busy = true
    let roundMistakes = 0
    const r = makeRound(round)
    ctx.setProgress(round, rounds)
    target.replaceChildren(...renderTarget(r))
    target.classList.remove('pop')
    void target.offsetWidth
    target.classList.add('pop')
    const names = r.options.map((id) => wordSay(id))
    const buttons = r.options.map((id, i) => {
      const btn = h('button', { class: 'choice quiz-choice', style: { animationDelay: `${150 + i * 90}ms` }, 'aria-label': wordSay(id) }, wordImg(id))
      btn.addEventListener('click', () => choose(btn, id))
      return btn
    })
    options.dataset.count = String(buttons.length)
    options.replaceChildren(...buttons)

    const q = question(r)
    ctx.preload([q, ...names, wordSay(r.target), ...rightLines(r)])
    const ask = (lead) => speakChoices(ctx, buttons, names, { lead })
    ctx.setHelp(() => ask([q]))
    target.onclick = () => {
      ctx.sfx.tap()
      ask([q])
    }

    async function choose(btn, id) {
      if (busy) return
      busy = true
      ctx.stopVoice()
      buttons.forEach((b) => b.classList.remove('speaking'))
      if (id === r.correct) {
        btn.classList.add('right')
        buttons.forEach((b) => b !== btn && b.classList.add('dim'))
        ctx.sfx.correct()
        ctx.burst(btn)
        onRight?.(r, btn)
        await ctx.sayAll(rightLines(r), { gap: 120 })
        await ctx.praise()
        round++
        ctx.setProgress(round, rounds)
        if (round >= rounds) {
          await ctx.wait(300)
          ctx.finish({ mistakes, rounds })
          return
        }
        await ctx.wait(450)
        start()
      } else {
        mistakes++
        roundMistakes++
        ctx.sfx.wrong()
        flash(btn, 'wrong', 500)
        btn.classList.add('tried')
        await ctx.sayAll(wrongLines(r, id), { gap: 120 })
        if (roundMistakes >= 2) buttons[r.options.indexOf(r.correct)]?.classList.add('hint-pulse')
        busy = false
      }
    }

    busy = false
    const lead = [q]
    if (round === 0 && intro && ctx.firstTime) {
      lead.unshift(intro)
      ctx.markIntroHeard()
    }
    await ask(lead)
  }

  start()
}
