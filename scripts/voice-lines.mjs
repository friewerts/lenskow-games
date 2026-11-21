/**
 * Sammelt alle Sätze, die die Spiele sprechen, und schreibt sie nach
 * scripts/voice-lines.json (Eingabe für scripts/generate_voice.py).
 * Aufruf: npm run voice:lines
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { T, GAME_TEXTS, NUMBER_WORDS, numberExclaim, feedRequest, countQuestion, soundsQuestion, rhymeQuestion, wordSay, DOT_SHAPE_SAY, houseClue, scaleAnswer } from '../src/data/texts.js'
import { FEED_ANIMALS, COUNT_THINGS, ODD_CATEGORIES, MAZE_PAIRS, RHYME_GROUPS, STICKERS, MEMORY_THEMES, SHADOW_POOL, RIDDLES, ORDER_SEQUENCES, HOUSE_ANIMALS, HOUSE_COLORS, SCALE_GIFTS } from '../src/data/content.js'
import { WORDS } from '../src/data/words.js'
import { textKey, normalizeText } from '../src/core/textkey.js'

export function collectLines() {
  const lines = new Set()
  const add = (text) => text && lines.add(normalizeText(text))
  const words = new Set()

  for (const value of Object.values(T)) (Array.isArray(value) ? value : [value]).forEach(add)
  Object.values(GAME_TEXTS).forEach((g) => add(g.name))
  NUMBER_WORDS.slice(1).forEach(add)
  for (let n = 1; n <= 20; n++) add(numberExclaim(n))

  for (const animal of FEED_ANIMALS) for (let n = 1; n <= 10; n++) add(feedRequest(animal, n))
  COUNT_THINGS.forEach((thing) => add(countQuestion(thing)))

  for (const [id, word] of Object.entries(WORDS)) {
    if (word.a) {
      add(soundsQuestion(id))
      words.add(id)
    }
  }
  for (const id of RHYME_GROUPS.flat()) {
    add(rhymeQuestion(id))
    words.add(id)
  }
  for (const cat of Object.values(ODD_CATEGORIES)) {
    add(cat.say)
    cat.items.forEach((id) => words.add(id))
    cat.odd.forEach((id) => words.add(id))
  }
  MAZE_PAIRS.forEach((p) => add(p.say))
  Object.values(DOT_SHAPE_SAY).forEach(add)
  STICKERS.forEach((id) => words.add(id))
  MEMORY_THEMES.flat().forEach((id) => words.add(id))
  SHADOW_POOL.forEach((id) => words.add(id))

  for (const riddle of RIDDLES) {
    add(riddle.say)
    words.add(riddle.id)
    riddle.near.forEach((id) => words.add(id))
  }
  ORDER_SEQUENCES.forEach((seq) => add(seq.say))
  for (const animal of HOUSE_ANIMALS) for (const color of HOUSE_COLORS) for (const pos of [true, false]) add(houseClue(animal, color, pos))
  for (const gift of SCALE_GIFTS) for (const kind of ['heavier', 'heaviest', 'lightest']) add(scaleAnswer(gift, kind))

  for (const id of words) {
    if (!WORDS[id]) throw new Error(`Unbekanntes Wort in den Spielinhalten: ${id}`)
    add(wordSay(id))
  }
  return [...lines]
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const lines = collectLines()
  const seen = new Map()
  const out = lines.map((text) => {
    const key = textKey(text)
    if (seen.has(key)) throw new Error(`Schlüssel-Kollision: "${text}" / "${seen.get(key)}"`)
    seen.set(key, text)
    return { key, text }
  })
  const file = join(dirname(fileURLToPath(import.meta.url)), 'voice-lines.json')
  writeFileSync(file, JSON.stringify(out, null, 1))
  console.log(`${out.length} Sätze → ${file}`)
}
