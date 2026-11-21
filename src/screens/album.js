/** Stickerheft: gesammelte Sticker und gemalte Bilder. */
import { h, flash } from '../core/dom.js'
import { ICON } from '../core/icons.js'
import { emoji, wordImg } from '../core/img.js'
import { sfx } from '../core/sfx.js'
import { say, onSpeaking } from '../core/voice.js'
import { goHome } from '../core/app.js'
import { burst } from '../core/effects.js'
import { STICKERS } from '../data/content.js'
import { T, wordSay } from '../data/texts.js'
import { stickers, newStickers, markStickersSeen, drawings, removeDrawing } from '../core/store.js'

export function mount(screen) {
  const owned = new Set(stickers())
  const fresh = new Set(newStickers())

  const owl = h('button', { class: 'round-btn owl-btn', 'aria-label': 'Anleitung hören' }, emoji('owl', { cls: 'owl-img' }), h('span', { class: 'owl-speaker', html: ICON.speaker }))
  const intro = owned.size ? T.album : T.albumEmpty
  owl.addEventListener('click', () => (sfx.tap(), say(intro)))
  const offSpeaking = onSpeaking((v) => owl.classList.toggle('talking', v))

  const header = h(
    'header',
    { class: 'game-header' },
    h('button', { class: 'round-btn home-btn', 'aria-label': 'Zurück', html: ICON.home, onclick: () => (sfx.tap(), goHome()) }),
    h('h1', { class: 'page-title' }, h('span', { class: 'title-icon', html: ICON.book }), `Stickerheft ${owned.size}/${STICKERS.length}`),
    owl,
  )

  const grid = h(
    'div',
    { class: 'sticker-grid' },
    ...STICKERS.map((id, i) => {
      const has = owned.has(id)
      const el = h(
        'button',
        {
          class: `sticker-slot ${has ? 'owned' : 'locked'} ${fresh.has(id) ? 'fresh' : ''}`,
          style: { animationDelay: `${Math.min(i, 40) * 18}ms` },
          'aria-label': has ? wordSay(id) : 'Noch nicht gesammelt',
        },
        wordImg(id),
      )
      el.addEventListener('click', () => {
        if (has) {
          sfx.pop()
          flash(el, 'wiggle', 700)
          burst(el, { count: 8, spread: 50 })
          say(wordSay(id))
        } else {
          sfx.tap()
          say(T.stickerLocked)
        }
      })
      return el
    }),
  )

  const gallery = h('section', { class: 'gallery' })
  const renderGallery = () => {
    const pictures = drawings()
    gallery.hidden = !pictures.length
    gallery.replaceChildren(
      h('h2', { class: 'section-title' }, emoji('framed-picture'), 'Meine Bilder'),
      h(
        'div',
        { class: 'gallery-grid' },
        ...pictures.map((pic, index) =>
          h(
            'button',
            { class: 'gallery-item', 'aria-label': 'Bild ansehen', onclick: () => openPicture(screen, pic.url, () => (removeDrawing(index), renderGallery())) },
            h('img', { src: pic.url, alt: 'Gemaltes Bild', draggable: 'false' }),
          ),
        ),
      ),
    )
  }
  renderGallery()

  screen.classList.add('album-screen')
  screen.append(header, h('main', { class: 'album-main' }, grid, gallery))

  const timer = setTimeout(() => say(intro), 350)
  markStickersSeen()
  return () => {
    clearTimeout(timer)
    offSpeaking()
  }
}

function openPicture(screen, url, onDelete) {
  sfx.pop()
  const close = () => (sfx.tap(), overlay.remove())
  const askDelete = () => {
    sfx.tap()
    const confirm = h(
      'div',
      { class: 'lightbox-confirm' },
      h('span', { class: 'confirm-icon', html: ICON.trash }),
      h('button', {
        class: 'big-btn btn-red',
        'aria-label': 'Ja, Bild löschen',
        html: ICON.check,
        onclick: () => {
          sfx.whoosh()
          overlay.remove()
          onDelete()
        },
      }),
      h('button', { class: 'big-btn btn-blue', 'aria-label': 'Nein, behalten', html: ICON.close, onclick: () => (sfx.tap(), confirm.remove()) }),
    )
    overlay.append(confirm)
    say(T.paintClear)
  }
  const overlay = h(
    'div',
    { class: 'overlay lightbox', onclick: (e) => e.target === overlay && close() },
    h('img', { src: url, alt: 'Gemaltes Bild', draggable: 'false' }),
    h('button', { class: 'round-btn close-btn', 'aria-label': 'Schließen', html: ICON.close, onclick: close }),
    h('button', { class: 'round-btn delete-btn', 'aria-label': 'Bild löschen', html: ICON.trash, onclick: askDelete }),
  )
  screen.append(overlay)
  say(T.myPictures)
}
