/**
 * Simple sound system using Web Audio API
 * Generates sounds programmatically - no external files needed
 */

let audioCtx = null
let isMuted = false
let speechTimeoutId = null

const spokenNumbers = {
  1: 'eins',
  2: 'zwei',
  3: 'drei',
  4: 'vier',
  5: 'fuenf',
  6: 'sechs',
  7: 'sieben',
  8: 'acht',
}

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

/**
 * Resume audio context (must be called from user gesture)
 */
export function resumeAudio() {
  const ctx = getContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}

export function toggleMute() {
  isMuted = !isMuted
  if (isMuted) {
    stopSpeech()
  }
  return isMuted
}

export function getMuted() {
  return isMuted
}

function stopSpeech() {
  if (speechTimeoutId) {
    window.clearTimeout(speechTimeoutId)
    speechTimeoutId = null
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function speakNumber(value) {
  if (isMuted || !('speechSynthesis' in window)) return

  stopSpeech()

  speechTimeoutId = window.setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(spokenNumbers[value] || String(value))
    utterance.lang = 'de-DE'
    utterance.rate = 0.9
    utterance.pitch = 1.05
    utterance.volume = 0.9
    window.speechSynthesis.speak(utterance)
    speechTimeoutId = null
  }, 160)
}

export function cancelSpeech() {
  stopSpeech()
}

/**
 * Play a simple tone
 */
function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  if (isMuted) return
  try {
    const ctx = getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch (e) {
    // Silently ignore audio errors
  }
}

/**
 * Card flip sound - quick soft pop
 */
export function playFlip() {
  playTone(800, 0.08, 'sine', 0.15)
  setTimeout(() => playTone(1000, 0.06, 'sine', 0.1), 30)
}

/**
 * Match found - happy ascending notes
 */
export function playMatch() {
  playTone(523, 0.15, 'sine', 0.2)  // C5
  setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 100)  // E5
  setTimeout(() => playTone(784, 0.2, 'sine', 0.25), 200)  // G5
}

/**
 * Mismatch - gentle descending tone
 */
export function playMismatch() {
  playTone(400, 0.15, 'sine', 0.12)
  setTimeout(() => playTone(350, 0.2, 'sine', 0.1), 100)
}

/**
 * Win celebration - triumphant fanfare
 */
export function playWin() {
  const notes = [523, 659, 784, 1047]  // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 150)
  })
  // Add a shimmering high note
  setTimeout(() => playTone(1319, 0.5, 'sine', 0.15), 600)  // E6
}

/**
 * Button click sound
 */
export function playClick() {
  playTone(600, 0.05, 'sine', 0.1)
}
