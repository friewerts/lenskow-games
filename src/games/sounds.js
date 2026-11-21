/**
 * Erste Laute – Anlaute heraushören.
 * "Was fängt an wie Maus?" – das Kind wählt das Bild mit dem gleichen Anfangslaut.
 */
import './quiz.css'
import { h, pick, makePicker } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { SOUND_LETTERS_EASY, SOUND_LETTERS_ALL } from '../data/content.js'
import { T, soundsQuestion, wordSay } from '../data/texts.js'
import { runPictureQuiz } from './common.js'
import { wordsByLetter, makeSoundsRound } from './logic.js'

export default function sounds(ctx) {
  const byLetter = wordsByLetter()
  const pool = (ctx.level === 1 ? SOUND_LETTERS_EASY : SOUND_LETTERS_ALL).filter((l) => byLetter[l]?.length >= 2)
  const nextLetter = makePicker(pool)
  const used = new Set()

  const letterBadge = (letter) => h('span', { class: 'letter-badge' }, letter, h('small', {}, letter.toLowerCase()))

  runPictureQuiz(ctx, {
    cls: 'quiz-sounds',
    intro: T.soundsHowTo,
    makeRound: () => {
      const r = makeSoundsRound(ctx.level, byLetter, nextLetter(), used)
      used.add(r.target)
      used.add(r.correct)
      return r
    },
    renderTarget: (r) => [wordImg(r.target, { cls: 'quiz-target-img' }), letterBadge(r.letter)],
    question: (r) => soundsQuestion(r.target),
    rightLines: (r) => [wordSay(r.target), wordSay(r.correct), T.soundsSame],
    wrongLines: (r, id) => [wordSay(id), pick(T.tryAgain)],
    onRight: (r, btn) => btn.append(letterBadge(r.letter)),
  })
}
