/** Elternbereich (mit kleiner Sperre): Einstellungen, Schwierigkeit, Fortschritt. */
import { h, randInt, flash } from '../core/dom.js'
import { ICON } from '../core/icons.js'
import { sfx } from '../core/sfx.js'
import { say, stopVoice } from '../core/voice.js'
import { goHome } from '../core/app.js'
import { GAMES, AREAS } from '../games/index.js'
import { STICKERS } from '../data/content.js'
import { NUMBER_WORDS, T } from '../data/texts.js'
import * as store from '../core/store.js'

let unlockedUntil = 0

export function mount(screen) {
  screen.classList.add('parents-screen')
  const header = h(
    'header',
    { class: 'game-header' },
    h('button', { class: 'round-btn home-btn', 'aria-label': 'Zurück', html: ICON.home, onclick: () => (sfx.tap(), goHome()) }),
    h('h1', { class: 'page-title' }, h('span', { class: 'title-icon', html: ICON.gear }), 'Elternbereich'),
    h('span', { class: 'header-spacer' }),
  )
  const main = h('main', { class: 'parents-main' })
  screen.append(header, main)

  if (Date.now() < unlockedUntil) renderSettings(main)
  else renderGate(main, () => {
    unlockedUntil = Date.now() + 5 * 60 * 1000
    renderSettings(main)
  })
}

/* ---------------- Sperre ---------------- */
function renderGate(main, onSuccess) {
  let code = []
  let input = []
  const codeText = h('p', { class: 'gate-code' })
  const dots = h('div', { class: 'gate-dots' })
  const box = h('div', { class: 'gate card' })

  const newCode = () => {
    code = [randInt(1, 9), randInt(0, 9), randInt(1, 9)]
    input = []
    codeText.textContent = code.map((n) => NUMBER_WORDS[n]).join(' · ')
    renderDots()
  }
  const renderDots = () => dots.replaceChildren(...code.map((_, i) => h('span', { class: i < input.length ? 'on' : '' })))

  const press = (n) => {
    sfx.tap()
    input.push(n)
    renderDots()
    if (input.length < code.length) return
    if (input.join('') === code.join('')) {
      sfx.correct()
      onSuccess()
    } else {
      sfx.wrong()
      flash(box, 'shake', 500)
      setTimeout(newCode, 450)
    }
  }

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => h('button', { class: 'key', onclick: () => press(n) }, String(n)))
  box.append(
    h('div', { class: 'gate-lock', html: ICON.lock }),
    h('h2', {}, 'Nur für Erwachsene'),
    h('p', { class: 'gate-hint' }, 'Bitte tippe diese Zahlen als Ziffern:'),
    codeText,
    dots,
    h('div', { class: 'keypad' }, ...keys),
  )
  main.replaceChildren(box)
  newCode()
  say(T.parentsGate)
}

/* ---------------- Einstellungen ---------------- */
function toggle(label, desc, get, set) {
  const input = h('input', { type: 'checkbox', role: 'switch' })
  input.checked = get()
  input.addEventListener('change', () => {
    set(input.checked)
    sfx.tap()
  })
  return h('label', { class: 'setting' }, h('span', { class: 'setting-text' }, h('strong', {}, label), h('small', {}, desc)), h('span', { class: 'switch' }, input, h('span', { class: 'switch-ui' })))
}

