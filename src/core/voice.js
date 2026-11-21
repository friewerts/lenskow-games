/**
 * Sprachausgabe: spielt vorab erzeugte Sprachaufnahmen (public/voice/*.mp3).
 * Fehlt eine Aufnahme, wird die Sprachsynthese des Geräts verwendet.
 */
import manifest from '../data/voice-manifest.json'
import { textKey, normalizeText } from './textkey.js'
import { audioCtx, voiceDestination } from './sfx.js'
import { settings } from './store.js'

const BASE = import.meta.env.BASE_URL
const available = new Set(manifest)
const cache = new Map()
const listeners = new Set()

let token = 0
let current = null
let speaking = false

function setSpeaking(value) {
  if (speaking === value) return
  speaking = value
  listeners.forEach((fn) => fn(value))
}

/** Rückruf bei Beginn/Ende des Sprechens (für die sprechende Eule). */
export function onSpeaking(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function isSpeaking() {
  return speaking
}

export function hasClip(text) {
  return available.has(textKey(text))
}

function decode(arrayBuffer) {
  const c = audioCtx()
  return new Promise((resolve, reject) => {
    const result = c.decodeAudioData(arrayBuffer, resolve, reject)
    if (result && typeof result.then === 'function') result.then(resolve, reject)
  })
}

// Dekodierte Aufnahmen belegen viel Speicher – nur die zuletzt genutzten behalten.
const CACHE_LIMIT = 90

function load(text) {
  const key = textKey(text)
  if (!available.has(key)) return Promise.resolve(null)
  let promise = cache.get(key)
  if (promise) {
    // als "zuletzt benutzt" markieren
    cache.delete(key)
  } else {
    promise = fetch(`${BASE}voice/${key}.mp3`)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(res.statusText))))
      .then(decode)
      .catch(() => {
        cache.delete(key)
        return null
      })
  }
  cache.set(key, promise)
  while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value)
  return promise
}

/** Aufnahmen schon einmal laden, damit sie ohne Verzögerung starten. */
export function preloadVoice(texts) {
  if (!audioCtx()) return
  for (const text of texts) if (text) load(text)
}

/** Aktuelle Ansage sofort beenden. */
export function stopVoice() {
  token++
  if (current) {
    const stop = current
    current = null
    stop()
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  setSpeaking(false)
}

/**
 * Text sprechen. Unterbricht eine laufende Ansage.
 * Ergebnis: true = zu Ende gesprochen, false = unterbrochen.
 */
export async function say(text) {
  stopVoice()
  const my = token
  if (!text || !settings.voice) return true
  if (import.meta.env.DEV && !hasClip(text)) console.warn('[voice] Keine Aufnahme für:', normalizeText(text))
  const buffer = await load(text)
  if (my !== token) return false
  if (buffer) return playBuffer(buffer, my)
  return speakFallback(text, my)
}

/** Mehrere Texte nacheinander sprechen; onStart(i) wird vor jedem Text aufgerufen. */
export async function sayAll(texts, { gap = 250, onStart } = {}) {
  for (let i = 0; i < texts.length; i++) {
    onStart?.(i)
    const done = await say(texts[i])
    if (!done) return false
    if (i < texts.length - 1 && gap) {
      const mine = token
      await new Promise((resolve) => setTimeout(resolve, gap))
      if (mine !== token) return false
    }
  }
  return true
}

function playBuffer(buffer, my) {
  const c = audioCtx()
  if (c.state === 'suspended') c.resume().catch(() => {})
  return new Promise((resolve) => {
    const src = c.createBufferSource()
    src.buffer = buffer
    src.connect(voiceDestination())
    let finished = false
    let safety = null
    const finish = (completed) => {
      if (finished) return
      finished = true
      clearTimeout(safety)
      if (my === token) {
        current = null
        setSpeaking(false)
      }
      resolve(completed)
    }
    src.onended = () => finish(true)
    current = () => {
      try {
        src.stop()
      } catch {
        /* schon gestoppt */
      }
      finish(false)
    }
    setSpeaking(true)
    src.start()
    // Sicherheitsnetz, falls "ended" nie kommt (z. B. pausierter Audio-Kontext)
    safety = setTimeout(() => finish(true), buffer.duration * 1000 + 1500)
  })
}

let germanVoice
function pickGermanVoice() {
  if (germanVoice !== undefined) return germanVoice
  const voices = window.speechSynthesis.getVoices()
  germanVoice = voices.find((v) => v.lang === 'de-DE' && v.localService) || voices.find((v) => v.lang?.startsWith('de')) || null
  if (!voices.length) germanVoice = undefined
  return germanVoice
}

function speakFallback(text, my) {
  if (!('speechSynthesis' in window)) return Promise.resolve(true)
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(normalizeText(text))
    u.lang = 'de-DE'
    u.rate = 0.95
    u.pitch = 1.05
    const voice = pickGermanVoice()
    if (voice) u.voice = voice
    let finished = false
    let safety = null
    const finish = (completed) => {
      if (finished) return
      finished = true
      clearTimeout(safety)
      if (my === token) {
        current = null
        setSpeaking(false)
      }
      resolve(completed)
    }
    u.onend = () => finish(true)
    u.onerror = () => finish(true)
    current = () => finish(false)
    setSpeaking(true)
    safety = setTimeout(() => finish(true), 1500 + text.length * 90)
    window.speechSynthesis.speak(u)
  })
}
