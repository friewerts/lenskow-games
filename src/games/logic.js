/**
 * Reine Spiellogik (ohne Darstellung) – wird von den Spielen und den Tests genutzt.
 */
import { pick, pickN, shuffle, randInt, clamp } from '../core/dom.js'
import { WORDS } from '../data/words.js'
import { RHYME_GROUPS, ODD_CATEGORIES, RIDDLES } from '../data/content.js'

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

const range = (n) => Array.from({ length: n }, (_, i) => i)

/* ---------------- Bilder-Sudoku ---------------- */
/** Anzahl Lösungen eines (teilweise leeren) n×n-Lateinischen Quadrats, höchstens `limit`. */
export function countSudokuSolutions(grid, n, limit = 2) {
  const g = grid.map((row) => [...row])
  let count = 0
  const solve = () => {
    let pos = -1
    for (let i = 0; i < n * n && pos < 0; i++) if (g[Math.floor(i / n)][i % n] == null) pos = i
    if (pos < 0) {
      count++
      return count >= limit
    }
    const r = Math.floor(pos / n)
    const c = pos % n
    for (let v = 0; v < n; v++) {
      if (g[r].includes(v) || g.some((row) => row[c] === v)) continue
      g[r][c] = v
      if (solve()) return true
      g[r][c] = null
    }
    return false
  }
  solve()
  return count
}

/** Zufälliges Bilder-Sudoku (n×n) mit `blanks` leeren Feldern und genau einer Lösung. */
export function makeSudoku(n, blanks) {
  const rows = shuffle(range(n))
  const cols = shuffle(range(n))
  const sym = shuffle(range(n))
  const solution = rows.map((r) => cols.map((c) => sym[(r + c) % n]))
  const puzzle = solution.map((row) => [...row])
  let removed = 0
  for (const i of shuffle(range(n * n))) {
    if (removed >= blanks) break
    const r = Math.floor(i / n)
    const c = i % n
    const keep = puzzle[r][c]
    puzzle[r][c] = null
    if (countSudokuSolutions(puzzle, n, 2) === 1) removed++
    else puzzle[r][c] = keep
  }
  return { n, solution, puzzle, blanks: removed }
}

/** Mögliche Bilder für ein leeres Feld (nach Reihe und Spalte). */
export function sudokuCandidates(grid, n, r, c) {
  return range(n).filter((v) => !grid[r].includes(v) && !grid.some((row) => row[c] === v))
}

/* ---------------- Wer wohnt wo? ---------------- */
function permutations(list) {
  if (list.length <= 1) return [list]
  return list.flatMap((x, i) => permutations([...list.slice(0, i), ...list.slice(i + 1)]).map((p) => [x, ...p]))
}

/** Wie viele Zuordnungen (Tier i → Haus perm[i]) erfüllen alle Hinweise? */
export function houseSolutions(n, clues) {
  return permutations(range(n)).filter((perm) => clues.every((cl) => (perm[cl.animal] === cl.house) === cl.positive))
}

/**
 * Logikrätsel: n Tiere, n Häuser. Hinweise sind eindeutig und minimal
 * (jeder Hinweis wird gebraucht). Stufe 1: 2 Tiere, Stufe 2/3: 3 Tiere.
 */
export function makeHousePuzzle(level) {
  const n = level === 1 ? 2 : 3
  const cluesWanted = level === 1 ? 1 : level === 2 ? 2 : 3
  const minNegative = level === 1 ? 0 : level === 2 ? 1 : 2
  for (let attempt = 0; attempt < 2000; attempt++) {
    const solution = shuffle(range(n))
    const all = []
    for (let a = 0; a < n; a++) for (let hs = 0; hs < n; hs++) all.push({ animal: a, house: hs, positive: solution[a] === hs })
    const clues = pickN(all, cluesWanted)
    if (clues.filter((c) => !c.positive).length < minNegative) continue
    if (houseSolutions(n, clues).length !== 1) continue
    const minimal = clues.every((_, i) => houseSolutions(n, clues.filter((__, k) => k !== i)).length > 1)
    if (!minimal) continue
    return { n, solution, clues }
  }
  throw new Error('Kein Rätsel gefunden')
}

/* ---------------- Waage ---------------- */
/**
 * Stufe 1: eine Waage, welches Geschenk ist schwerer?
 * Stufe 2/3: zwei Waagen (schwer > mittel > leicht), welches ist am schwersten (bzw. leichtesten)?
 */
