/** Startbildschirm mit allen Spielen als große Bildkacheln. */
import { h, s } from '../core/dom.js'
import { ICON } from '../core/icons.js'
import { emoji } from '../core/img.js'
import { sfx } from '../core/sfx.js'
import { say, onSpeaking } from '../core/voice.js'
import { go } from '../core/app.js'
import { GAMES, gameById } from '../games/index.js'
import { levelFor, newStickers, stickers, dailyPlan } from '../core/store.js'
import { STICKERS } from '../data/content.js'
import { T } from '../data/texts.js'
import { logoLetters } from './splash.js'

export function mount(screen) {
  const owl = h('button', { class: 'round-btn owl-btn home-owl', 'aria-label': 'Hilfe hören' }, emoji('owl', { cls: 'owl-img' }), h('span', { class: 'owl-speaker', html: ICON.speaker }))
  owl.addEventListener('click', () => {
    sfx.tap()
    say(T.homeHelp)
  })
  const offSpeaking = onSpeaking((v) => owl.classList.toggle('talking', v))

  const fresh = newStickers().length
  const album = h(
    'button',
    { class: 'pill-btn album-btn', 'aria-label': 'Stickerheft', onclick: () => (sfx.tap(), go('album')) },
    h('span', { class: 'pill-icon', html: ICON.book }),
    h('span', { class: 'pill-count' }, `${stickers().length}/${STICKERS.length}`),
    fresh ? h('span', { class: 'badge' }, String(fresh)) : null,
  )
  const parents = h('button', { class: 'round-btn small parents-btn', 'aria-label': 'Elternbereich', html: ICON.gear, onclick: () => (sfx.tap(), go('eltern')) })

  const header = h(
    'header',
    { class: 'home-header' },
    owl,
    h('h1', { class: 'logo small' }, logoLetters('Lenskow'), h('span', { class: 'logo-sub' }, 'Lernspiele')),
    h('div', { class: 'home-actions' }, album, parents),
  )

  const grid = h('div', { class: 'tiles' }, ...GAMES.map((game, i) => tile(game, i)))
  const daily = dailyStrip()
  const main = h('main', { class: 'home-main' }, daily, grid)

  screen.append(
    h('div', { class: 'sky-deco', 'aria-hidden': 'true' }, h('span', { class: 'cloud c1' }), h('span', { class: 'cloud c2' }), h('span', { class: 'cloud c3' })),
    header,
    main,
  )

  // Kachelgröße so wählen, dass möglichst alle Spiele ohne Scrollen sichtbar sind.
  const fit = () => {
    const style = getComputedStyle(main)
    const W = main.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    const H = screen.clientHeight - header.offsetHeight - daily.offsetHeight - 14 - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
    const gap = W < 600 ? 14 : 20
    const n = GAMES.length
    let best = { cols: 2, size: 0 }
    for (let cols = 2; cols <= 6; cols++) {
      const rows = Math.ceil(n / cols)
      const size = Math.min((W - (cols - 1) * gap) / cols, (H - (rows - 1) * gap) / rows / 1.02)
      if (size > best.size) best = { cols, size }
    }
    if (best.size < 125) {
      // Kleiner Bildschirm: lieber größere Kacheln und scrollen
      const cols = Math.max(2, Math.min(6, Math.floor((W + gap) / (150 + gap))))
      best = { cols, size: (W - (cols - 1) * gap) / cols }
    }
    grid.style.setProperty('--cols', best.cols)
    grid.style.setProperty('--tile', `${Math.floor(Math.min(best.size, 300))}px`)
    grid.style.setProperty('--gap', `${gap}px`)
  }
  const observer = new ResizeObserver(fit)
  observer.observe(screen)
  fit()
  return () => {
    offSpeaking()
    observer.disconnect()
  }
}

/** Tagesprogramm: drei Spiele für heute, erledigte bekommen einen Haken. */
function dailyStrip() {
  const plan = dailyPlan(GAMES)
  const allDone = plan.games.every((id) => plan.done.includes(id))
  return h(
    'section',
    { class: `daily ${allDone ? 'all-done' : ''}`, 'aria-label': allDone ? 'Spiele für heute – alle geschafft' : 'Spiele für heute' },
    h(
      'button',
      { class: 'daily-label', onclick: () => (sfx.tap(), say(T.dailyIntro)) },
      emoji(allDone ? 'trophy' : 'calendar'),
      h('span', {}, 'Heute'),
    ),
    h(
      'div',
      { class: 'daily-games' },
      ...plan.games.map((id) => {
        const game = gameById(id)
        const done = plan.done.includes(id)
        return h(
          'button',
          {
            class: `daily-game area-${game.area} ${done ? 'done' : ''}`,
            'aria-label': `${game.title}${done ? ' (geschafft)' : ''}`,
            onclick: () => {
              sfx.pop()
              go(`spiel/${id}`)
            },
          },
          h('span', { class: 'daily-art' }, tileArt(game.art)),
          done ? h('span', { class: 'daily-check', html: ICON.check }) : null,
        )
      }),
    ),
  )
}

