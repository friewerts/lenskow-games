// Card data with animal info
// We use imported images where available, emoji fallbacks for the rest
import catImg from '../assets/cards/cat.png'
import dogImg from '../assets/cards/dog.png'
import bunnyImg from '../assets/cards/bunny.png'
import bearImg from '../assets/cards/bear.png'
import foxImg from '../assets/cards/fox.png'
import owlImg from '../assets/cards/owl.png'

export const ALL_ANIMALS = [
  { id: 'cat',       name: 'Katze',         image: catImg,   emoji: '🐱' },
  { id: 'dog',       name: 'Hund',          image: dogImg,   emoji: '🐶' },
  { id: 'bunny',     name: 'Hase',          image: bunnyImg, emoji: '🐰' },
  { id: 'bear',      name: 'Bär',           image: bearImg,  emoji: '🐻' },
  { id: 'fox',       name: 'Fuchs',         image: foxImg,   emoji: '🦊' },
  { id: 'owl',       name: 'Eule',          image: owlImg,   emoji: '🦉' },
  { id: 'frog',      name: 'Frosch',        image: null,     emoji: '🐸' },
  { id: 'butterfly', name: 'Schmetterling', image: null,     emoji: '🦋' },
]

/**
 * Fisher-Yates shuffle
 */
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Create the game state for a given number of pairs
 */
export function createGame(pairCount) {
  // Pick random animals for this game
  const selectedAnimals = shuffle(ALL_ANIMALS).slice(0, pairCount)

  // Create pairs (each animal appears twice)
  const cards = []
  selectedAnimals.forEach((animal, index) => {
    cards.push({ ...animal, pairId: index, uid: `${animal.id}-a` })
    cards.push({ ...animal, pairId: index, uid: `${animal.id}-b` })
  })

  return {
    cards: shuffle(cards),
    pairCount,
    pairsFound: 0,
    moves: 0,
    flippedCards: [],
    isLocked: false,
    isComplete: false,
  }
}

/**
 * Attempt to flip a card. Returns an action result.
 */
export function flipCard(state, cardUid) {
  // Guard: don't flip if locked, already flipped, or already matched
  if (state.isLocked) return { action: 'blocked' }
  if (state.flippedCards.length >= 2) return { action: 'blocked' }

  const card = state.cards.find(c => c.uid === cardUid)
  if (!card) return { action: 'blocked' }
  if (state.flippedCards.includes(cardUid)) return { action: 'blocked' }

  state.flippedCards.push(cardUid)

  if (state.flippedCards.length === 1) {
    return { action: 'flip', cardUid }
  }

  // Two cards flipped - check match
  state.moves++
  state.isLocked = true

  const [firstUid, secondUid] = state.flippedCards
  const first = state.cards.find(c => c.uid === firstUid)
  const second = state.cards.find(c => c.uid === secondUid)

  if (first.pairId === second.pairId) {
    state.pairsFound++
    state.flippedCards = []
    state.isLocked = false

    if (state.pairsFound === state.pairCount) {
      state.isComplete = true
      return { action: 'win', cardUid, matchedCards: [firstUid, secondUid] }
    }

    return { action: 'match', cardUid, matchedCards: [firstUid, secondUid] }
  }

  return { action: 'mismatch', cardUid, mismatchedCards: [firstUid, secondUid] }
}

/**
 * Reset flipped cards after mismatch
 */
export function resetFlipped(state) {
  state.flippedCards = []
  state.isLocked = false
}

/**
 * Calculate stars based on moves relative to pair count
 */
export function calculateStars(moves, pairCount) {
  const perfectMoves = pairCount
  const ratio = moves / perfectMoves

  if (ratio <= 1.5) return 3
  if (ratio <= 2.5) return 2
  return 1
}
