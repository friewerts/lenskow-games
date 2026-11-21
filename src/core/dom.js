/** Kleine DOM- und Zufalls-Helfer. */

/**
 * Element erzeugen: h('div', { class: 'x', onclick: fn, style: {...} }, ...kinder)
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue
    if (key === 'class') el.className = value
    else if (key === 'style' && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, v)
        else el.style[prop] = v
      }
    }
    else if (key === 'dataset') Object.assign(el.dataset, value)
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value)
    else if (key === 'html') el.innerHTML = value
    else if (value === true) el.setAttribute(key, '')
    else el.setAttribute(key, value)
  }
  append(el, children)
  return el
}

function append(el, children) {
  for (const child of children) {
    if (child == null || child === false) continue
    if (Array.isArray(child)) append(el, child)
    else el.append(child instanceof Node ? child : document.createTextNode(String(child)))
  }
}

/** SVG-Element erzeugen. */
export function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue
    if (key === 'class') el.setAttribute('class', value)
    else el.setAttribute(key, value)
  }
  for (const child of children.flat()) if (child) el.append(child)
  return el
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** n zufällige, verschiedene Elemente. */
export function pickN(list, n) {
  return shuffle(list).slice(0, n)
}

/** Zufällige Auswahl, die die letzten Ergebnisse möglichst vermeidet. */
export function makePicker(list, memory = Math.min(list.length - 1, Math.ceil(list.length / 2))) {
  const recent = []
  return () => {
    const candidates = list.filter((item) => !recent.includes(item))
    const choice = pick(candidates.length ? candidates : list)
    recent.push(choice)
    if (recent.length > memory) recent.shift()
    return choice
  }
}

/** Animation per CSS-Klasse neu starten. */
export function flash(el, cls, duration = 600) {
  if (!el) return
  el.classList.remove(cls)
  void el.offsetWidth
  el.classList.add(cls)
  setTimeout(() => el.classList.remove(cls), duration)
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