function tile(game, index) {
  const level = levelFor(game.id)
  return h(
    'button',
    {
      class: `tile area-${game.area}`,
      style: { animationDelay: `${index * 45}ms` },
      'aria-label': game.title,
      onclick: () => {
        sfx.pop()
        go(`spiel/${game.id}`)
      },
    },
    h('span', { class: 'tile-art' }, tileArt(game.art)),
    h('span', { class: 'tile-title' }, game.title),
    h('span', { class: 'tile-level', 'aria-hidden': 'true' }, ...[1, 2, 3].map((n) => h('span', { class: n <= level ? 'on' : '', html: ICON.star }))),
  )
}

function tileArt(art) {
  if (art.row) return h('span', { class: 'art-row' }, ...art.row.map((n) => emoji(n)))
  if (art.letter) return h('span', { class: 'art-letter' }, h('span', { class: 'letter' }, art.letter), emoji(art.side, { cls: 'art-side' }))
  if (art.cards)
    return h(
      'span',
      { class: 'art-cards' },
      h('span', { class: 'mini-card back' }),
      h('span', { class: 'mini-card front' }, emoji(art.cards)),
    )
  if (art.dots) return dotsArt()
  if (art.order)
    return h('span', { class: 'art-order' }, ...art.order.map((n, i) => h('span', { class: 'mini-order-card' }, h('b', {}, String(i + 1)), emoji(n))))
  if (art.sudoku) {
    const [a, b, c] = art.sudoku
    const grid = [a, b, c, c, a, b, b, null, a]
    return h('span', { class: 'art-sudoku' }, ...grid.map((n) => h('span', { class: n ? 'cell' : 'cell empty' }, n ? emoji(n) : '?')))
  }
  if (art.mirror) return h('span', { class: 'art-mirror' }, emoji(art.mirror, { cls: 'mirror-half left' }), h('span', { class: 'mirror-axis' }), emoji(art.mirror, { cls: 'mirror-half right' }))
  if (art.cubes) return cubesArt()
  if (art.shadow) return h('span', { class: 'art-shadow' }, emoji(art.main, { cls: 'shadow-img' }), emoji(art.main, { cls: 'art-main' }))
  if (art.maze) return h('span', { class: 'art-maze' }, mazeArt(), emoji(art.main, { cls: 'maze-a' }), emoji(art.side, { cls: 'maze-b' }))
  return h(
    'span',
    { class: 'art-group' },
    emoji(art.main, { cls: 'art-main' }),
    art.side ? emoji(art.side, { cls: 'art-side' }) : null,
    art.third ? emoji(art.third, { cls: 'art-third' }) : null,
  )
}

function dotsArt() {
  const pts = [
    [50, 8],
    [62, 38],
    [94, 40],
    [69, 60],
    [79, 92],
    [50, 74],
    [21, 92],
    [31, 60],
    [6, 40],
    [38, 38],
  ]
  const drawn = 6
  return s(
    'svg',
    { viewBox: '0 0 100 100', class: 'art-dots' },
    s('polyline', { points: pts.slice(0, drawn).map((p) => p.join(',')).join(' '), class: 'dots-line' }),
    ...pts.map(([x, y], i) => s('circle', { cx: x, cy: y, r: 5.5, class: i < drawn ? 'dot done' : 'dot' })),
  )
}

function cubesArt() {
  const iso = (x, y, z) => [(x - y) * 14, ((x + y) * 14) / 2 - z * 14]
  const cube = (x, y, z, [light, mid, dark]) => {
    const p = (list) => list.map((q) => iso(...q).join(',')).join(' ')
    return s(
      'g',
      {},
      s('polygon', { points: p([[x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x, y + 1, z]]), fill: mid }),
      s('polygon', { points: p([[x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x + 1, y, z]]), fill: dark }),
      s('polygon', { points: p([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]]), fill: light }),
    )
  }
  const red = ['#ff8a8a', '#ff5a5f', '#d63c42']
  const yellow = ['#ffe08a', '#ffc93c', '#e0a400']
  const blue = ['#8cc8ff', '#3a9bff', '#1f78d1']
  const green = ['#8fe0a6', '#47c46b', '#2a9a4c']
  return s('svg', { viewBox: '-34 -36 68 62', class: 'art-cubes' }, cube(0, 0, 0, blue), cube(1, 0, 0, red), cube(0, 0, 1, yellow), cube(1, 1, 0, green))
}

function mazeArt() {
  return s(
    'svg',
    { viewBox: '0 0 100 100', class: 'art-maze-lines' },
    s('path', { d: 'M10 10H90V90H10Z M10 35H60 M35 35V65 M60 60H90 M35 65H70V90' }),
  )
}
