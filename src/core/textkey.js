/**
 * Erzeugt einen stabilen Dateinamen für einen gesprochenen Text.
 * Wird im Browser (voice.js) und im Node-Skript (voice-lines.mjs) genutzt.
 */
export function normalizeText(text) {
  return String(text).trim().replace(/\s+/g, ' ')
}

export function textKey(text) {
  const s = normalizeText(text)
  // FNV-1a (32 bit) + djb2 (32 bit) → 64 bit Schlüssel
  let fnv = 0x811c9dc5
  let djb = 5381
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    fnv ^= c
    fnv = Math.imul(fnv, 0x01000193) >>> 0
    djb = (Math.imul(djb, 33) + c) >>> 0
  }
  return fnv.toString(36).padStart(7, '0') + djb.toString(36).padStart(7, '0')
}
