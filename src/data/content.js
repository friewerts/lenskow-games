/**
 * Spielinhalte. Alle Wörter verweisen auf Einträge in words.js.
 * Diese Datei hat keine Browser-Abhängigkeiten, damit das Sprach-Skript
 * (scripts/voice-lines.mjs) alle Sätze daraus erzeugen kann.
 */

/* ------------------------------------------------------------------ */
/* Reime                                                               */
/* ------------------------------------------------------------------ */
export const RHYME_GROUPS = [
  ['maus', 'haus'],
  ['hase', 'nase', 'vase'],
  ['kuh', 'schuh'],
  ['rose', 'hose', 'dose'],
  ['stein', 'bein', 'schwein'],
  ['turm', 'wurm'],
  ['glocke', 'socke'],
  ['fliege', 'ziege'],
  ['grille', 'brille'],
  ['igel', 'spiegel'],
  ['hahn', 'zahn', 'schwan', 'kran'],
  ['krone', 'zitrone', 'melone', 'bohne'],
  ['eis', 'reis', 'mais', 'kreis'],
  ['wal', 'schal'],
  ['boot', 'brot'],
  ['traube', 'taube', 'schraube'],
  ['hand', 'strand', 'elefant'],
  ['affe', 'giraffe'],
  ['ei', 'hai', 'papagei'],
  ['tanne', 'kanne', 'pfanne'],
  ['hund', 'mund'],
  ['bus', 'nuss'],
  ['flasche', 'tasche'],
  ['rakete', 'trompete'],
  ['fee', 'tee', 'klee'],
  ['ohr', 'tor'],
]

/* ------------------------------------------------------------------ */
/* Anlaute: Buchstaben, deren Laut Kinder gut heraushören können.      */
/* Stufe 1 nutzt nur die leichten (dehnbaren) Laute.                   */
/* ------------------------------------------------------------------ */
export const SOUND_LETTERS_EASY = ['A', 'E', 'F', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'U', 'W']
export const SOUND_LETTERS_ALL = [
  'A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'W', 'Z',
]

