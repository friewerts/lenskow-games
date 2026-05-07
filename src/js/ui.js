import { createGame, flipCard, resetFlipped, calculateStars } from './game.js'
import { createCountingGame, selectQuantity, advanceCountingRound, calculateCountingStars } from './counting-game.js'
import { playFlip, playMatch, playMismatch, playWin, playClick, resumeAudio, toggleMute, getMuted, speakNumber, cancelSpeech } from './audio.js'

let currentGame = null
let currentMode = null
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
const gameInstruction = document.getElementById('game-instruction')
const statPrimaryIcon = document.getElementById('stat-primary-icon')
const statSecondaryIcon = document.getElementById('stat-secondary-icon')

const COUNTING_THEMES = [
  { emoji: '🍎', label: 'Äpfel', accentClass: 'theme-apple' },
  { emoji: '⭐', label: 'Sterne', accentClass: 'theme-star' },
  { emoji: '🧸', label: 'Teddys', accentClass: 'theme-bear' },
  { emoji: '🌼', label: 'Blüten', accentClass: 'theme-flower' },
  { emoji: '🫐', label: 'Beeren', accentClass: 'theme-berry' },
  { emoji: '🦋', label: 'Schmetterlinge', accentClass: 'theme-butterfly' },
]

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
 * Start a new game mode with the given difficulty
 */
export function startGame(mode, difficulty) {
  resumeAudio()
  playClick()
  currentMode = mode
  currentDifficulty = difficulty

  if (mode === 'counting') {
    startCountingGame(difficulty)
    return
  }

  startMemoryGame(difficulty)
}

function setGameHeader(config) {
  gameInstruction.textContent = config.instruction
  statPrimaryIcon.textContent = config.primaryIcon
  statSecondaryIcon.textContent = config.secondaryIcon
}

function startMemoryGame(pairCount) {
  currentGame = createGame(pairCount)

  setGameHeader({
    instruction: 'Finde alle Tierpaare.',
    primaryIcon: '👆',
    secondaryIcon: '⭐',
  })

  movesCount.textContent = '0'
  pairsFound.textContent = '0'
  pairsTotal.textContent = String(pairCount)

  gameBoard.innerHTML = ''
  gameBoard.className = `game-board pairs-${pairCount}`

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

    const back = document.createElement('div')
    back.className = 'card-face card-back'
    const pattern = document.createElement('span')
    pattern.className = 'card-back-pattern'
    pattern.textContent = '⭐'
    back.appendChild(pattern)

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

    cardEl.addEventListener('click', () => handleCardClick(card.uid))
    cardEl.addEventListener('touchstart', (e) => {
    }, { passive: true })

    gameBoard.appendChild(cardEl)
  })

  showScreen(gameScreen)
}

function startCountingGame(maxNumber) {
  currentGame = createCountingGame(maxNumber)

  setGameHeader({
    instruction: 'Welche Menge passt zur Zahl?',
    primaryIcon: '✅',
    secondaryIcon: '🔢',
  })

  renderCountingRound()
  showScreen(gameScreen)
}

function renderCountingRound() {
  if (!currentGame || currentMode !== 'counting') return

  const theme = COUNTING_THEMES[(currentGame.currentRound - 1) % COUNTING_THEMES.length]

  gameBoard.innerHTML = ''
  gameBoard.className = 'game-board counting-board'
  updateStats()

  const prompt = document.createElement('section')
  prompt.className = 'counting-prompt entrance'
  prompt.innerHTML = `
    <p class="counting-prompt-label">Suche die passende Menge</p>
    <p class="counting-theme-label">${theme.emoji} ${theme.label}</p>
    <div class="counting-number" aria-live="polite">${currentGame.promptNumber}</div>
  `

  const options = document.createElement('div')
  options.className = 'counting-options'

  currentGame.options.forEach((option, index) => {
    const button = document.createElement('button')
    button.className = `quantity-option entrance ${theme.accentClass}`
    button.type = 'button'
    button.dataset.value = String(option.value)
    button.style.animationDelay = `${150 + index * 80}ms`
    button.setAttribute('aria-label', `${option.value} ${theme.label}`)

    const items = document.createElement('div')
    items.className = 'quantity-items'

    option.items.forEach(() => {
      const item = document.createElement('span')
      item.className = 'quantity-item'
      item.textContent = theme.emoji
      item.setAttribute('aria-hidden', 'true')
      items.appendChild(item)
    })

    button.appendChild(items)
    button.addEventListener('click', () => handleQuantityClick(option.value))
    options.appendChild(button)
  })

  gameBoard.appendChild(prompt)
  gameBoard.appendChild(options)

  speakNumber(currentGame.promptNumber)
}

