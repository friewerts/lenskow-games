/**
 * Reime – auf Wortendungen hören.
 * "Was reimt sich auf Maus?" – das Kind wählt das passende Reimwort.
 */
import './quiz.css'
import { h, pick, makePicker } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { ICON } from '../core/icons.js'
import { RHYME_GROUPS } from '../data/content.js'
import { T, rhymeQuestion, wordSay } from '../data/texts.js'
import { runPictureQuiz } from './common.js'
import { makeRhymeRound } from './logic.js'

export default function rhymes(ctx) {
  const nextGroup = makePicker(RHYME_GROUPS)

  runPictureQuiz(ctx, {
    cls: 'quiz-rhymes',
    intro: T.rhymesHowTo,
    makeRound: () => makeRhymeRound(ctx.level, nextGroup()),
    renderTarget: (r) => [wordImg(r.target, { cls: 'quiz-target-img' }), h('span', { class: 'target-speaker', html: ICON.speaker })],
    question: (r) => rhymeQuestion(r.target),
    rightLines: (r) => [wordSay(r.target), wordSay(r.correct), T.rhymesYes],
    wrongLines: (r, id) => [wordSay(r.target), wordSay(id), T.rhymesNo, pick(T.tryAgain)],
  })
}