export function makeScaleRound(level, giftCount = 4) {
  if (level === 1) {
    const [a, b] = pickN(range(giftCount), 2)
    const heavy = pick([a, b])
    return { gifts: [a, b], scales: [{ left: a, right: b, heavy }], question: 'heavier', answer: heavy }
  }
  const [heavy, middle, light] = pickN(range(giftCount), 3)
  const side = (x, y) => (Math.random() < 0.5 ? { left: x, right: y } : { left: y, right: x })
  const scales = shuffle([
    { ...side(heavy, middle), heavy },
    { ...side(middle, light), heavy: middle },
  ])
  const question = level === 3 && Math.random() < 0.5 ? 'lightest' : 'heaviest'
  return { gifts: shuffle([heavy, middle, light]), scales, question, answer: question === 'lightest' ? light : heavy }
}

/* ---------------- Würfel zählen ---------------- */
/**
 * Bauwerk als Liste von Würfeln {x, y, z}. Höhenkarte, damit nichts schwebt.
 * Stufe 1/2: eine Reihe (alles sichtbar), Stufe 3: zwei Reihen (Würfel können verdeckt sein).
 */
export function makeCubeStructure(level) {
  const spec = {
    1: { width: [1, 4], depth: 1, maxH: 2, total: [2, 5] },
    2: { width: [2, 4], depth: 1, maxH: 3, total: [4, 8] },
    3: { width: [2, 3], depth: 2, maxH: 3, total: [5, 10] },
  }[level]
  for (let attempt = 0; attempt < 500; attempt++) {
    const width = randInt(...spec.width)
    const heights = []
    for (let y = 0; y < spec.depth; y++) {
      for (let x = 0; x < width; x++) {
        // hintere Reihe eher höher, damit man die Treppe sieht
        const min = y === 0 && spec.depth > 1 ? 1 : 0
        heights.push({ x, y, h: randInt(min, spec.maxH) })
      }
    }
    const total = heights.reduce((s, c) => s + c.h, 0)
    if (total < spec.total[0] || total > spec.total[1]) continue
    // jede Spalte der vorderen Reihe muss stehen, keine Lücken in der Reihe
    if (spec.depth === 1 && heights.some((c) => c.h === 0)) continue
    const cubes = []
    for (const c of heights) for (let z = 0; z < c.h; z++) cubes.push({ x: c.x, y: c.y, z })
    return { cubes, total, width, depth: spec.depth }
  }
  return { cubes: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }], total: 2, width: 2, depth: 1 }
}

/* ---------------- Spiegelbild ---------------- */
/** Zufällige Felder auf der linken Hälfte; die rechte Hälfte muss gespiegelt werden. */
export function makeMirrorPuzzle(rows, cols, count) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const cells = pickN(range(rows * cols), count).map((i) => ({ r: Math.floor(i / cols), c: i % cols }))
    // nicht alles in einer Spalte oder Zeile – sonst ist es zu leicht
    if (new Set(cells.map((p) => p.c)).size < Math.min(2, cols) || new Set(cells.map((p) => p.r)).size < Math.min(2, rows)) continue
    const answer = cells.map(({ r, c }) => ({ r, c: cols - 1 - c }))
    return { rows, cols, cells, answer }
  }
  return { rows, cols, cells: [{ r: 0, c: 0 }], answer: [{ r: 0, c: cols - 1 }] }
}

/* ---------------- Reihenfolge ---------------- */
export function makeSizeOrder(level, items) {
  const n = { 1: 3, 2: 4, 3: 5 }[level]
  const descending = level === 3 && Math.random() < 0.5
  const scales = range(n).map((i) => +(0.42 + (0.58 * i) / (n - 1)).toFixed(2))
  return { item: pick(items), scales: descending ? [...scales].reverse() : scales, descending }
}

/* ---------------- Rätsel ---------------- */
/** Stufe 1: ein ganz anderes Bild als Ablenker, Stufe 2: ein ähnliches + ein anderes, Stufe 3: zwei ähnliche. */
export function makeRiddleRound(level, riddle) {
  const near = shuffle(riddle.near)
  const far = shuffle(RIDDLES.map((r) => r.id).filter((id) => id !== riddle.id && !riddle.near.includes(id)))
  const distractors = level === 1 ? far.slice(0, 1) : level === 2 ? [near[0], far[0]] : near.slice(0, 2)
  return { target: riddle.id, correct: riddle.id, say: riddle.say, options: shuffle([riddle.id, ...distractors]) }
}
