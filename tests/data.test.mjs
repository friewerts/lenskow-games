/**
 * Prüft Spielinhalte, Bilder und Sprachaufnahmen auf Vollständigkeit und Logik.
 * Aufruf: npm test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { WORDS } from '../src/data/words.js'
import {
  RHYME_GROUPS,
  ODD_CATEGORIES,
  ODD_LEVELS,
  FEED_ANIMALS,
  COUNT_THINGS,
  MEMORY_THEMES,
  SHADOW_POOL,
  MAZE_PAIRS,
  STICKERS,
  PATTERN_SETS,
  SOUND_LETTERS_ALL,
  SOUND_LETTERS_EASY,
} from '../src/data/content.js'
import { EXTRA_ICONS } from '../src/data/icons.js'
import { textKey } from '../src/core/textkey.js'
import { collectLines } from '../scripts/voice-lines.mjs'
import { wordsByLetter, makeSoundsRound, makeRhymeRound, makeOddRound, makePattern, generateMaze } from '../src/games/logic.js'

const root = new URL('..', import.meta.url).pathname
const iconExists = (name) => existsSync(`${root}public/e/${name}.svg`)

test('alle Bilder sind vorhanden', () => {
  for (const [id, word] of Object.entries(WORDS)) {
    assert.ok(iconExists(word.i), `Bild fehlt für ${id}: ${word.i}`)
    if (word.body) assert.ok(iconExists(word.body), `Bild fehlt für ${id}: ${word.body}`)
  }
  for (const name of EXTRA_ICONS) assert.ok(iconExists(name), `Bild fehlt: ${name}`)
})

test('alle Inhalte verweisen auf bekannte Wörter', () => {
  const ids = [
    ...RHYME_GROUPS.flat(),
    ...Object.values(ODD_CATEGORIES).flatMap((c) => [...c.items, ...c.odd]),
    ...FEED_ANIMALS.flatMap((a) => [a.id, a.food]),
    ...COUNT_THINGS.map((t) => t.id),
    ...MEMORY_THEMES.flat(),
    ...SHADOW_POOL,
    ...MAZE_PAIRS.flatMap((p) => [p.from, p.to]),
    ...STICKERS,
    ...PATTERN_SETS.flat(),
  ]
  for (const id of ids) assert.ok(WORDS[id], `Unbekanntes Wort: ${id}`)
})

test('Reimgruppen sind eindeutig', () => {
  const seen = new Set()
  for (const group of RHYME_GROUPS) {
    assert.ok(group.length >= 2)
    for (const id of group) {
      assert.ok(!seen.has(id), `${id} steht in zwei Reimgruppen`)
      seen.add(id)
    }
  }
})

test('Was passt nicht: Ausreißer gehören nie zur Kategorie', () => {
  for (const [name, cat] of Object.entries(ODD_CATEGORIES)) {
    assert.ok(cat.items.length >= 3, name)
    for (const id of cat.odd) assert.ok(!cat.items.includes(id), `${id} ist in ${name} beides`)
  }
  for (const list of Object.values(ODD_LEVELS)) for (const name of list) assert.ok(ODD_CATEGORIES[name], name)
  for (let i = 0; i < 300; i++) {
    const name = Object.keys(ODD_CATEGORIES)[i % Object.keys(ODD_CATEGORIES).length]
    const r = makeOddRound(name)
    assert.equal(r.options.length, 4)
    assert.equal(new Set(r.options).size, 4)
    assert.ok(!ODD_CATEGORIES[name].items.includes(r.odd))
  }
})

test('Anlaute: richtige Antwort teilt den Laut, Ablenker nicht', () => {
  const byLetter = wordsByLetter()
  for (const l of [...SOUND_LETTERS_ALL, ...SOUND_LETTERS_EASY]) assert.ok(byLetter[l]?.length >= 2, `Zu wenige Wörter für ${l}`)
  for (let i = 0; i < 500; i++) {
    const level = (i % 3) + 1
    const letter = SOUND_LETTERS_ALL[i % SOUND_LETTERS_ALL.length]
    const r = makeSoundsRound(level, byLetter, letter)
    assert.notEqual(r.target, r.correct)
    assert.equal(WORDS[r.correct].a, letter)
    assert.ok(r.options.includes(r.correct))
    assert.equal(new Set(r.options).size, r.options.length)
    assert.equal(r.options.length, { 1: 2, 2: 3, 3: 4 }[level])
    const letters = r.options.map((id) => WORDS[id].a)
    assert.equal(letters.filter((l) => l === letter).length, 1, `Mehrdeutig: ${r.options}`)
    assert.equal(new Set(letters).size, letters.length, `Zwei Ablenker mit gleichem Laut: ${r.options}`)
  }
})

test('Reime: genau eine Antwort reimt sich', () => {
  for (let i = 0; i < 500; i++) {
    const level = (i % 3) + 1
    const group = RHYME_GROUPS[i % RHYME_GROUPS.length]
    const r = makeRhymeRound(level, group)
    assert.ok(group.includes(r.target) && group.includes(r.correct))
    assert.notEqual(r.target, r.correct)
    assert.equal(r.options.filter((id) => group.includes(id)).length, 1)
    assert.equal(r.options.length, { 1: 2, 2: 3, 3: 3 }[level])
    const groups = r.options.map((id) => RHYME_GROUPS.findIndex((g) => g.includes(id)))
    assert.equal(new Set(groups).size, groups.length, `Ablenker reimen sich: ${r.options}`)
  }
})

test('Muster: Antwort folgt der Regel', () => {
  for (const unit of ['AB', 'AAB', 'ABB', 'ABC', 'AABB', 'ABCD', 'ABAC', 'gap']) {
    for (let i = 0; i < 100; i++) {
      const slots = 6 + (i % 4)
      const p = makePattern(unit, slots)
      assert.ok(p.items.length <= slots, `${unit}: zu lang`)
      assert.ok(p.answerIndex >= 0 && p.answerIndex < p.items.length)
      assert.equal(p.items[p.answerIndex], p.unit[p.answerIndex % p.unit.length])
      if (!p.gap) assert.equal(p.answerIndex, p.items.length - 1)
      // vor der Lücke ist das Muster mindestens einmal komplett zu sehen
      assert.ok(p.answerIndex >= p.unit.length, `${unit}: Muster nicht erkennbar`)
    }
  }
})

test('Labyrinth: jedes Feld ist erreichbar', () => {
  for (const [cols, rows] of [[4, 3], [3, 4], [5, 4], [7, 5], [5, 7]]) {
    for (let i = 0; i < 30; i++) {
      const m = generateMaze(cols, rows, i % 3)
      const seen = new Set([0])
      const queue = [0]
      while (queue.length) {
        const c = queue.shift()
        for (const n of m.neighbors(c)) if (!seen.has(n) && m.open.has(m.key(c, n))) seen.add(n) && queue.push(n)
      }
      assert.equal(seen.size, cols * rows)
    }
  }
})

test('jede Ansage hat eine Sprachaufnahme', () => {
  const lines = collectLines()
  const manifest = new Set(JSON.parse(readFileSync(`${root}src/data/voice-manifest.json`, 'utf8')))
  const files = new Set(readdirSync(`${root}public/voice`).map((f) => f.replace('.mp3', '')))
  const missing = lines.filter((t) => !manifest.has(textKey(t)) || !files.has(textKey(t)))
  assert.deepEqual(missing, [], `Fehlende Aufnahmen (npm run voice:lines + scripts/generate_voice.py): ${missing.slice(0, 10).join(' | ')}`)
  const keys = new Set(lines.map(textKey))
  assert.equal(keys.size, lines.length, 'Schlüssel-Kollision')
})