/* ------------------------------------------------------------------ */
/* Was passt nicht? — Kategorien mit passenden und "fremden" Bildern   */
/* ------------------------------------------------------------------ */
export const ODD_CATEGORIES = {
  tiere: {
    say: 'Die anderen sind alles Tiere.',
    items: ['hund', 'katze', 'hase', 'baer', 'loewe', 'elefant', 'giraffe', 'affe', 'pinguin', 'frosch', 'kuh', 'tiger', 'panda', 'koala', 'zebra'],
    odd: ['auto', 'ball', 'apfel', 'haus', 'buch', 'schuh', 'stuhl', 'trommel', 'kerze', 'regenschirm'],
  },
  essen: {
    say: 'Die anderen kann man essen.',
    items: ['apfel', 'banane', 'brot', 'kaese', 'karotte', 'pizza', 'erdbeere', 'kuchen', 'brezel', 'birne', 'tomate', 'keks'],
    odd: ['schuh', 'auto', 'buch', 'schere', 'hammer', 'ball', 'stuhl', 'schluessel', 'telefon', 'socke'],
  },
  fahrzeuge: {
    say: 'Die anderen sind alles Fahrzeuge.',
    items: ['auto', 'bus', 'zug', 'traktor', 'fahrrad', 'feuerwehr', 'polizeiauto', 'taxi', 'lastwagen', 'motorrad', 'krankenwagen', 'roller'],
    odd: ['apfel', 'katze', 'blume', 'hut', 'teddy', 'kuchen', 'baum', 'glocke'],
  },
  obst: {
    say: 'Die anderen sind alles Obst.',
    items: ['apfel', 'banane', 'birne', 'erdbeere', 'kirsche', 'traube', 'ananas', 'wassermelone', 'orange', 'kiwi', 'zitrone'],
    odd: ['karotte', 'brokkoli', 'brot', 'kaese', 'pizza', 'ei', 'gurke', 'kartoffel', 'zwiebel'],
  },
  gemuese: {
    say: 'Die anderen sind alles Gemüse.',
    items: ['karotte', 'brokkoli', 'gurke', 'tomate', 'kartoffel', 'paprika', 'mais', 'zwiebel', 'salat'],
    odd: ['apfel', 'banane', 'erdbeere', 'kirsche', 'keks', 'eis', 'traube', 'lolli'],
  },
  kleidung: {
    say: 'Die anderen kann man anziehen.',
    items: ['hose', 'tshirt', 'kleid', 'socke', 'schuh', 'muetze', 'hut', 'schal', 'handschuh', 'jacke', 'stiefel'],
    odd: ['banane', 'auto', 'hund', 'buch', 'tasse', 'gitarre', 'ball', 'blume'],
  },
  musik: {
    say: 'Mit den anderen kann man Musik machen.',
    items: ['gitarre', 'trommel', 'geige', 'trompete', 'klavier', 'floete', 'glocke', 'rassel', 'saxofon'],
    odd: ['apfel', 'hund', 'schuh', 'auto', 'loeffel', 'buch', 'kerze', 'stuhl'],
  },
  spielzeug: {
    say: 'Mit den anderen kann man spielen.',
    items: ['ball', 'teddy', 'wuerfel', 'puzzle', 'jojo', 'roboter', 'luftballon'],
    odd: ['zwiebel', 'zahnbuerste', 'brief', 'besen', 'tasse', 'hammer', 'schere'],
  },
  himmel: {
    say: 'Die anderen sieht man am Himmel.',
    items: ['sonne', 'mond', 'stern', 'wolke', 'regenbogen', 'blitz', 'flugzeug', 'luftballon'],
    odd: ['fisch', 'haus', 'schuh', 'baum', 'auto', 'kuchen', 'stuhl', 'apfel'],
  },
  wasser: {
    say: 'Die anderen leben im Wasser.',
    items: ['fisch', 'wal', 'delfin', 'hai', 'oktopus', 'qualle', 'krabbe', 'robbe', 'muschel'],
    odd: ['loewe', 'giraffe', 'kuh', 'hase', 'affe', 'elefant', 'katze', 'zebra'],
  },
  fliegen: {
    say: 'Die anderen können fliegen.',
    items: ['vogel', 'schmetterling', 'biene', 'flugzeug', 'hubschrauber', 'rakete', 'eule', 'fledermaus', 'papagei', 'taube'],
    odd: ['elefant', 'schnecke', 'auto', 'hund', 'zug', 'schildkroete', 'kuh', 'krokodil'],
  },
  bauernhof: {
    say: 'Die anderen leben auf dem Bauernhof.',
    items: ['kuh', 'schwein', 'schaf', 'huhn', 'pferd', 'ziege', 'hahn', 'esel', 'gans'],
    odd: ['loewe', 'giraffe', 'pinguin', 'hai', 'krokodil', 'zebra', 'kaenguru', 'nashorn'],
  },
  koerper: {
    say: 'Die anderen sind Teile von deinem Körper.',
    items: ['nase', 'ohr', 'mund', 'hand', 'fuss', 'bein', 'zahn', 'daumen'],
    odd: ['apfel', 'schuh', 'ball', 'auto', 'stern', 'hut', 'blume'],
  },
  rot: {
    say: 'Die anderen sind alle rot.',
    items: ['apfel', 'erdbeere', 'tomate', 'herz', 'kirsche', 'rose', 'feuerwehr', 'marienkaefer', 'krabbe'],
    odd: ['banane', 'gurke', 'zitrone', 'wal', 'brokkoli', 'kueken', 'frosch'],
  },
  gelb: {
    say: 'Die anderen sind alle gelb.',
    items: ['banane', 'zitrone', 'kueken', 'sonne', 'stern', 'kaese', 'mais', 'sonnenblume', 'taxi'],
    odd: ['apfel', 'gurke', 'erdbeere', 'frosch', 'tomate', 'wal', 'brokkoli'],
  },
  gruen: {
    say: 'Die anderen sind alle grün.',
    items: ['frosch', 'gurke', 'brokkoli', 'kaktus', 'salat', 'klee', 'raupe', 'birne', 'krokodil', 'paprika'],
    odd: ['apfel', 'banane', 'erdbeere', 'tomate', 'sonne', 'zitrone', 'herz'],
  },
}

