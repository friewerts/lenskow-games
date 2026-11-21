/**
 * Kopiert alle benötigten Noto-Emoji (Apache 2.0) als einzelne SVG-Dateien
 * nach public/e/. Aufruf: npm run emoji
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WORDS } from '../src/data/words.js'
import { EXTRA_ICONS } from '../src/data/icons.js'
import { ORDER_SEQUENCES } from '../src/data/content.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'e')
const set = JSON.parse(readFileSync(join(root, 'node_modules/@iconify-json/noto/icons.json'), 'utf8'))

function resolve(name) {
  if (set.icons[name]) return { ...set.icons[name] }
  const alias = set.aliases?.[name]
  if (alias) return { ...set.icons[alias.parent], ...alias }
  return null
}

const names = new Set([...EXTRA_ICONS, ...ORDER_SEQUENCES.flatMap((s) => s.icons)])
for (const word of Object.values(WORDS)) {
  names.add(word.i)
  if (word.body) names.add(word.body)
}

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const missing = []
let bytes = 0
for (const name of [...names].sort()) {
  const icon = resolve(name)
  if (!icon) {
    missing.push(name)
    continue
  }
  const w = icon.width ?? set.width ?? 128
  const h = icon.height ?? set.height ?? 128
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${icon.left ?? 0} ${icon.top ?? 0} ${w} ${h}">${icon.body}</svg>`
  writeFileSync(join(outDir, `${name}.svg`), svg)
  bytes += svg.length
}

if (missing.length) {
  console.error('Fehlende Emoji:', missing.join(', '))
  process.exit(1)
}
console.log(`${readdirSync(outDir).length} Emoji geschrieben (${Math.round(bytes / 1024)} KB)`)
