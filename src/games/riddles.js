/**
 * Rätsel – zuhören und kombinieren.
 * Die Eule liest ein Rätsel vor ("Ich bin gelb und krumm …"), das Kind wählt das passende Bild.
 * Auf Stufe 3 ähneln sich die Antwortbilder (z. B. alle gelb) – nur alle Hinweise zusammen passen.
 */
import './quiz.css'
import { h, pick, makePicker } from '../core/dom.js'
import { emoji } from '../core/img.js'
import { ICON } from '../core/icons.js'
import { RIDDLES } from '../data/content.js'
import { T, wordSay } from '../data/texts.js'
import { runPictureQuiz } from './common.js'
import { makeRiddleRound } from './logic.js'

export default function riddles(ctx) {
  const nextRiddle = makePicker(RIDDLES)

  runPictureQuiz(ctx, {
    cls: 'quiz-riddles',
    intro: T.riddlesHowTo,
    makeRound: () => makeRiddleRound(ctx.level, nextRiddle()),
    renderTarget: () => [emoji('red-question-mark', { cls: 'quiz-target-img riddle-mark' }), h('span', { class: 'target-speaker', html: ICON.speaker })],
    question: (r) => r.say,
    rightLines: (r) => [wordSay(r.correct)],
    wrongLines: (r, id) => [wordSay(id), pick(T.tryAgain)],
  })
}