/** Kategorien je Stufe (Stufe 1: sehr deutlich, Stufe 3: genauer hinsehen). */
export const ODD_LEVELS = {
  1: ['tiere', 'essen', 'fahrzeuge', 'rot', 'gelb', 'gruen'],
  2: ['tiere', 'fahrzeuge', 'kleidung', 'musik', 'spielzeug', 'himmel', 'koerper', 'obst', 'rot', 'gelb', 'gruen'],
  3: ['obst', 'gemuese', 'wasser', 'fliegen', 'bauernhof', 'himmel', 'musik', 'kleidung', 'spielzeug'],
}

/* ------------------------------------------------------------------ */
/* Tiere füttern                                                       */
/* ------------------------------------------------------------------ */
// one: Text für genau 1, many: Pluralform (für 2–10)
export const FEED_ANIMALS = [
  { id: 'hase', food: 'karotte', one: 'eine Karotte', many: 'Karotten' },
  { id: 'affe', food: 'banane', one: 'eine Banane', many: 'Bananen' },
  { id: 'maus', food: 'kaese', one: 'ein Stück Käse', many: 'Stück Käse' },
  { id: 'hund', food: 'knochen', one: 'einen Knochen', many: 'Knochen' },
  { id: 'eichhoernchen', food: 'nuss', one: 'eine Nuss', many: 'Nüsse' },
  { id: 'katze', food: 'fisch', one: 'einen Fisch', many: 'Fische' },
  { id: 'baer', food: 'honig', one: 'einen Topf Honig', many: 'Töpfe Honig' },
  { id: 'pferd', food: 'apfel', one: 'einen Apfel', many: 'Äpfel' },
  { id: 'igel', food: 'pilz', one: 'einen Pilz', many: 'Pilze' },
  { id: 'elefant', food: 'erdnuss', one: 'eine Erdnuss', many: 'Erdnüsse' },
]

/* ------------------------------------------------------------------ */
/* Wie viele? — Dinge zum Zählen (mit Pluralform)                      */
/* ------------------------------------------------------------------ */
export const COUNT_THINGS = [
  { id: 'marienkaefer', many: 'Marienkäfer' },
  { id: 'apfel', many: 'Äpfel' },
  { id: 'stern', many: 'Sterne' },
  { id: 'fisch', many: 'Fische' },
  { id: 'ente', many: 'Enten' },
  { id: 'biene', many: 'Bienen' },
  { id: 'blume', many: 'Blumen' },
  { id: 'ball', many: 'Bälle' },
  { id: 'erdbeere', many: 'Erdbeeren' },
  { id: 'herz', many: 'Herzen' },
  { id: 'schmetterling', many: 'Schmetterlinge' },
  { id: 'pilz', many: 'Pilze' },
  { id: 'kueken', many: 'Küken' },
  { id: 'luftballon', many: 'Luftballons' },
  { id: 'auto', many: 'Autos' },
  { id: 'schnecke', many: 'Schnecken' },
]

