/**
 * Spielrahmen: Kopfzeile (Start, Fortschritt, Eule), Spielfläche,
 * gemeinsame Hilfsfunktionen für alle Spiele und die Belohnung am Ende.
 */
import { h, pick, sleep, flash } from './dom.js'
import { ICON } from './icons.js'
import { emoji, wordImg } from './img.js'
import { say, sayAll, stopVoice, onSpeaking, preloadVoice, isSpeaking } from './voice.js'
import { sfx, unlockAudio } from './sfx.js'
import { burst, confetti } from './effects.js'
import { go, goHome, mountError } from './app.js'
import { T, wordSay } from '../data/texts.js'
import { gameById } from '../games/index.js'
import { levelFor, recordResult, awardSticker, introHeard, markIntroHeard, markDailyDone } from './store.js'
import { whenSplashClosed } from '../screens/splash.js'

export async function mount(screen, gameId) {
  const meta = gameById(gameId)
  if (!meta) {
    go('', { replace: true })
    return
  }
  screen.classList.add('game-screen', `area-${meta.area}`, `game-${meta.id}`)

  const owl = owlButton()
  const progress = h('div', { class: 'progress', 'aria-hidden': 'true' })
  const header = h(
    'header',
    { class: 'game-header' },
    h('button', {
      class: 'round-btn home-btn',
      'aria-label': 'Zurück zur Übersicht',
      html: ICON.home,
      onclick: () => {
        sfx.tap()
        goHome()
      },
    }),
    progress,
    owl.el,
  )
  const stage = h('main', { class: 'stage' })
  screen.append(header, stage)
  preloadVoice([meta.title, ...T.praise, ...T.tryAgain])

  let disposed = false
  let session = null
  const mod = await meta.load().catch(() => null)
  if (!mod) {
    owl.dispose()
    screen.replaceChildren()
    mountError(screen)
    return
  }
  await whenSplashClosed()
  if (disposed || !screen.isConnected) {
    owl.dispose()
    return
  }

  let first = true
  const start = () => {
    session?.dispose()
    stage.replaceChildren()
    stage.className = 'stage'
    progress.replaceChildren()
    session = createSession({ meta, screen, stage, progress, owl, restart: start, announce: first })
    first = false
    mod.default(session.ctx)
  }
  start()

  return () => {
    disposed = true
    session?.dispose()
    owl.dispose()
  }
}

function owlButton() {
  const el = h(
    'button',
    { class: 'round-btn owl-btn', 'aria-label': 'Anleitung noch einmal hören' },
    emoji('owl', { cls: 'owl-img' }),
    h('span', { class: 'owl-speaker', html: ICON.speaker }),
  )
  const api = { el, onTap: null, dispose: onSpeaking((talking) => el.classList.toggle('talking', talking)) }
  el.addEventListener('click', () => {
    unlockAudio()
    api.onTap?.()
  })
  return api
}

function renderProgress(el, done, total) {
  if (el.childElementCount !== total) {
    el.replaceChildren(...Array.from({ length: total }, () => h('span', { class: 'progress-slot', html: ICON.star })))
  }
  ;[...el.children].forEach((slot, i) => {
    const filled = i < done
    if (filled && !slot.classList.contains('filled')) {
      slot.classList.add('filled', 'pop')
      sfx.star()
      burst(slot, { count: 6, spread: 34 })
    } else if (!filled) slot.classList.remove('filled', 'pop')
  })
}

