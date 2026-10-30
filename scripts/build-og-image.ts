// Renders a share image for every page to public/og/: `npm run og:image`.
// Run it after changing a page's title, numbers, or description. The images are committed,
// because the production server has no browser to build them with.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadContent } from '../modules/content/load.ts'
import { site } from '../shared/data/site.ts'
import { sumCounts } from '../shared/utils/registry.ts'
import { shareCards, type ShareCard } from '../shared/utils/social.ts'
import { runChrome } from './chrome.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = join(root, 'public/og')
const manifest = join(root, 'scripts/og-cards.json')

// Above this length the title needs the smaller size to stay within the card.
const LONG_TITLE = 34

const FONTS = [
  [
    'Instrument Sans',
    '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal'
  ],
  ['JetBrains Mono', '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal']
] as const

const dataUrl = (type: string, file: string) =>
  `data:${type};base64,${readFileSync(file).toString('base64')}`

const fontFaces = FONTS.map(([family, file]) => {
  const src = dataUrl('font/woff2', join(root, 'node_modules', `${file}.woff2`))
  return `@font-face { font-family: '${family}'; font-weight: 100 900; src: url(${src}); }`
}).join('\n')

const portrait = dataUrl('image/webp', join(root, 'public', site.photo))
const template = readFileSync(join(root, 'scripts/og-image.html'), 'utf8')

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function cardHtml(card: ShareCard): string {
  const stats = card.stats
    .map(
      (stat) =>
        `<div><p class="value">${escape(stat.value)}</p><p class="label">${escape(stat.label)}</p></div>`
    )
    .join('')
  return `<main>
    <div class="top">
      <div class="head">
        <p class="path"><span>~/</span>${escape(card.path)}</p>
        <h1${card.title.length > LONG_TITLE ? ' class="long"' : ''}>${escape(card.title)}</h1>
        <p class="context">${escape(card.context)}</p>
      </div>
      ${card.portrait ? `<img class="portrait" src="${portrait}" alt="" />` : ''}
    </div>
    ${stats ? `<div class="stats">${stats}</div>` : ''}
    <footer>
      <span>${escape(site.name)} · afoxtech.com</span>
      ${card.date ? `<span>${escape(card.date)}</span>` : ''}
    </footer>
  </main>`
}

const content = loadContent(resolve(root, 'content'))
const registry = JSON.parse(readFileSync(join(root, 'shared/data/registry-snapshot.json'), 'utf8'))
const cards = shareCards({
  caseStudies: content.caseStudies,
  articles: content.articles,
  totals: { packagist: sumCounts(registry.packagist), npm: sumCounts(registry.npm) }
})

rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })

const pages = mkdtempSync(join(tmpdir(), 'portfolio-og-'))
try {
  for (const card of cards) {
    const page = join(pages, `${card.key}.html`)
    const html = template.replace('/* fonts */', () => fontFaces)
    writeFileSync(
      page,
      html.replace('<!-- card -->', () => cardHtml(card))
    )
    runChrome([
      '--window-size=1200,630',
      '--virtual-time-budget=3000',
      `--screenshot=${join(output, `${card.key}.png`)}`,
      pathToFileURL(page).href
    ])
    console.log(`Wrote public/og/${card.key}.png`)
  }
} finally {
  rmSync(pages, { recursive: true, force: true })
}

writeFileSync(manifest, `${JSON.stringify(cards, null, 2)}\n`)