/* ------------------------------------------------------------------ */
/* Memory-Themen                                                       */
/* ------------------------------------------------------------------ */
export const MEMORY_THEMES = [
  ['katze', 'hund', 'hase', 'baer', 'fuchs', 'loewe', 'affe', 'frosch', 'panda', 'koala', 'tiger', 'maus', 'kuh', 'schwein', 'pferd', 'eule'],
  ['auto', 'bus', 'zug', 'flugzeug', 'rakete', 'boot', 'fahrrad', 'traktor', 'hubschrauber', 'feuerwehr', 'taxi', 'ufo'],
  ['apfel', 'banane', 'erdbeere', 'kirsche', 'traube', 'ananas', 'wassermelone', 'birne', 'zitrone', 'orange', 'kiwi', 'melone'],
  ['fisch', 'wal', 'delfin', 'oktopus', 'krabbe', 'schildkroete', 'hai', 'qualle', 'robbe', 'muschel', 'pinguin', 'ente'],
]

/* ------------------------------------------------------------------ */
/* Schatten — Bilder mit gut unterscheidbarem Umriss                   */
/* ------------------------------------------------------------------ */
export const SHADOW_POOL = [
  'elefant', 'giraffe', 'schnecke', 'schmetterling', 'dino', 'kaktus', 'rakete', 'flugzeug', 'fahrrad', 'gitarre',
  'schluessel', 'banane', 'birne', 'stern', 'mond', 'herz', 'tanne', 'haus', 'hahn', 'kaenguru', 'kamel', 'krokodil',
  'schildkroete', 'krabbe', 'oktopus', 'hase', 'katze', 'hund', 'maus', 'wal', 'pinguin', 'flamingo', 'lama', 'pilz',
  'ananas', 'karotte', 'brezel', 'eis', 'lolli', 'kirsche', 'schere', 'hammer', 'leiter', 'trompete', 'glocke',
  'krone', 'brille', 'schuh', 'hut', 'zelt', 'palme', 'regenschirm', 'anker', 'luftballon', 'kerze', 'tasse',
]

/* ------------------------------------------------------------------ */
/* Labyrinth — wer will wohin?                                         */
/* ------------------------------------------------------------------ */
export const MAZE_PAIRS = [
  { from: 'maus', to: 'kaese', say: 'Hilf der Maus zum Käse!' },
  { from: 'biene', to: 'blume', say: 'Hilf der Biene zur Blume!' },
  { from: 'hund', to: 'knochen', say: 'Hilf dem Hund zum Knochen!' },
  { from: 'hase', to: 'karotte', say: 'Hilf dem Hasen zur Karotte!' },
  { from: 'rakete', to: 'mond', say: 'Flieg mit der Rakete zum Mond!' },
  { from: 'auto', to: 'haus', say: 'Fahr mit dem Auto nach Hause!' },
  { from: 'pinguin', to: 'fisch', say: 'Hilf dem Pinguin zum Fisch!' },
  { from: 'eichhoernchen', to: 'nuss', say: 'Hilf dem Eichhörnchen zur Nuss!' },
  { from: 'raupe', to: 'apfel', say: 'Hilf der Raupe zum Apfel!' },
  { from: 'affe', to: 'banane', say: 'Hilf dem Affen zur Banane!' },
]

/* ------------------------------------------------------------------ */
/* Sticker für das Stickerheft                                         */
/* ------------------------------------------------------------------ */
export const STICKERS = [
  'einhorn', 'drache', 'dino', 'rakete', 'regenbogen', 'schmetterling', 'marienkaefer', 'wal', 'delfin', 'oktopus',
  'pinguin', 'panda', 'koala', 'fuchs', 'igel', 'eichhoernchen', 'eule', 'papagei', 'flamingo', 'pfau', 'loewe',
  'tiger', 'giraffe', 'elefant', 'zebra', 'affe', 'frosch', 'schildkroete', 'kueken', 'hase', 'feuerwehr', 'traktor',
  'ufo', 'hubschrauber', 'zug', 'boot', 'sonnenblume', 'pilz', 'kaktus', 'eis', 'donut', 'muffin', 'erdbeere',
  'wassermelone', 'luftballon', 'geschenk', 'burg', 'krone', 'zauberstab', 'teddy', 'roboter', 'astronaut', 'fee',
  'zauberer', 'geist', 'planet', 'schneemann', 'diamant',
]

