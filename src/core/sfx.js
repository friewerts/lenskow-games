/**
 * Geräusche – komplett mit der Web Audio API erzeugt (keine Dateien nötig).
 */
import { settings } from './store.js'

let ctx = null
let sfxOut = null
let voiceOut = null
let noiseBuffer = null

export function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC({ latencyHint: 'interactive' })
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.knee.value = 10
    comp.ratio.value = 4
    comp.connect(ctx.destination)
    sfxOut = ctx.createGain()
    sfxOut.gain.value = 0.9
    sfxOut.connect(comp)
    voiceOut = ctx.createGain()
    voiceOut.gain.value = 1
    voiceOut.connect(ctx.destination)
  }
  return ctx
}

export function voiceDestination() {
  audioCtx()
  return voiceOut
}

let unlocked = false
/** Muss aus einer Nutzer-Geste heraus aufgerufen werden (Tippen). */
export function unlockAudio() {
  const c = audioCtx()
  if (!c) return
  try {
    // iOS: Ton auch bei Stummschalter abspielen (Safari 16.4+)
    if (navigator.audioSession && navigator.audioSession.type !== 'playback') {
      navigator.audioSession.type = 'playback'
    }
  } catch {
    /* ignorieren */
  }
  if (c.state !== 'running') c.resume().catch(() => {})
  if (!unlocked) {
    unlocked = true
    const buffer = c.createBuffer(1, 1, 22050)
    const src = c.createBufferSource()
    src.buffer = buffer
    src.connect(c.destination)
    src.start(0)
  }
}

function ready() {
  if (!settings.sound) return null
  const c = audioCtx()
  if (!c) return null
  if (c.state === 'suspended') c.resume().catch(() => {})
  return c
}

/**
 * Ein Ton aus mehreren Teiltönen mit Hüllkurve.
 * partials: [[Frequenz-Faktor, Lautstärke, Abklingzeit-Faktor], ...]
 */
function tone(c, { freq, at = 0, dur = 0.35, gain = 0.2, type = 'sine', partials = [[1, 1, 1]], glide = 0, attack = 0.006 }) {
  const t0 = c.currentTime + at
  for (const [ratio, level, decay = 1] of partials) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq * ratio, t0)
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, (freq + glide) * ratio), t0 + dur * 0.9)
    const end = t0 + dur * decay
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain * level, t0 + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, end)
    osc.connect(g)
    g.connect(sfxOut)
    osc.start(t0)
    osc.stop(end + 0.05)
  }
}

function noise(c, { at = 0, dur = 0.2, gain = 0.15, type = 'bandpass', from = 800, to = 800, q = 1 }) {
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const t0 = c.currentTime + at
  const src = c.createBufferSource()
  src.buffer = noiseBuffer
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.Q.value = q
  filter.frequency.setValueAtTime(from, t0)
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.25)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(sfxOut)
  src.start(t0, Math.random() * 0.5)
  src.stop(t0 + dur + 0.05)
}

const BELL = [
  [1, 1, 1],
  [2.0, 0.35, 0.6],
  [3.01, 0.18, 0.4],
]
const MARIMBA = [
  [1, 1, 1],
  [4, 0.22, 0.25],
  [9.8, 0.06, 0.12],
]

/** Pentatonische Töne für die Melodie (C D E G A C' D' E'). */
export const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51]

export const sfx = {
  tap() {
    const c = ready()
    if (!c) return
    tone(c, { freq: 880, dur: 0.07, gain: 0.07, glide: 300 })
  },
  pop() {
    const c = ready()
    if (!c) return
    tone(c, { freq: 420, dur: 0.12, gain: 0.22, glide: 520, partials: [[1, 1, 1]] })
  },
  pick() {
    const c = ready()
    if (!c) return
    tone(c, { freq: 700, dur: 0.1, gain: 0.12, glide: -250 })
  },
  correct() {
    const c = ready()
    if (!c) return
    tone(c, { freq: 1046.5, dur: 0.5, gain: 0.16, partials: BELL })
    tone(c, { freq: 1567.98, at: 0.11, dur: 0.7, gain: 0.16, partials: BELL })
  },
  wrong() {
    const c = ready()
    if (!c) return
    tone(c, { freq: 247, dur: 0.16, gain: 0.16, type: 'triangle', glide: -40 })
    tone(c, { freq: 196, at: 0.15, dur: 0.24, gain: 0.16, type: 'triangle', glide: -40 })
  },
  whoosh() {
    const c = ready()
    if (!c) return
    noise(c, { dur: 0.4, gain: 0.12, from: 400, to: 2600, q: 0.8 })
  },
  sparkle() {
    const c = ready()
    if (!c) return
    const notes = [2093, 2637, 3136, 2349, 3520, 4186]
    notes.forEach((f, i) => tone(c, { freq: f, at: i * 0.06, dur: 0.25, gain: 0.05, partials: BELL }))
  },
  star() {
    const c = ready()
    if (!c) return
    tone(c, { freq: 1760, dur: 0.35, gain: 0.09, partials: BELL })
    tone(c, { freq: 2637, at: 0.07, dur: 0.45, gain: 0.08, partials: BELL })
  },
  flip() {
    const c = ready()
    if (!c) return
    noise(c, { dur: 0.09, gain: 0.1, type: 'highpass', from: 2500, to: 4000 })
    tone(c, { freq: 600, dur: 0.08, gain: 0.06, glide: 200 })
  },
  munch() {
    const c = ready()
    if (!c) return
    for (let i = 0; i < 3; i++) noise(c, { at: i * 0.16, dur: 0.1, gain: 0.22, type: 'lowpass', from: 1400, to: 500 })
  },
  fanfare() {
    const c = ready()
    if (!c) return
    const seq = [523.25, 659.25, 783.99, 1046.5]
    seq.forEach((f, i) => tone(c, { freq: f, at: i * 0.12, dur: 0.35, gain: 0.13, type: 'triangle', partials: [[1, 1, 1], [2, 0.3, 0.5]] }))
    tone(c, { freq: 1046.5, at: 0.5, dur: 1.0, gain: 0.12, type: 'triangle', partials: [[1, 1, 1], [1.5, 0.4, 1], [2, 0.3, 0.6]] })
    setTimeout(() => sfx.sparkle(), 550)
  },
  note(index, dur = 0.6) {
    const c = ready()
    if (!c) return
    tone(c, { freq: NOTES[index % NOTES.length], dur, gain: 0.3, partials: MARIMBA, attack: 0.004 })
  },
  draw() {
    const c = ready()
    if (!c) return
    noise(c, { dur: 0.05, gain: 0.02, type: 'highpass', from: 3000, to: 3000 })
  },
  stamp() {
    const c = ready()
    if (!c) return
    tone(c, { freq: 300, dur: 0.12, gain: 0.2, glide: -120 })
    noise(c, { dur: 0.06, gain: 0.08, type: 'lowpass', from: 900, to: 400 })
  },
  step(i = 0) {
    const c = ready()
    if (!c) return
    tone(c, { freq: NOTES[i % 5] * 2, dur: 0.08, gain: 0.05 })
  },
}
