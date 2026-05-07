import { createGame, flipCard, resetFlipped, calculateStars } from './game.js'
import { playFlip, playMatch, playMismatch, playWin, playClick, resumeAudio, toggleMute, getMuted } from './audio.js'

let currentGame = null
let currentDifficulty = null

// DOM references
const menuScreen = document.getElementById('menu-screen')
const gameScreen = document.getElementById('game-screen')
const winScreen = document.getElementById('win-screen')
const gameBoard = document.getElementById('game-board')
const movesCount = document.getElementById('moves-count')
const pairsFound = document.getElementById('pairs-found')
const pairsTotal = document.getElementById('pairs-total')
const winStars = document.getElementById('win-stars')
const winMessage = document.getElementById('win-message')

/**
 * Switch between screens
 */
function showScreen(screen) {
  ;[menuScreen, gameScreen, winScreen].forEach(s => s.classList.remove('active'))
  screen.classList.add('active')
}

/**
 * Update sound button icons
 */
function updateSoundButtons() {
  const icon = getMuted() ? '🔇' : '🔊'
  document.getElementById('btn-sound-toggle').textContent = icon
  document.getElementById('btn-sound-game').textContent = icon
}

/**
 * Start a new game with the given number of pairs
 */
export function startGame(pairCount) {
  resumeAudio()
  playClick()
  currentDifficulty = pairCount
  currentGame = createGame(pairCount)

  // Update stats
  movesCount.textContent = '0'
  pairsFound.textContent = '0'
  pairsTotal.textContent = String(pairCount)

  // Clear board
  gameBoard.innerHTML = ''
  gameBoard.className = `game-board pairs-${pairCount}`

  // Render cards with staggered entrance animation
  currentGame.cards.forEach((card, index) => {
    const cardEl = document.createElement('div')
    cardEl.className = 'memory-card entrance'
    cardEl.dataset.uid = card.uid
    cardEl.style.animationDelay = `${index * 60}ms`
    cardEl.setAttribute('role', 'button')
    cardEl.setAttribute('aria-label', 'Memory Karte')
    cardEl.id = `card-${card.uid}`

    const inner = document.createElement('div')
    inner.className = 'card-inner'

    // Card back
    const back = document.createElement('div')
    back.className = 'card-face card-back'
    const pattern = document.createElement('span')
    pattern.className = 'card-back-pattern'
    pattern.textContent = '⭐'
    back.appendChild(pattern)

    // Card front
    const front = document.createElement('div')
    front.className = 'card-face card-front'

    if (card.image) {
      const img = document.createElement('img')
      img.src = card.image
      img.alt = card.name
      img.loading = 'eager'
      img.draggable = false
      front.appendChild(img)
    } else {
      const emoji = document.createElement('span')
      emoji.className = 'card-emoji'
      emoji.textContent = card.emoji
      emoji.setAttribute('role', 'img')
      emoji.setAttribute('aria-label', card.name)
      front.appendChild(emoji)
    }

    inner.appendChild(back)
    inner.appendChild(front)
    cardEl.appendChild(inner)

    // Click handler
    cardEl.addEventListener('click', () => handleCardClick(card.uid))
    cardEl.addEventListener('touchstart', (e) => {
      // Prevent double-fire on mobile
    }, { passive: true })

    gameBoard.appendChild(cardEl)
  })

  showScreen(gameScreen)
}

/**
 * Handle card click
 */
function handleCardClick(cardUid) {
  if (!currentGame) return

  const result = flipCard(currentGame, cardUid)

  switch (result.action) {
    case 'flip':
      flipCardElement(cardUid)
      playFlip()
      break

    case 'match':
      flipCardElement(cardUid)
      playFlip()
      updateStats()
      setTimeout(() => {
        markMatched(result.matchedCards)
        playMatch()
      }, 400)
      break

    case 'mismatch':
      flipCardElement(cardUid)
      playFlip()
      updateStats()
      // Show cards briefly, then shake and flip back
      setTimeout(() => {
        shakeCards(result.mismatchedCards)
        playMismatch()
      }, 600)
      setTimeout(() => {
        unflipCards(result.mismatchedCards)
        resetFlipped(currentGame)
      }, 1100)
      break

    case 'win':
      flipCardElement(cardUid)
      playFlip()
      updateStats()
      setTimeout(() => {
        markMatched(result.matchedCards)
        playMatch()
      }, 400)
      setTimeout(() => {
        showWinScreen()
        playWin()
      }, 1200)
      break
  }
}

