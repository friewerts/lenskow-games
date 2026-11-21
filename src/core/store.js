/**
 * Speicherstand im Browser (localStorage): Einstellungen, Stufen, Sticker, Bilder.
 */
import { STICKERS } from '../data/content.js'
import { pick, shuffle } from './dom.js'

const KEY = 'lenskow-lernspiele-v2'

const DEFAULTS = {
  voice: true,
  sound: true,
  levels: {}, // automatisch ermittelte Stufe je Spiel (1–3)
  fixed: {}, // von Eltern festgelegte Stufe je Spiel (1–3) – überschreibt levels
  plays: {}, // Anzahl abgeschlossener Runden je Spiel
  stickers: [], // gesammelte Sticker-IDs (Reihenfolge = Sammelreihenfolge)
  newStickers: [], // noch nicht im Stickerheft angesehen
  drawings: [], // gespeicherte Bilder (Data-URLs, neueste zuerst)
  intro: {}, // Anleitung schon einmal gehört?
  daily: null, // Tagesprogramm { date, games, done, rewarded }
}

let state = load()
let saveTimer = null

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(DEFAULTS)
    return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

function save() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, 150)
}

export function flush() {
  clearTimeout(saveTimer)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Speicher voll oder nicht verfügbar: älteste Bilder verwerfen und erneut versuchen
    if (state.drawings.length > 1) {
      state.drawings = state.drawings.slice(0, Math.ceil(state.drawings.length / 2))
      try {
        localStorage.setItem(KEY, JSON.stringify(state))
      } catch {
        /* ignorieren */
      }
    }
  }
}

window.addEventListener('pagehide', flush)

/* ---------- Einstellungen ---------- */
export const settings = {
  get voice() {
    return state.voice
  },
  set voice(v) {
    state.voice = !!v
    save()
  },
  get sound() {
    return state.sound
  },
  set sound(v) {
    state.sound = !!v
    save()
  },
}

/* ---------- Stufen ---------- */
export function levelFor(gameId) {
  return state.fixed[gameId] || state.levels[gameId] || 1
}

export function autoLevel(gameId) {
  return state.levels[gameId] || 1
}

export function fixedLevel(gameId) {
  return state.fixed[gameId] || 0
}

export function setFixedLevel(gameId, level) {
  if (level) state.fixed[gameId] = level
  else delete state.fixed[gameId]
  save()
}

/**
 * Ergebnis einer Runde speichern und die Stufe anpassen:
 * kaum Fehler → eine Stufe höher, sehr viele Fehler → eine Stufe leichter.
 */
export function recordResult(gameId, { mistakes = 0, rounds = 1 } = {}) {
  state.plays[gameId] = (state.plays[gameId] || 0) + 1
  const before = state.levels[gameId] || 1
  let after = before
  if (mistakes <= Math.max(1, Math.floor(rounds / 4))) after = Math.min(3, before + 1)
  else if (mistakes >= rounds * 1.5) after = Math.max(1, before - 1)
  state.levels[gameId] = after
  save()
  return { before, after, levelUp: after > before && !state.fixed[gameId] }
}

export function playsOf(gameId) {
  return state.plays[gameId] || 0
}

export function introHeard(gameId) {
  return !!state.intro[gameId]
}

export function markIntroHeard(gameId) {
  state.intro[gameId] = true
  save()
}

/* ---------- Sticker ---------- */
export function stickers() {
  return [...state.stickers]
}

export function newStickers() {
  return [...state.newStickers]
}

export function markStickersSeen() {
  state.newStickers = []
  save()
}

/** Neuen Sticker vergeben. Gibt null zurück, wenn schon alle gesammelt sind. */
export function awardSticker() {
  const missing = STICKERS.filter((id) => !state.stickers.includes(id))
  if (!missing.length) return null
  const id = pick(missing)
  state.stickers.push(id)
  state.newStickers.push(id)
  save()
  return id
}

/* ---------- Bilder ---------- */
export const MAX_DRAWINGS = 12

export function drawings() {
  return [...state.drawings]
}

export function addDrawing(dataUrl) {
  state.drawings.unshift({ url: dataUrl, at: Date.now() })
  state.drawings = state.drawings.slice(0, MAX_DRAWINGS)
  save()
  flush()
}

export function removeDrawing(index) {
  state.drawings.splice(index, 1)
  save()
}

/* ---------- Tagesprogramm ---------- */
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Drei Spiele für heute – aus drei verschiedenen Bereichen, bevorzugt selten gespielte. */
export function dailyPlan(games) {
  const today = todayKey()
  const valid = state.daily && state.daily.date === today && state.daily.games.every((id) => games.some((g) => g.id === id))
  if (!valid) {
    const byArea = {}
    for (const g of games) if (g.area !== 'kreativ') (byArea[g.area] ||= []).push(g)
    const areas = shuffle(Object.keys(byArea)).slice(0, 3)
    const picks = areas.map((area) => {
      const list = shuffle(byArea[area])
      list.sort((a, b) => (state.plays[a.id] || 0) - (state.plays[b.id] || 0))
      return list[0].id
    })
    state.daily = { date: today, games: picks, done: [], rewarded: false }
    save()
  }
  return structuredClone(state.daily)
}

/** Spiel im Tagesprogramm abhaken. completedNow = gerade das ganze Programm geschafft. */
export function markDailyDone(gameId) {
  const d = state.daily
  if (!d || d.date !== todayKey() || !d.games.includes(gameId)) return { completedNow: false }
  if (!d.done.includes(gameId)) d.done.push(gameId)
  const completedNow = d.games.every((id) => d.done.includes(id)) && !d.rewarded
  if (completedNow) d.rewarded = true
  save()
  return { completedNow }
}

/* ---------- Zurücksetzen ---------- */
export function resetProgress() {
  const { voice, sound } = state
  state = { ...structuredClone(DEFAULTS), voice, sound }
  flush()
}
