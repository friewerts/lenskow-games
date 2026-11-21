/**
 * Alle gesprochenen Sätze. Spiele verwenden ausschließlich diese Texte bzw.
 * die Funktionen unten, damit das Sprach-Skript jede Zeile vorab als
 * Audiodatei erzeugen kann (siehe scripts/voice-lines.mjs).
 */
import { WORDS } from './words.js'
import { FEED_ANIMALS, COUNT_THINGS } from './content.js'

export const NUMBER_WORDS = [
  'null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
  'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig',
]

/** Gesprochene Zahl, z. B. 3 → "drei" (für das Mitzählen). */
export const numberWord = (n) => NUMBER_WORDS[n]

/** Zahl für Satzanfänge/Ausrufe, z. B. 3 → "Drei!" */
export const numberExclaim = (n) => `${capitalize(NUMBER_WORDS[n])}!`

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const T = {
  welcome: 'Hallo! Schön, dass du da bist. Such dir ein Spiel aus!',
  homeHelp: 'Tippe auf ein Bild, dann geht es los.',
  letsGo: 'Los geht’s!',

  praise: [
    'Super!', 'Toll gemacht!', 'Richtig!', 'Klasse!', 'Prima!', 'Genau!',
    'Spitze!', 'Wunderbar!', 'Sehr gut!', 'Juhu!', 'Bravo!', 'Perfekt!',
  ],
  tryAgain: [
    'Hmm, versuch es noch einmal.',
    'Fast! Probier es noch einmal.',
    'Schau noch einmal genau hin.',
    'Das war es nicht. Versuch es noch mal.',
  ],

  finished: [
    'Geschafft! Hier ist ein Sticker für dich.',
    'Super gemacht! Du bekommst einen Sticker.',
    'Toll gespielt! Schau mal, ein neuer Sticker!',
  ],
  finishedNoSticker: 'Super gemacht! Du hast schon alle Sticker gesammelt!',
  playAgain: 'Noch einmal spielen?',
  levelUp: 'Du bist eine Stufe weiter!',
  stickerLocked: 'Diesen Sticker kannst du noch gewinnen.',
  album: 'Das ist dein Stickerheft. Jedes Spiel bringt einen neuen Sticker.',
  albumEmpty: 'Dein Stickerheft ist noch leer. Spiel ein Spiel, dann bekommst du einen Sticker!',
  myPictures: 'Das sind deine Bilder.',

  // --- Tiere füttern ---
  feedHungry: 'Ich habe Hunger!',
  feedHowTo: 'Leg das Essen auf den Teller. Wenn du fertig bist, tippe auf den grünen Haken.',
  feedYummy: ['Mmh, lecker! Danke!', 'Mjam, mjam! Das war lecker!', 'Danke, jetzt bin ich satt!'],
  feedTooFew: 'Das ist noch zu wenig. Ich möchte mehr!',
  feedTooMany: 'Oh, das ist zu viel! Nimm wieder etwas weg.',
  feedEmpty: 'Der Teller ist ja noch leer!',

  // --- Wie viele? ---
  countHowTo: 'Zähl genau und tippe auf die richtige Zahl.',
  countHint: 'Tippe die Bilder an, dann zählen wir zusammen.',
  diceQuestion: 'Wie viele Punkte hat der Würfel?',

  // --- Punkt zu Punkt ---
  dotsStart: 'Verbinde die Punkte. Fang bei eins an!',
  dotsNext: 'Welche Zahl kommt jetzt?',

  // --- Anlaute ---
  soundsHowTo: 'Hör genau hin, wie die Wörter anfangen.',
  soundsSame: 'Die fangen gleich an!',

  // --- Reime ---
  rhymesHowTo: 'Hör gut zu. Was klingt am Ende gleich?',
  rhymesYes: 'Das reimt sich!',
  rhymesNo: 'Das reimt sich nicht.',

  // --- Muster ---
  patternQuestion: 'Was kommt als Nächstes?',
  patternGap: 'Was fehlt in der Reihe?',

  // --- Was passt nicht? ---
  oddQuestion: 'Was passt nicht dazu?',

  // --- Schatten ---
  shadowsHowTo: 'Zieh jedes Bild auf seinen Schatten.',

  // --- Memory ---
  memoryHowTo: 'Finde immer zwei gleiche Bilder.',

  // --- Melodie ---
  melodyListen: 'Hör gut zu!',
  melodyYourTurn: 'Jetzt du!',
  melodyAgain: 'Hör noch einmal genau zu.',

  // --- Labyrinth ---
  mazeHowTo: 'Zieh mit dem Finger den Weg entlang.',

  // --- Malen ---
  paintHello: 'Mal ein schönes Bild!',
  paintSaved: 'Das ist aber schön! Ich hebe dein Bild auf.',
  paintClear: 'Soll das Bild weg?',

  // --- Eltern ---
  parentsGate: 'Dieser Bereich ist für Erwachsene.',
}

/** Spielnamen und kurze Anleitungen (Startansage je Spiel). */
export const GAME_TEXTS = {
  feed: { name: 'Tiere füttern' },
  count: { name: 'Wie viele?' },
  dots: { name: 'Punkt zu Punkt' },
  sounds: { name: 'Erste Laute' },
  rhymes: { name: 'Reime' },
  patterns: { name: 'Muster' },
  odd: { name: 'Was passt nicht?' },
  shadows: { name: 'Schatten' },
  memory: { name: 'Memory' },
  melody: { name: 'Melodie' },
  maze: { name: 'Labyrinth' },
  paint: { name: 'Malen' },
}

/** "Ich möchte drei Karotten." */
export function feedRequest(animal, n) {
  return n === 1 ? `Ich möchte ${animal.one}.` : `Ich möchte ${NUMBER_WORDS[n]} ${animal.many}.`
}

/** "Wie viele Äpfel siehst du?" */
export function countQuestion(thing) {
  return `Wie viele ${thing.many} siehst du?`
}

/** "Was fängt an wie Maus?" */
export function soundsQuestion(wordId) {
  return `Was fängt an wie ${WORDS[wordId].w}?`
}

/** "Was reimt sich auf Maus?" */
export function rhymeQuestion(wordId) {
  return `Was reimt sich auf ${WORDS[wordId].w}?`
}

/** Name eines Wortes als einzelne Ansage, z. B. "Maus". */
export function wordSay(wordId) {
  return WORDS[wordId].w
}

/** Namen der Bilder, die beim Punkt-zu-Punkt-Spiel entstehen. */
export const DOT_SHAPE_SAY = {
  haus: 'Ein Haus!',
  diamant: 'Ein Diamant!',
  drachen: 'Ein Drachen!',
  eis: 'Ein Eis!',
  boot: 'Ein Segelboot!',
  krone: 'Eine Krone!',
  blitz: 'Ein Blitz!',
  fisch: 'Ein Fisch!',
  rakete: 'Eine Rakete!',
  pilz: 'Ein Pilz!',
  auto: 'Ein Auto!',
  katze: 'Eine Katze!',
  ballon: 'Ein Luftballon!',
  herz: 'Ein Herz!',
  stern: 'Ein Stern!',
  tanne: 'Ein Tannenbaum!',
  schmetterling: 'Ein Schmetterling!',
  haus2: 'Ein Haus mit Schornstein!',
  burg: 'Eine Burg!',
  hase: 'Ein Hase!',
}

export { FEED_ANIMALS, COUNT_THINGS }
