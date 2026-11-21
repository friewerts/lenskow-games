/**
 * Reine Spiellogik (ohne Darstellung) – wird von den Spielen und den Tests genutzt.
 */
import { pick, pickN, shuffle, randInt, clamp } from '../core/dom.js'
import { WORDS } from '../data/words.js'
import { RHYME_GROUPS, ODD_CATEGORIES } from '../data/content.js'

/* ---------------- Anlaute ---------------- */
export const SOUND_OPTIONS = { 1: 2, 2: 3, 3: 4 }

// Ähnlich klingende Laute – auf Stufe 1 und 2 nicht als Ablenker verwenden
const SIMILAR = { B: 'P', P: 'B', D: 'T', T: 'D', G: 'K', K: 'G', M: 'N', N: 'M', E: 'I', I: 'E' }

export function wordsByLetter() {
  const map = {}
  for (const [id, word] of Object.entries(WORDS)) if (word.a) (map[word.a] ||= []).push(id)
  return map
}

export function makeSoundsRound(level, byLetter, letter, used = new Set()) {
  const own = byLetter[letter]
  const fresh = own.filter((id) => !used.has(id))
  const [target, correct] = pickN(fresh.length >= 2 ? fresh : own, 2)
  const others = shuffle(Object.keys(byLetter).filter((l) => l !== letter && (level === 3 || SIMILAR[letter] !== l)))
  const distractors = others.slice(0, SOUND_OPTIONS[level] - 1).map((l) => pick(byLetter[l]))
  return { target, correct, letter, options: shuffle([correct, ...distractors]) }
}

/* ---------------- Reime ---------------- */
export const RHYME_OPTIONS = { 1: 2, 2: 3, 3: 3 }

export function makeRhymeRound(level, group) {
  const [target, correct] = pickN(group, 2)
  const otherWords = RHYME_GROUPS.filter((g) => g !== group).flat()
  let preferred = []
  if (level === 3) {
    // Schwerer: Ablenker mit gleichem Anfangsbuchstaben – nur das Ende zählt!
    const first = WORDS[target].w[0]
    preferred = shuffle(otherWords.filter((id) => WORDS[id].w[0] === first))
  }
  const rest = shuffle(otherWords.filter((id) => !preferred.includes(id)))
  // Höchstens ein Wort pro anderer Reimgruppe, damit sich Ablenker nicht untereinander reimen
  const chosen = []
  for (const id of [...preferred, ...rest]) {
    if (chosen.length >= RHYME_OPTIONS[level] - 1) break
    const g = RHYME_GROUPS.find((grp) => grp.includes(id))
    if (chosen.some((c) => g.includes(c))) continue
    chosen.push(id)
  }
  return { target, correct, options: shuffle([correct, ...chosen]) }
}

/* ---------------- Was passt nicht? ---------------- */
export function makeOddRound(categoryId) {
  const cat = ODD_CATEGORIES[categoryId]
  const members = pickN(cat.items, 3)
  const odd = pick(cat.odd.filter((id) => !cat.items.includes(id)))
  return { categoryId, members, odd, options: shuffle([...members, odd]) }
}

/* ---------------- Muster ---------------- */
/** Erzeugt eine Musterreihe. Ergebnis: { items: [Buchstaben], answerIndex, unit, gap } */
export function makePattern(unitName, maxSlots) {
  const gap = unitName === 'gap'
  const unit = gap ? pick(['ABC', 'AB', 'AAB', 'ABB']) : unitName
  const len = unit.length
  let total
  if (gap) total = Math.min(maxSlots, len * 3)
  else {
    // mindestens zwei volle Wiederholungen sichtbar (außer bei langen Mustern)
    const minVisible = Math.min(len * 2, maxSlots - 1)
    const visible = clamp(minVisible + randInt(0, len - 1), minVisible, maxSlots - 1)
    total = visible + 1
  }
  const items = Array.from({ length: total }, (_, i) => unit[i % len])
  const answerIndex = gap ? randInt(len, total - 2) : total - 1
  return { items, answerIndex, unit, gap }
}

/* ---------------- Labyrinth ---------------- */
/** Labyrinth erzeugen (Tiefensuche). Ergebnis: Menge offener Verbindungen "a-b". */
export function generateMaze(cols, rows, extraOpenings = 0) {
  const open = new Set()
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)
  const neighbors = (c) => {
    const x = c % cols
    const y = Math.floor(c / cols)
    const out = []
    if (x > 0) out.push(c - 1)
    if (x < cols - 1) out.push(c + 1)
    if (y > 0) out.push(c - cols)
    if (y < rows - 1) out.push(c + cols)
    return out
  }
  const visited = new Set([0])
  const stack = [0]
  while (stack.length) {
    const c = stack[stack.length - 1]
    const next = shuffle(neighbors(c)).find((n) => !visited.has(n))
    if (next === undefined) {
      stack.pop()
      continue
    }
    open.add(key(c, next))
    visited.add(next)
    stack.push(next)
  }
  // Zusätzliche Durchgänge machen das Labyrinth leichter (weniger Sackgassen)
  let extra = extraOpenings
  for (let tries = 0; tries < 50 && extra > 0; tries++) {
    const c = randInt(0, cols * rows - 1)
    const n = pick(neighbors(c))
    if (!open.has(key(c, n))) {
      open.add(key(c, n))
      extra--
    }
  }
  return { cols, rows, open, key, neighbors }
}
