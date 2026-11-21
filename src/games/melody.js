/**
 * Melodie – Hörgedächtnis.
 * Vier singende Tiere spielen eine Tonfolge vor, das Kind spielt sie nach.
 */
import './melody.css'
import { h, randInt, flash } from '../core/dom.js'
import { wordImg } from '../core/img.js'
import { T } from '../data/texts.js'

const ROUNDS = 5
const LENGTHS = { 1: [2, 2, 3, 3, 4], 2: [3, 3, 4, 4, 5], 3: [4, 4, 5, 5, 6] }
const PADS = [
  { id: 'frosch', note: 0, color: 'green' },
  { id: 'schwein', note: 2, color: 'pink' },
  { id: 'kueken', note: 3, color: 'yellow' },
  { id: 'vogel', note: 5, color: 'blue' },
]

function makeSequence(length, noRepeat) {
  const seq = []
  while (seq.length < length) {
    const n = randInt(0, PADS.length - 1)
    if (noRepeat && n === seq[seq.length - 1]) continue
    seq.push(n)
  }
  return seq
}

export default function melody(ctx) {
  const { stage, level } = ctx
  let round = 0
  let mistakes = 0
  let listening = true
  let seq = []
  let pos = 0

  const pads = PADS.map((pad, i) => {
    const el = h('button', { class: `pad pad-${pad.color}`, style: { animationDelay: `${i * 80}ms` }, 'aria-label': `Ton ${i + 1}` }, wordImg(pad.id))
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      press(i)
    })
    return el
  })
  const board = h('div', { class: 'pads listening' }, ...pads)
  stage.append(h('div', { class: 'melody' }, board))
  ctx.preload([T.melodyListen, T.melodyYourTurn, T.melodyAgain])

  function light(i, ms = 420) {
    pads[i].classList.add('lit')
    ctx.sfx.note(PADS[i].note, 0.7)
    ctx.timeout(() => pads[i].classList.remove('lit'), ms)
  }

  async function playSequence() {
    listening = true
    board.classList.add('listening')
    await ctx.say(T.melodyListen)
    await ctx.wait(250)
    for (const i of seq) {
      light(i, 450)
      await ctx.wait(650)
    }
    board.classList.remove('listening')
    listening = false
    pos = 0
    ctx.say(T.melodyYourTurn)
  }

  async function press(i) {
    if (listening) return
    light(i, 260)
    if (i === seq[pos]) {
      pos++
      if (pos === seq.length) {
        listening = true
        board.classList.add('listening')
        await ctx.wait(450)
        ctx.sfx.correct()
        ctx.burst(board, { count: 12, spread: 140 })
        pads.forEach((p, k) => ctx.timeout(() => flash(p, 'bounce', 500), k * 90))
        await ctx.praise()
        round++
        ctx.setProgress(round, ROUNDS)
        if (round >= ROUNDS) {
          await ctx.wait(300)
          ctx.finish({ mistakes, rounds: ROUNDS })
          return
        }
        await ctx.wait(500)
        startRound()
      }
    } else {
      listening = true
      mistakes++
      ctx.stopVoice()
      await ctx.wait(250)
      ctx.sfx.wrong()
      flash(board, 'shake', 450)
      await ctx.say(T.melodyAgain)
      await ctx.wait(200)
      await playSequence()
    }
  }

  function startRound() {
    ctx.setProgress(round, ROUNDS)
    seq = makeSequence(LENGTHS[level][round], level === 1)
    playSequence()
  }

  ctx.setHelp(() => {
    if (!listening) playSequence()
  })
  ctx.setProgress(0, ROUNDS)
  ctx.timeout(startRound, 300)
}
