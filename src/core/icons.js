/** Eigene, kräftige Symbole für die Bedienung (SVG, Farbe = currentColor). */
const wrap = (body, vb = '0 0 48 48') =>
  `<svg viewBox="${vb}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`

export const ICON = {
  home: wrap('<path d="M7 23 24 8l17 15"/><path d="M12 20v19h9V29h6v10h9V20" fill="currentColor" fill-opacity=".18"/>'),
  back: wrap('<path d="M29 10 15 24l14 14"/>'),
  check: wrap('<path d="M10 25l9 9 19-20" stroke-width="6"/>'),
  close: wrap('<path d="M13 13l22 22M35 13 13 35" stroke-width="5.5"/>'),
  replay: wrap('<path d="M38 24a14 14 0 1 1-4.1-9.9"/><path d="M36 7v9h-9" />'),
  speaker: wrap('<path d="M8 19h8l10-8v26l-10-8H8z" fill="currentColor" fill-opacity=".2"/><path d="M33 17a10 10 0 0 1 0 14M37 12a17 17 0 0 1 0 24"/>'),
  book: wrap('<path d="M24 13c-5-4-11-4-16-3v27c5-1 11-1 16 3 5-4 11-4 16-3V10c-5-1-11-1-16 3z" fill="currentColor" fill-opacity=".18"/><path d="M24 13v27"/>'),
  gear: wrap('<circle cx="24" cy="24" r="6"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/>'),
  trash: wrap('<path d="M9 13h30M19 13V8h10v5M13 13l2 27h18l2-27"/><path d="M21 20v13M27 20v13"/>'),
  eraser: wrap('<path d="M27 10 39 22 22 39H13l-5-5z" fill="currentColor" fill-opacity=".18"/><path d="M18 19l12 12M22 39h18"/>'),
  brush: wrap('<path d="M38 8 22 26"/><path d="M20 27c-5 0-8 4-8 8 0 3-2 4-4 5 6 2 16 1 17-8 0-3-2-5-5-5z" fill="currentColor" fill-opacity=".25"/>'),
  stamp: wrap('<path d="M18 20c-2-3-2-6 0-8 3-4 9-4 12 0 2 2 2 5 0 8l-2 5h-8z" fill="currentColor" fill-opacity=".2"/><path d="M10 27h28v7H10zM12 40h24"/>'),
  play: wrap('<path d="M16 10v28l22-14z" fill="currentColor" stroke-width="4"/>'),
  plus: wrap('<path d="M24 11v26M11 24h26" stroke-width="5.5"/>'),
  minus: wrap('<path d="M11 24h26" stroke-width="5.5"/>'),
  expand: wrap('<path d="M9 18V9h9M39 18V9h-9M9 30v9h9M39 30v9h-9"/>'),
  star: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4.5l5.9 12 13.1 1.9-9.5 9.3 2.3 13.1L24 34.6l-11.8 6.2 2.3-13.1-9.5-9.3 13.1-1.9z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  lock: wrap('<rect x="11" y="21" width="26" height="19" rx="4" fill="currentColor" fill-opacity=".18"/><path d="M17 21v-6a7 7 0 0 1 14 0v6"/>'),
  save: wrap('<path d="M24 8v20M15 20l9 9 9-9"/><path d="M9 34v6h30v-6"/>'),
}