/* ------------------------------------------------------------------ */
/* Muster — Bildersätze (je Satz gut unterscheidbare Bilder)           */
/* ------------------------------------------------------------------ */
export const PATTERN_SETS = [
  ['apfel', 'banane', 'traube', 'erdbeere'],
  ['sonne', 'mond', 'stern', 'wolke'],
  ['hund', 'katze', 'maus', 'hase'],
  ['auto', 'bus', 'zug', 'flugzeug'],
  ['herz', 'stern', 'blume', 'kreis'],
  ['ball', 'teddy', 'wuerfel', 'luftballon'],
  ['fisch', 'wal', 'oktopus', 'krabbe'],
  ['eis', 'lolli', 'keks', 'donut'],
  ['frosch', 'ente', 'schnecke', 'marienkaefer'],
  ['tulpe', 'sonnenblume', 'rose', 'kaktus'],
]

/* ================================================================== */
/* Denk- und Logikspiele                                               */
/* ================================================================== */

/* ---------------- Rätsel ---------------- */
// near: Ablenker mit gemeinsamen Merkmalen (für Stufe 3)
export const RIDDLES = [
  { id: 'banane', say: 'Ich bin gelb und krumm. Affen essen mich gern. Was bin ich?', near: ['zitrone', 'mais'] },
  { id: 'hase', say: 'Ich habe lange Ohren und hoppele über die Wiese. Wer bin ich?', near: ['katze', 'hund'] },
  { id: 'sonne', say: 'Ich stehe am Himmel und bin heiß und hell. Was bin ich?', near: ['mond', 'stern'] },
  { id: 'schneeflocke', say: 'Ich bin weiß und kalt und falle im Winter vom Himmel. Was bin ich?', near: ['tropfen', 'schneemann'] },
  { id: 'auto', say: 'Ich habe vier Räder und ein Lenkrad und fahre auf der Straße. Was bin ich?', near: ['fahrrad', 'roller'] },
  { id: 'kuh', say: 'Ich gebe Milch und rufe Muh. Wer bin ich?', near: ['ziege', 'schaf'] },
  { id: 'oktopus', say: 'Ich wohne im Meer und habe acht Arme. Wer bin ich?', near: ['fisch', 'krabbe'] },
  { id: 'karotte', say: 'Ich bin orange und wachse in der Erde. Hasen essen mich gern. Was bin ich?', near: ['orange', 'kartoffel'] },
  { id: 'giraffe', say: 'Ich habe einen sehr langen Hals und braune Flecken. Wer bin ich?', near: ['zebra', 'elefant'] },
  { id: 'schnecke', say: 'Ich trage mein Haus auf dem Rücken und bin ganz langsam. Wer bin ich?', near: ['raupe', 'wurm'] },
  { id: 'uhr', say: 'Ich habe Zeiger und zeige dir, wie spät es ist. Was bin ich?', near: ['telefon', 'radio'] },
  { id: 'eis', say: 'Ich bin kalt und süß und schmelze in der Sonne. Was bin ich?', near: ['schneemann', 'lolli'] },
  { id: 'frosch', say: 'Ich bin grün, springe hoch und rufe Quak. Wer bin ich?', near: ['krokodil', 'raupe'] },
  { id: 'zahnbuerste', say: 'Mit mir putzt du dir morgens und abends die Zähne. Was bin ich?', near: ['seife', 'pinsel'] },
  { id: 'biene', say: 'Ich summe, habe gelbe und schwarze Streifen und mache Honig. Wer bin ich?', near: ['fliege', 'marienkaefer'] },
  { id: 'marienkaefer', say: 'Ich bin rot mit schwarzen Punkten und krabbele über die Blätter. Wer bin ich?', near: ['erdbeere', 'biene'] },
  { id: 'elefant', say: 'Ich bin sehr groß und grau und habe einen langen Rüssel. Wer bin ich?', near: ['nashorn', 'nilpferd'] },
  { id: 'loewe', say: 'Ich habe eine große Mähne und brülle ganz laut. Wer bin ich?', near: ['tiger', 'pferd'] },
  { id: 'regenschirm', say: 'Wenn es regnet, hältst du mich über deinen Kopf. Was bin ich?', near: ['hut', 'wolke'] },
  { id: 'buch', say: 'Ich habe viele Seiten mit Bildern und Geschichten. Was bin ich?', near: ['brief', 'fernseher'] },
  { id: 'rakete', say: 'Ich fliege ganz schnell bis zum Mond. Was bin ich?', near: ['flugzeug', 'hubschrauber'] },
  { id: 'regenbogen', say: 'Ich bin bunt und stehe am Himmel, wenn Sonne und Regen zusammenkommen. Was bin ich?', near: ['sonne', 'wolke'] },
  { id: 'igel', say: 'Ich habe viele Stacheln und rolle mich zu einer Kugel zusammen. Wer bin ich?', near: ['kaktus', 'ball'] },
  { id: 'ei', say: 'Das Huhn legt mich. Ich bin weiß und oval. Was bin ich?', near: ['kueken', 'milch'] },
  { id: 'fisch', say: 'Ich habe Flossen und Schuppen und schwimme im Wasser. Wer bin ich?', near: ['ente', 'frosch'] },
  { id: 'feuerwehr', say: 'Ich bin rot, habe eine lange Leiter und lösche Feuer. Was bin ich?', near: ['polizeiauto', 'krankenwagen'] },
  { id: 'bett', say: 'In mir schläfst du jede Nacht. Was bin ich?', near: ['sofa', 'stuhl'] },
  { id: 'zitrone', say: 'Ich bin gelb und ganz sauer. Was bin ich?', near: ['banane', 'kaese'] },
  { id: 'pinguin', say: 'Ich bin ein Vogel, kann aber nicht fliegen. Ich schwimme im eiskalten Meer. Wer bin ich?', near: ['ente', 'eule'] },
  { id: 'kerze', say: 'Ich habe eine kleine Flamme und werde immer kürzer. Was bin ich?', near: ['feuer', 'gluehbirne'] },
  { id: 'schluessel', say: 'Mit mir kannst du die Tür aufschließen. Was bin ich?', near: ['tuer', 'hammer'] },
  { id: 'mond', say: 'Ich leuchte nachts am Himmel. Manchmal bin ich rund und manchmal krumm. Was bin ich?', near: ['stern', 'sonne'] },
  { id: 'hund', say: 'Ich belle, wedele mit dem Schwanz und hole gern Stöckchen. Wer bin ich?', near: ['katze', 'fuchs'] },
  { id: 'katze', say: 'Ich miaue, schnurre und fange gern Mäuse. Wer bin ich?', near: ['hund', 'tiger'] },
  { id: 'trommel', say: 'Wenn du auf mich schlägst, mache ich bumm, bumm. Was bin ich?', near: ['gitarre', 'glocke'] },
  { id: 'schneemann', say: 'Ich bin aus Schnee gebaut und habe eine Karotte als Nase. Wer bin ich?', near: ['schneeflocke', 'eis'] },
]

