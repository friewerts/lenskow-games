function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createRound(maxNumber) {
  const answer = randomInt(1, maxNumber)
  const optionSet = new Set([answer])

  while (optionSet.size < 3) {
    optionSet.add(randomInt(1, maxNumber))
  }

  return {
    answer,
    options: shuffle([...optionSet]).map(value => ({
      value,
      items: Array.from({ length: value }, (_, index) => index),
    })),
  }
}

export function createCountingGame(maxNumber, totalRounds = 5) {
  const firstRound = createRound(maxNumber)

  return {
    mode: 'counting',
    maxNumber,
    totalRounds,
    currentRound: 1,
    correctAnswers: 0,
    mistakes: 0,
    locked: false,
    isComplete: false,
    promptNumber: firstRound.answer,
    options: firstRound.options,
  }
}

export function selectQuantity(state, value) {
  if (state.locked || state.isComplete) return { action: 'blocked' }

  state.locked = true
  const isCorrect = value === state.promptNumber
  const isLastRound = state.currentRound === state.totalRounds

  if (isCorrect) {
    state.correctAnswers++

    if (isLastRound) {
      state.isComplete = true
      return { action: 'win', correctValue: state.promptNumber, selectedValue: value }
    }

    return { action: 'correct', correctValue: state.promptNumber, selectedValue: value }
  }

  state.mistakes++

  if (isLastRound) {
    state.isComplete = true
    return { action: 'finish-wrong', correctValue: state.promptNumber, selectedValue: value }
  }

  return { action: 'wrong', correctValue: state.promptNumber, selectedValue: value }
}

export function advanceCountingRound(state) {
  if (state.isComplete) return state

  state.currentRound++
  state.locked = false

  const nextRound = createRound(state.maxNumber)
  state.promptNumber = nextRound.answer
  state.options = nextRound.options

  return state
}

export function calculateCountingStars(mistakes, totalRounds) {
  if (mistakes === 0) return 3
  if (mistakes <= Math.max(1, Math.floor(totalRounds / 3))) return 2
  return 1
}