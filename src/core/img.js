import { h } from './dom.js'
import { WORDS } from '../data/words.js'

const BASE = import.meta.env.BASE_URL

export const emojiUrl = (name) => `${BASE}e/${name}.svg`

/** <img> eines Noto-Emoji. */
export function emoji(name, { cls = '', alt = '' } = {}) {
  return h('img', {
    src: emojiUrl(name),
    class: `emoji ${cls}`.trim(),
    alt,
    draggable: 'false',
    decoding: 'async',
  })
}

/** <img> für ein Wort aus dem Wortschatz. */
export function wordImg(id, { body = false, cls = '' } = {}) {
  const word = WORDS[id]
  return emoji(body && word.body ? word.body : word.i, { cls, alt: word.w })
}

const loaded = new Map()
/** Bilder vorladen, damit sie beim Anzeigen sofort da sind. */
export function preloadEmoji(names) {
  return Promise.all(
    names.map((name) => {
      if (!loaded.has(name)) {
        loaded.set(
          name,
          new Promise((resolve) => {
            const img = new Image()
            img.onload = img.onerror = () => resolve(img)
            img.src = emojiUrl(name)
          }),
        )
      }
      return loaded.get(name)
    }),
  )
}