/* ---------------- Reihenfolge ---------------- */
// Zeitliche Abläufe: Bilder in der richtigen Reihenfolge (icons = Noto-Emoji)
export const ORDER_SEQUENCES = [
  { icons: ['egg', 'hatching-chick', 'chicken'], say: 'Erst das Ei, dann das Küken und zum Schluss das Huhn.', level: 1 },
  { icons: ['seedling', 'tulip', 'wilted-flower'], say: 'Erst wächst ein kleiner Keim, dann blüht die Blume, und zum Schluss verwelkt sie.', level: 1 },
  { icons: ['cherry-blossom', 'green-apple', 'red-apple'], say: 'Erst kommt die Blüte, dann wächst ein grüner Apfel, und zum Schluss wird er rot.', level: 1 },
  { icons: ['snowflake', 'snowman', 'droplet'], say: 'Erst fällt Schnee, dann bauen wir einen Schneemann, und zum Schluss schmilzt er.', level: 1 },
  { icons: ['cloud', 'cloud-with-rain', 'rainbow'], say: 'Erst kommen Wolken, dann regnet es, und zum Schluss scheint ein Regenbogen.', level: 1 },
  { icons: ['sheaf-of-rice', 'bread', 'sandwich'], say: 'Erst wächst das Korn. Daraus backt man Brot. Und zum Schluss macht man ein belegtes Brot.', level: 2 },
  { icons: ['bricks', 'building-construction', 'house'], say: 'Erst die Steine, dann die Baustelle, und zum Schluss steht das Haus.', level: 2 },
  { icons: ['sunrise', 'sun', 'sunset', 'night-with-stars'], say: 'Morgen, Mittag, Abend und Nacht.', level: 2 },
  { icons: ['baby', 'child', 'person', 'older-person'], say: 'Erst ein Baby, dann ein Kind, dann ein Erwachsener, und zum Schluss ist man alt.', level: 2 },
  { icons: ['nest-with-eggs', 'hatching-chick', 'baby-chick', 'bird'], say: 'Erst die Eier im Nest, dann schlüpft das Küken, es wächst, und zum Schluss fliegt der Vogel.', level: 3 },
  { icons: ['new-moon', 'waxing-crescent-moon', 'first-quarter-moon', 'waxing-gibbous-moon', 'full-moon'], say: 'Der Mond wird jeden Tag ein bisschen größer, bis er ganz rund ist.', level: 3 },
]