/**
 * Flip a card element visually
 */
function flipCardElement(uid) {
  const el = document.querySelector(`[data-uid="${uid}"]`)
  if (el) {
    el.classList.add('flipped', 'disabled')
  }
}

/**
 * Mark cards as matched
 */
function markMatched(uids) {
  uids.forEach(uid => {
    const el = document.querySelector(`[data-uid="${uid}"]`)
    if (el) {
      el.classList.add('matched')
    }
  })
}

/**
 * Shake mismatched cards
 */
function shakeCards(uids) {
  uids.forEach(uid => {
    const el = document.querySelector(`[data-uid="${uid}"]`)
    if (el) {
      el.classList.add('shake')
    }
  })
}

/**
 * Flip cards back after mismatch
 */
function unflipCards(uids) {
  uids.forEach(uid => {
    const el = document.querySelector(`[data-uid="${uid}"]`)
    if (el) {
      el.classList.remove('flipped', 'disabled', 'shake')
    }
  })
}

/**
 * Update move/pairs counters
 */
function updateStats() {
  movesCount.textContent = String(currentGame.moves)
  pairsFound.textContent = String(currentGame.pairsFound)
}

/**
 * Show win screen with stars and confetti
 */
function showWinScreen() {
  const stars = calculateStars(currentGame.moves, currentGame.pairCount)

  // Render stars
  winStars.innerHTML = ''
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('span')
    star.className = 'star'
    star.textContent = i < stars ? '⭐' : '☆'
    winStars.appendChild(star)
  }

  // Win message
  const messages = {
    3: 'Wow, das war perfekt! 🎊',
    2: 'Toll gemacht! 👏',
    1: 'Super, du hast es geschafft! 🥳',
  }
  winMessage.textContent = messages[stars] || messages[1]

  // Spawn confetti
  spawnConfetti()

  showScreen(winScreen)
}

/**
 * Create confetti particles
 */
function spawnConfetti() {
  const container = document.getElementById('confetti-container')
  container.innerHTML = ''

  const colors = ['#FF9EC6', '#C8A8E9', '#A8E6CF', '#FFE49C', '#A8D8EA', '#FFCBA4', '#FF8A80']

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div')
    piece.className = 'confetti-piece'
    piece.style.left = `${Math.random() * 100}vw`
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    piece.style.animationDuration = `${1.5 + Math.random() * 2}s`
    piece.style.animationDelay = `${Math.random() * 0.8}s`
    piece.style.width = `${6 + Math.random() * 8}px`
    piece.style.height = `${6 + Math.random() * 8}px`
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
    container.appendChild(piece)
  }

  // Clean up after animation
  setTimeout(() => {
    container.innerHTML = ''
  }, 4000)
}

/**
 * Go back to menu
 */
export function goToMenu() {
  resumeAudio()
  playClick()
  currentGame = null
  showScreen(menuScreen)
}

/**
 * Replay with same difficulty
 */
export function playAgain() {
  if (currentDifficulty) {
    startGame(currentDifficulty)
  }
}

/**
 * Handle sound toggle
 */
export function handleSoundToggle() {
  resumeAudio()
  toggleMute()
  updateSoundButtons()
  if (!getMuted()) playClick()
}

/**
 * Initialize all event listeners
 */
export function initUI() {
  // Difficulty buttons
  document.getElementById('btn-easy').addEventListener('click', () => startGame(3))
  document.getElementById('btn-medium').addEventListener('click', () => startGame(6))
  document.getElementById('btn-hard').addEventListener('click', () => startGame(8))

  // Navigation buttons
  document.getElementById('btn-back').addEventListener('click', goToMenu)
  document.getElementById('btn-play-again').addEventListener('click', playAgain)
  document.getElementById('btn-menu').addEventListener('click', goToMenu)

  // Sound toggles
  document.getElementById('btn-sound-toggle').addEventListener('click', handleSoundToggle)
  document.getElementById('btn-sound-game').addEventListener('click', handleSoundToggle)

  // Initialize sound state
  updateSoundButtons()
}
