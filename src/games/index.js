/**
 * Liste aller Spiele. Reihenfolge = Reihenfolge auf dem Startbildschirm.
 *
 * area: Farbe/Bereich der Kachel
 * art:  Bildkomposition der Kachel (Emoji-Namen, optional Text)
 * info: Beschreibung für den Elternbereich
 */
import { GAME_TEXTS } from '../data/texts.js'

export const AREAS = {
  zahlen: { name: 'Zahlen & Mengen' },
  sprache: { name: 'Sprache & Laute' },
  denken: { name: 'Logik & Denken' },
  raum: { name: 'Raum & Formen' },
  merken: { name: 'Merken & Hören' },
  kreativ: { name: 'Malen & Gestalten' },
}

export const GAMES = [
  {
    id: 'feed',
    area: 'zahlen',
    art: { main: 'rabbit-face', side: 'carrot' },
    info: 'Das Kind legt die gewünschte Anzahl Futter auf den Teller. Übt Zählen, Eins-zu-eins-Zuordnung und Mengen bilden (bis 5, 8 bzw. 10).',
    load: () => import('./feed.js'),
  },
  {
    id: 'count',
    area: 'zahlen',
    art: { main: 'lady-beetle', side: 'lady-beetle', third: 'lady-beetle' },
    info: 'Wie viele Dinge sind es? Übt Abzählen, das schnelle Erfassen kleiner Mengen (Würfelbilder) und das Erkennen der Ziffern 1–10.',
    load: () => import('./count.js'),
  },
  {
    id: 'dots',
    area: 'zahlen',
    art: { dots: true },
    info: 'Punkte in der richtigen Reihenfolge verbinden, bis ein Bild entsteht. Übt die Zahlenreihe (bis 7, 10 bzw. 17) und die Feinmotorik.',
    load: () => import('./dots.js'),
  },
  {
    id: 'scale',
    area: 'zahlen',
    art: { main: 'balance-scale' },
    info: 'Waagen ablesen: Was ist schwerer? Ab Stufe 2 müssen zwei Waagen verknüpft werden („Was ist am schwersten?“) – logisches Schlussfolgern über Vergleiche.',
    load: () => import('./scale.js'),
  },
  {
    id: 'sounds',
    area: 'sprache',
    art: { letter: 'M', side: 'mouse-face' },
    info: 'Welches Wort fängt genauso an? Fördert die phonologische Bewusstheit (Anlaute hören) – eine wichtige Vorläuferfähigkeit fürs Lesen. Der Buchstabe wird mitgezeigt.',
    load: () => import('./sounds.js'),
  },
  {
    id: 'rhymes',
    area: 'sprache',
    art: { main: 'mouse-face', side: 'house' },
    info: 'Was reimt sich? Fördert das genaue Hinhören auf Wortendungen (Reime erkennen) und erweitert den Wortschatz.',
    load: () => import('./rhymes.js'),
  },
  {
    id: 'riddles',
    area: 'sprache',
    art: { main: 'thinking-face', side: 'red-question-mark' },
    info: '„Wer bin ich?“-Rätsel zum Zuhören: Mehrere Hinweise müssen zusammen passen. Fördert Sprachverständnis, Wortschatz und Kombinieren.',
    load: () => import('./riddles.js'),
  },
  {
    id: 'patterns',
    area: 'denken',
    art: { row: ['red-apple', 'banana', 'red-apple'] },
    info: 'Was kommt als Nächstes? Muster erkennen und fortsetzen (AB, AAB, ABC …) – Grundlage für logisches und mathematisches Denken.',
    load: () => import('./patterns.js'),
  },
  {
    id: 'odd',
    area: 'denken',
    art: { main: 'automobile', side: 'cat-face', third: 'dog-face' },
    info: 'Was passt nicht dazu? Oberbegriffe bilden und Dinge nach Merkmalen ordnen (Tiere, Obst, Farben, „kann fliegen“ …).',
    load: () => import('./odd.js'),
  },
  {
    id: 'order',
    area: 'denken',
    art: { order: ['egg', 'hatching-chick', 'chicken'] },
    info: 'Bilder in die richtige Reihenfolge bringen: Abläufe (Ei → Küken → Huhn, Tag und Nacht …) und Größen (von klein nach groß).',
    load: () => import('./order.js'),
  },
  {
    id: 'sudoku',
    area: 'denken',
    art: { sudoku: ['red-apple', 'banana', 'pear'] },
    info: 'Bilder-Sudoku mit 3×3 oder 4×4 Feldern: In jeder Reihe und Spalte jedes Bild nur einmal. Trainiert regelgeleitetes Denken und Ausschlussverfahren.',
    load: () => import('./sudoku.js'),
  },
  {
    id: 'houses',
    area: 'denken',
    art: { main: 'house', side: 'cat-face' },
    info: 'Logikrätsel: Bildkarten verraten, wer (nicht) in welchem Haus wohnt. Das Kind kombiniert die Hinweise – auch Verneinungen („wohnt nicht im roten Haus“).',
    load: () => import('./houses.js'),
  },
  {
    id: 'shadows',
    area: 'raum',
    art: { main: 'elephant', shadow: true },
    info: 'Bilder auf den passenden Schatten ziehen. Übt visuelle Wahrnehmung (Formen erkennen) und die Hand-Auge-Koordination.',
    load: () => import('./shadows.js'),
  },
  {
    id: 'mirror',
    area: 'raum',
    art: { mirror: 'butterfly' },
    info: 'Ein Muster an der Spiegelachse ergänzen. Schult Symmetrie-Verständnis und räumliche Orientierung (links/rechts).',
    load: () => import('./mirror.js'),
  },
  {
    id: 'cubes',
    area: 'raum',
    art: { cubes: true },
    info: 'Würfelbauten zählen. Auf Stufe 3 sind manche Würfel verdeckt – was oben liegt, braucht einen Würfel darunter. Räumliches Vorstellungsvermögen.',
    load: () => import('./cubes.js'),
  },
  {
    id: 'maze',
    area: 'raum',
    art: { main: 'mouse-face', side: 'cheese-wedge', maze: true },
    info: 'Mit dem Finger den Weg durch das Labyrinth finden. Übt vorausschauendes Planen und Feinmotorik.',
    load: () => import('./maze.js'),
  },
  {
    id: 'memory',
    area: 'merken',
    art: { cards: 'fox' },
    info: 'Klassisches Memory mit 6, 8 oder 12 Karten. Trainiert Konzentration und das Gedächtnis.',
    load: () => import('./memory.js'),
  },
  {
    id: 'melody',
    area: 'merken',
    art: { main: 'bird', side: 'musical-notes' },
    info: 'Eine Tonfolge anhören und nachspielen, sie wird mit der Zeit länger. Trainiert das Hörgedächtnis und die Aufmerksamkeit.',
    load: () => import('./melody.js'),
  },
  {
    id: 'paint',
    area: 'kreativ',
    art: { main: 'artist-palette', side: 'paintbrush' },
    info: 'Freies Malen mit Farben, Regenbogenpinsel und Stempeln. Bilder lassen sich im Stickerheft aufheben.',
    load: () => import('./paint.js'),
  },
].map((game) => ({ ...game, title: GAME_TEXTS[game.id].name }))

export function gameById(id) {
  return GAMES.find((g) => g.id === id)
}