function createSession({ meta, screen, stage, progress, owl, restart, announce }) {
  let alive = true
  const disposers = []
  const never = new Promise(() => {})
  // Nach dem Verlassen des Spiels laufen wartende Abläufe einfach nicht weiter.
  const guard = (promise) => promise.then((value) => (alive ? value : never))
  // Beim ersten Start wird zuerst der Spielname angesagt.
  let gate = announce ? say(meta.title) : Promise.resolve(true)
  let help = null
  owl.onTap = () => {
    sfx.tap()
    if (help) help()
  }

  const ctx = {
    meta,
    stage,
    level: levelFor(meta.id),
    get alive() {
      return alive
    },
    /** true, solange die Anleitung für dieses Spiel noch nie gehört wurde. */
    firstTime: !introHeard(meta.id),
    markIntroHeard: () => markIntroHeard(meta.id),

    wait: (ms) => guard(sleep(ms)),
    say: (text) => guard(gate.then(() => (alive ? say(text) : never))),
    sayAll: (texts, opts) => guard(gate.then(() => (alive ? sayAll(texts, opts) : never))),
    stopVoice: () => {
      gate = Promise.resolve(true)
      stopVoice()
    },
    preload: (texts) => preloadVoice(texts),
    sfx,

    /** Bei längerer Pause die Anleitung automatisch wiederholen (Malen schaltet das ab). */
    idleHelp: true,
    /** Was die Eule sagt, wenn man auf sie tippt. */
    setHelp(fn) {
      help = fn
    },
    setProgress: (done, total) => renderProgress(progress, done, total),
    praise: () => ctx.say(pick(T.praise)),
    tryAgain: () => ctx.say(pick(T.tryAgain)),
    burst,

    on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts)
      disposers.push(() => target.removeEventListener(type, fn, opts))
    },
    timeout(fn, ms) {
      const id = setTimeout(() => alive && fn(), ms)
      disposers.push(() => clearTimeout(id))
      return id
    },
    onDispose(fn) {
      disposers.push(fn)
    },

    /** Spiel geschafft: Belohnung zeigen, Stufe anpassen, Sticker vergeben. */
    finish: (result = {}) => guard(celebrate({ meta, screen, restart, result, isAlive: () => alive })),
  }

  // Erinnerung: Wenn eine Weile nichts passiert, liest die Eule die Aufgabe noch einmal vor.
  let idleCount = 0
  let idleTimer = 0
  const resetIdle = () => {
    clearTimeout(idleTimer)
    if (idleCount < 2) idleTimer = setTimeout(onIdle, 25000)
  }
  const onIdle = () => {
    if (!alive || !ctx.idleHelp || !help) return
    if (isSpeaking() || screen.querySelector('.celebrate')) return resetIdle()
    idleCount++
    flash(owl.el, 'wiggle', 700)
    help()
    resetIdle()
  }
  screen.addEventListener('pointerdown', resetIdle, true)
  disposers.push(() => {
    clearTimeout(idleTimer)
    screen.removeEventListener('pointerdown', resetIdle, true)
  })
  resetIdle()

  return {
    ctx,
    dispose() {
      if (!alive) return
      alive = false
      stopVoice()
      disposers.splice(0).forEach((fn) => fn())
      screen.querySelector('.celebrate')?.remove()
    },
  }
}

async function celebrate({ meta, screen, restart, result, isAlive }) {
  const { mistakes = 0, rounds = 1 } = result
  const level = recordResult(meta.id, { mistakes, rounds })
  const sticker = awardSticker()
  const daily = markDailyDone(meta.id)
  const bonus = daily.completedNow ? awardSticker() : null

  const actionBtn = (cls, icon, label, onclick) =>
    h('button', { class: `big-btn ${cls}`, 'aria-label': label, html: icon, onclick })

  const card = h(
    'div',
    { class: 'celebrate-card' },
    h(
      'div',
      { class: 'celebrate-prize' },
      h('div', { class: 'celebrate-rays' }),
      sticker ? wordImg(sticker, { cls: 'celebrate-sticker' }) : emoji('trophy', { cls: 'celebrate-sticker' }),
    ),
    h('h2', { class: 'celebrate-title' }, 'Super gemacht!'),
    daily.completedNow
      ? h('p', { class: 'celebrate-daily' }, emoji('trophy'), h('span', {}, 'Tagesziel geschafft!'), bonus ? wordImg(bonus, { cls: 'bonus-sticker' }) : null)
      : null,
    level.levelUp
      ? h(
          'p',
          { class: 'celebrate-level' },
          h('span', {}, 'Neue Stufe'),
          ...Array.from({ length: 3 }, (_, i) => h('span', { class: `lvl-star ${i < level.after ? 'on' : ''}`, html: ICON.star })),
        )
      : null,
    h(
      'div',
      { class: 'celebrate-actions' },
      actionBtn('btn-green', ICON.replay, 'Noch einmal spielen', () => {
        sfx.tap()
        stopConfetti()
        restart()
      }),
      actionBtn('btn-blue', ICON.home, 'Zur Übersicht', () => {
        sfx.tap()
        stopConfetti()
        goHome()
      }),
      sticker
        ? actionBtn('btn-yellow', ICON.book, 'Zum Stickerheft', () => {
            sfx.tap()
            stopConfetti()
            go('album', { replace: true })
          })
        : null,
    ),
  )
  const overlay = h('div', { class: 'celebrate', role: 'dialog', 'aria-label': 'Geschafft' }, card)
  screen.append(overlay)

  sfx.fanfare()
  const stopConfetti = confetti()
  await sleep(500)
  if (!isAlive()) return
  await say(sticker ? pick(T.finished) : T.finishedNoSticker)
  if (!isAlive()) return
  if (sticker) {
    await sleep(150)
    if (!isAlive()) return
    await say(wordSay(sticker))
  }
  if (daily.completedNow && isAlive()) {
    await sleep(300)
    sfx.fanfare()
    if (isAlive()) await say(T.dailyDone)
    if (bonus && isAlive()) await say(wordSay(bonus))
  }
  if (level.levelUp && isAlive()) {
    await sleep(250)
    if (isAlive()) await say(T.levelUp)
  }
}
