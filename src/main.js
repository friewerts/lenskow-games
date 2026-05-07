import './styles/main.css'
import { initUI } from './js/ui.js'

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initUI()
})

// Also init immediately if DOM is already loaded
if (document.readyState !== 'loading') {
  initUI()
}
