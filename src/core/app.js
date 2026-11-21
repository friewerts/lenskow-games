/**
 * Navigation zwischen den Bildschirmen (Hash-Routen, funktioniert auch auf GitHub Pages):
 *   #/              Startbildschirm
 *   #/spiel/<id>    ein Spiel
 *   #/album         Stickerheft
 *   #/eltern        Elternbereich
 */
import { stopVoice } from './voice.js'

const VIEWS = {
  '': () => import('../screens/home.js'),
  spiel: () => import('./frame.js'),
  album: () => import('../screens/album.js'),
  eltern: () => import('../screens/parents.js'),
}

let root = null
let current = null
let renderedKey = null
let renderToken = 0

function parse() {
  const [name = '', arg = ''] = location.hash.replace(/^#\/?/, '').split('/')
  return { name: VIEWS[name] ? name : '', arg: decodeURIComponent(arg) }
}

export function startApp(el) {
  root = el
  window.addEventListener('popstate', render)
  window.addEventListener('hashchange', render)
  render()
}

/** Zu einem Bildschirm wechseln, z. B. go('spiel/memory'). */
export function go(path, { replace = false } = {}) {
  const url = `#/${path}`
  if (replace) history.replaceState({ inApp: history.state?.inApp ?? false }, '', url)
  else history.pushState({ inApp: true }, '', url)
  render()
}

/** Zurück zum Startbildschirm – per "Zurück", wenn wir von dort kamen. */
export function goHome() {
  if (history.state?.inApp) history.back()
  else go('', { replace: true })
}

async function render() {
  const route = parse()
  const key = `${route.name}/${route.arg}`
  if (key === renderedKey) return
  renderedKey = key
  const my = ++renderToken
  stopVoice()
  const previous = current
  current = null
  previous?.()
  document.querySelectorAll('.overlay').forEach((el) => el.remove())

  let view
  try {
    view = await VIEWS[route.name]()
  } catch {
    view = { mount: mountError }
  }
  if (my !== renderToken) return
  const screen = document.createElement('div')
  screen.className = `screen screen-${route.name || 'home'}`
  root.replaceChildren(screen)
  window.scrollTo(0, 0)
  const cleanup = view.mount(screen, route.arg)
  current = () => Promise.resolve(cleanup).then((fn) => typeof fn === 'function' && fn())
}

/** Freundliche Fehlermeldung, falls etwas nicht geladen werden konnte (z. B. offline). */
export function mountError(screen) {
  const box = document.createElement('div')
  box.className = 'error-box'
  box.innerHTML = '<p class="error-emoji">🦉</p><h2>Ups! Das hat nicht geklappt.</h2><p>Bitte prüfe die Internetverbindung und versuche es noch einmal.</p>'
  const btn = document.createElement('button')
  btn.className = 'big-btn btn-blue'
  btn.setAttribute('aria-label', 'Zur Übersicht')
  btn.innerHTML = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 23 24 8l17 15"/><path d="M12 20v19h9V29h6v10h9V20"/></svg>'
  btn.addEventListener('click', () => {
    location.hash = '#/'
    location.reload()
  })
  box.append(btn)
  screen.append(box)
}