// Größenordnung: diese Bilder werden in verschiedenen Größen gezeigt
export const ORDER_SIZE_ITEMS = ['teddy', 'baum', 'haus', 'stern', 'fisch', 'apfel', 'ball', 'blume', 'tanne', 'pilz', 'herz', 'kaktus']

/* ---------------- Wer wohnt wo? ---------------- */
export const HOUSE_ANIMALS = [
  { id: 'hund', der: 'Der Hund' },
  { id: 'katze', der: 'Die Katze' },
  { id: 'hase', der: 'Der Hase' },
  { id: 'maus', der: 'Die Maus' },
]
export const HOUSE_COLORS = [
  { id: 'rot', adj: 'roten', fill: '#ff5a5f', dark: '#d63c42' },
  { id: 'gelb', adj: 'gelben', fill: '#ffc93c', dark: '#e0a400' },
  { id: 'blau', adj: 'blauen', fill: '#3a9bff', dark: '#1f78d1' },
  { id: 'gruen', adj: 'grünen', fill: '#47c46b', dark: '#2a9a4c' },
]

/* ---------------- Waage ---------------- */
export const SCALE_GIFTS = [
  { id: 'rot', name: 'Das rote Geschenk', fill: '#ff5a5f', dark: '#d63c42', ribbon: '#ffe08a' },
  { id: 'blau', name: 'Das blaue Geschenk', fill: '#3a9bff', dark: '#1f78d1', ribbon: '#ffe08a' },
  { id: 'gruen', name: 'Das grüne Geschenk', fill: '#47c46b', dark: '#2a9a4c', ribbon: '#fff3b0' },
  { id: 'gelb', name: 'Das gelbe Geschenk', fill: '#ffc93c', dark: '#e0a400', ribbon: '#ff7aa8' },
]

/* ---------------- Bilder-Sudoku ---------------- */
export const SUDOKU_SETS = [
  ['apfel', 'banane', 'birne', 'traube'],
  ['frosch', 'schwein', 'kueken', 'vogel'],
  ['sonne', 'mond', 'stern', 'wolke'],
  ['auto', 'bus', 'zug', 'flugzeug'],
]