function levelPicker(game) {
  const options = [
    { value: 0, label: 'Auto' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ]
  const wrap = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': `Stufe für ${game.title}` })
  const render = () => {
    const fixed = store.fixedLevel(game.id)
    wrap.replaceChildren(
      ...options.map((o) =>
        h(
          'button',
          {
            class: o.value === fixed ? 'active' : '',
            role: 'radio',
            'aria-checked': String(o.value === fixed),
            onclick: () => {
              sfx.tap()
              store.setFixedLevel(game.id, o.value)
              render()
              status.textContent = statusText()
            },
          },
          o.value === 0 ? `Auto (${store.autoLevel(game.id)})` : o.label,
        ),
      ),
    )
  }
  const statusText = () => `Gespielt: ${store.playsOf(game.id)}× · aktuelle Stufe ${store.levelFor(game.id)}`
  const status = h('small', { class: 'game-status' }, statusText())
  render()
  return { wrap, status }
}

function renderSettings(main) {
  stopVoice()
  const sections = []

  sections.push(
    h(
      'section',
      { class: 'card' },
      h('h2', {}, 'Ton & Bildschirm'),
      toggle('Sprachansagen', 'Die Eule liest alle Aufgaben vor – wichtig für Kinder, die noch nicht lesen.', () => store.settings.voice, (v) => (store.settings.voice = v)),
      toggle('Geräusche', 'Klänge für richtig, falsch, Belohnungen und Musik.', () => store.settings.sound, (v) => (store.settings.sound = v)),
      document.fullscreenEnabled
        ? h(
            'button',
            {
              class: 'text-btn',
              onclick: () => {
                if (document.fullscreenElement) document.exitFullscreen()
                else document.documentElement.requestFullscreen?.().catch(() => {})
              },
            },
            h('span', { html: ICON.expand }),
            'Vollbild an/aus',
          )
        : null,
    ),
  )

  const byArea = Object.entries(AREAS).map(([areaId, area]) => {
    const games = GAMES.filter((g) => g.area === areaId)
    return h(
      'div',
      { class: `area-block area-${areaId}` },
      h('h3', {}, area.name),
      ...games.map((game) => {
        const { wrap, status } = levelPicker(game)
        return h(
          'div',
          { class: 'game-setting' },
          h('div', { class: 'game-setting-head' }, h('strong', {}, game.title), status),
          h('p', {}, game.info),
          wrap,
        )
      }),
    )
  })
  sections.push(
    h(
      'section',
      { class: 'card' },
      h('h2', {}, 'Spiele & Schwierigkeit'),
      h(
        'p',
        { class: 'muted' },
        '„Auto“ passt die Stufe selbst an: Klappt eine Runde fast fehlerfrei, wird es etwas schwerer; bei vielen Fehlern wieder leichter. Mit 1–3 legst du die Stufe fest.',
      ),
      ...byArea,
    ),
  )

  const stickerCount = store.stickers().length
  const resetBtn = h('button', { class: 'text-btn danger' }, h('span', { html: ICON.trash }), 'Fortschritt zurücksetzen')
  resetBtn.addEventListener('click', () => {
    if (window.confirm('Alle Sticker, Bilder und Stufen löschen?')) {
      store.resetProgress()
      sfx.whoosh()
      renderSettings(main)
    }
  })
  sections.push(
    h(
      'section',
      { class: 'card' },
      h('h2', {}, 'Fortschritt'),
      h('p', {}, `Gesammelte Sticker: ${stickerCount} von ${STICKERS.length}. Gespeicherte Bilder: ${store.drawings().length}.`),
      resetBtn,
    ),
  )

  sections.push(
    h(
      'section',
      { class: 'card tips' },
      h('h2', {}, 'Tipps'),
      h(
        'ul',
        {},
        h('li', {}, h('strong', {}, 'Als App nutzen: '), 'Im Browser „Zum Home-Bildschirm“ bzw. „App installieren“ wählen. Danach funktionieren alle Spiele auch ohne Internet.'),
        h('li', {}, h('strong', {}, 'Gemeinsam spielen: '), 'Gerade am Anfang hilft es, die ersten Runden zusammen zu spielen und die Aufgaben laut mitzusprechen.'),
        h('li', {}, h('strong', {}, 'Kurze Einheiten: '), 'Eine Runde dauert 2–5 Minuten. 15–20 Minuten am Stück sind für Fünfjährige meist genug.'),
        h('li', {}, h('strong', {}, 'Fehler sind erlaubt: '), 'Es gibt keine Zeitlimits und keine Strafen. Nach zwei Fehlversuchen zeigt das Spiel einen Tipp.'),
        h('li', {}, h('strong', {}, 'Die Eule: '), 'Tippt das Kind auf die Eule oben rechts, wird die Aufgabe noch einmal vorgelesen.'),
      ),
    ),
  )

  sections.push(
    h(
      'section',
      { class: 'card credits' },
      h('h2', {}, 'Über die App'),
      h('p', {}, 'Keine Werbung, keine Anmeldung, keine Datenübertragung: Fortschritt und Bilder bleiben nur auf diesem Gerät.'),
      h(
        'p',
        { class: 'muted' },
        'Bilder: Noto Emoji von Google (Apache-Lizenz 2.0). Schriften: Fredoka und Andika (SIL Open Font License). Stimme: Piper-Sprachsynthese mit der Stimme „Thorsten“ (Thorsten-Voice, CC0).',
      ),
    ),
  )

  main.replaceChildren(...sections)
}

