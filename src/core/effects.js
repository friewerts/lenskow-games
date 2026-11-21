/** Visuelle Belohnungen: Sternchen-Funkeln und Konfetti. */
import { h } from './dom.js'

const COLORS = ['#FF5D8F', '#FFB627', '#3CCB7F', '#2EC4F1', '#8B6CF6', '#FF8A3D']

/** Kleine Sterne, die aus einem Element heraus springen. */
export function burst(el, { count = 10, spread = 90, colors = COLORS } = {}) {
  if (!el?.isConnected) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const rect = el.getBoundingClientRect()
  const layer = h('div', { class: 'fx-layer' })
  document.body.append(layer)
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const dist = spread * (0.6 + Math.random() * 0.6)
    const size = 10 + Math.random() * 12
    const star = h('div', {
      class: 'fx-star',
      style: {
        left: `${cx}px`,
        top: `${cy}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: colors[i % colors.length],
      },
    })
    star.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    star.style.setProperty('--dy', `${Math.sin(angle) * dist}px`)
    star.style.setProperty('--rot', `${Math.random() * 360}deg`)
    layer.append(star)
  }
  setTimeout(() => layer.remove(), 900)
}

/** Konfetti-Regen über den ganzen Bildschirm (Canvas). */
export function confetti({ duration = 2600, amount = 140 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const canvas = h('canvas', { class: 'fx-confetti' })
  document.body.append(canvas)
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)

  const pieces = Array.from({ length: amount }, (_, i) => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.3,
    y: H * 0.35 + (Math.random() - 0.5) * 60,
    vx: (Math.random() - 0.5) * 16,
    vy: -6 - Math.random() * 12,
    size: 7 + Math.random() * 9,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    color: COLORS[i % COLORS.length],
    shape: i % 3,
  }))

  let raf = 0
  const start = performance.now()
  const frame = (now) => {
    const t = now - start
    ctx.clearRect(0, 0, W, H)
    for (const p of pieces) {
      p.vy += 0.32
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - duration + 600) / 600)
      ctx.fillStyle = p.color
      if (p.shape === 0) ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      else if (p.shape === 1) {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(0, -p.size / 2)
        ctx.lineTo(p.size / 2, p.size / 2)
        ctx.lineTo(-p.size / 2, p.size / 2)
        ctx.fill()
      }
      ctx.restore()
    }
    if (t < duration) raf = requestAnimationFrame(frame)
    else canvas.remove()
  }
  raf = requestAnimationFrame(frame)
  return () => {
    cancelAnimationFrame(raf)
    canvas.remove()
  }
}
