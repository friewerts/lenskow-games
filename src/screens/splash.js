/**
 * Startbild mit großem "Los geht's"-Knopf. Der erste Tipp schaltet zugleich
 * den Ton frei (Browser erlauben Ton erst nach einer Berührung).
 */
import { h } from '../core/dom.js'
import { ICON } from '../core/icons.js'
import { emoji } from '../core/img.js'
import { sfx, unlockAudio } from '../core/sfx.js'
import { say, preloadVoice } from '../core/voice.js'
import { T } from '../data/texts.js'

let closeSplash = () => {}
let splashClosed = Promise.resolve()

/** Erfüllt, sobald das Startbild weggetippt wurde (erst dann darf gesprochen werden). */
export function whenSplashClosed() {
  return splashClosed
}

export function showSplash() {
  splashClosed = new Promise((resolve) => (closeSplash = resolve))
  preloadVoice([T.welcome])
  const overlay = h(
    'div',
    { class: 'splash', role: 'dialog', 'aria-label': 'Start' },
    h('div', { class: 'sky-deco', 'aria-hidden': 'true' }, h('span', { class: 'cloud c1' }), h('span', { class: 'cloud c2' }), h('span', { class: 'cloud c3' })),
    h(
      'div',
      { class: 'splash-content' },
      h('div', { class: 'splash-owl' }, emoji('owl')),
      h('h1', { class: 'logo' }, logoLetters('Lenskow'), h('span', { class: 'logo-sub' }, 'Lernspiele')),
      h('button', { class: 'play-btn', 'aria-label': 'Los geht’s', html: ICON.play }),
    ),
    h('div', { class: 'hills', 'aria-hidden': 'true' }),
  )
  const start = () => {
    unlockAudio()
    sfx.pop()
    overlay.classList.add('leaving')
    setTimeout(() => overlay.remove(), 450)
    closeSplash()
    // Begrüßung nur auf dem Startbildschirm
    if (!location.hash || location.hash === '#/' || location.hash === '#') say(T.welcome)
  }
  overlay.querySelector('.play-btn').addEventListener('click', start)
  document.body.append(overlay)
}

/** Bunter Schriftzug: jeder Buchstabe in einer anderen Farbe. */
export function logoLetters(text) {
  return h(
    'span',
    { class: 'logo-word' },
    ...[...text].map((ch, i) => h('span', { class: `logo-l l${i % 6}` }, ch)),
  )
}
