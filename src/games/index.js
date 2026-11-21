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
  denken: { name: 'Denken & Sehen' },
  merken: { name: 'Merken & Hören' },
  kreativ: { name: 'Geschick & Kreativität' },
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
    info: 'Punkte in der richtigen Reihenfolge verbinden, bis ein Bild entsteht. Übt die Zahlenreihe (bis 6, 10 bzw. 16) und die Feinmotorik.',
    load: () => import('./dots.js'),
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
    id: 'shadows',
    area: 'denken',
    art: { main: 'elephant', shadow: true },
    info: 'Bilder auf den passenden Schatten ziehen. Übt visuelle Wahrnehmung (Formen erkennen) und die Hand-Auge-Koordination.',
    load: () => import('./shadows.js'),
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
    id: 'maze',
    area: 'kreativ',
    art: { main: 'mouse-face', side: 'cheese-wedge', maze: true },
    info: 'Mit dem Finger den Weg durch das Labyrinth finden. Übt vorausschauendes Planen und Feinmotorik.',
    load: () => import('./maze.js'),
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
