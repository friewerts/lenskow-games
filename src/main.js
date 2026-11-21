import './styles/base.css'
import './styles/shell.css'
import { startApp } from './core/app.js'
import { showSplash } from './screens/splash.js'
import { unlockAudio } from './core/sfx.js'

// Ton freischalten, sobald das Kind irgendwo hintippt (Browser-Regel).
const unlock = () => unlockAudio()
for (const type of ['pointerdown', 'touchend', 'click', 'keydown']) window.addEventListener(type, unlock, { capture: true, passive: true })

// Lange Drücken (Kontextmenü) und Pinch-Zoom verhindern – Kinderhände tippen gern lange.
window.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('gesturestart', (e) => e.preventDefault())

showSplash()
startApp(document.getElementById('app'))

if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {})
}