/**
 * Handle card click
 */
function handleCardClick(cardUid) {
  if (!currentGame || currentMode !== 'memory') return

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

function handleQuantityClick(value) {
  if (!currentGame || currentMode !== 'counting') return

  const result = selectQuantity(currentGame, value)
  if (result.action === 'blocked') return

  revealQuantityResult(result)
  updateStats()

  if (result.action === 'finish-wrong') {
    playMismatch()
    setTimeout(() => {
      showWinScreen()
      playWin()
    }, 1100)
    return
  }

  if (result.action === 'wrong') {
    playMismatch()
    setTimeout(() => {
      advanceCountingRound(currentGame)
      renderCountingRound()
    }, 1100)
    return
  }

  playMatch()

  if (result.action === 'win') {
    setTimeout(() => {
      showWinScreen()
      playWin()
    }, 900)
    return
  }

  setTimeout(() => {
    advanceCountingRound(currentGame)
    renderCountingRound()
  }, 900)
}

function revealQuantityResult(result) {
  const options = document.querySelectorAll('.quantity-option')

  options.forEach(option => {
    const value = Number(option.dataset.value)
    option.disabled = true

    if (value === result.correctValue) {
      option.classList.add('correct')
    }

    if (value === result.selectedValue && value !== result.correctValue) {
      option.classList.add('wrong')
    }
  })
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
  if (!currentGame) return

  if (currentMode === 'counting') {
    movesCount.textContent = String(currentGame.correctAnswers)
    pairsFound.textContent = String(currentGame.currentRound)
    pairsTotal.textContent = String(currentGame.totalRounds)
    return
  }

  movesCount.textContent = String(currentGame.moves)
  pairsFound.textContent = String(currentGame.pairsFound)
  pairsTotal.textContent = String(currentGame.pairCount)
}

/**
 * Show win screen with stars and confetti
 */
function showWinScreen() {
  const stars = currentMode === 'counting'
    ? calculateCountingStars(currentGame.mistakes, currentGame.totalRounds)
    : calculateStars(currentGame.moves, currentGame.pairCount)

  // Render stars
  winStars.innerHTML = ''
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('span')
    star.className = 'star'
    star.textContent = i < stars ? '⭐' : '☆'
    winStars.appendChild(star)
  }

  // Win message
  if (currentMode === 'counting') {
    const countingMessages = {
      3: 'Stark! Du hast Zahl und Menge sofort erkannt.',
      2: 'Sehr gut! Die meisten Mengen haben gepasst.',
      1: 'Gut gemacht! Mit etwas Ueben klappt es noch schneller.',
    }
    winMessage.textContent = countingMessages[stars] || countingMessages[1]
  } else {
    const memoryMessages = {
      3: 'Wow, das war perfekt! 🎊',
      2: 'Toll gemacht! 👏',
      1: 'Super, du hast es geschafft! 🥳',
    }
    winMessage.textContent = memoryMessages[stars] || memoryMessages[1]
  }

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
  cancelSpeech()
  currentGame = null
  currentMode = null
  showScreen(menuScreen)
}

/**
 * Replay with same difficulty
 */
export function playAgain() {
  if (currentDifficulty && currentMode) {
    startGame(currentMode, currentDifficulty)
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
  document.querySelectorAll('[data-game][data-value]').forEach(button => {
    button.addEventListener('click', () => {
      startGame(button.dataset.game, Number(button.dataset.value))
    })
  })

  document.getElementById('btn-back').addEventListener('click', goToMenu)
  document.getElementById('btn-play-again').addEventListener('click', playAgain)
  document.getElementById('btn-menu').addEventListener('click', goToMenu)

  document.getElementById('btn-sound-toggle').addEventListener('click', handleSoundToggle)
  document.getElementById('btn-sound-game').addEventListener('click', handleSoundToggle)

  updateSoundButtons()
}
