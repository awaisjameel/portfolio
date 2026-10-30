// Renders every site icon from public/favicon.svg: `npm run icons`.
// Run it after changing the favicon. The images are committed, because the production server
// has no browser to build them with.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runChrome } from './chrome.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(root, 'public')
const favicon = readFileSync(join(publicDir, 'favicon.svg'), 'utf8')

// iOS and Android cut their own corners, so these fill the square and keep the mark in the
// middle 80 percent, which is the safe zone for a maskable icon.
const fullBleed = favicon
  .replace(' rx="6"', '')
  .replace(
    /(<path.*)(<\/svg>)/,
    '<g transform="translate(16 16) scale(.72) translate(-16 -16)">$1</g>$2'
  )

const pngs = [
  { file: 'icon-192.png', size: 192, svg: favicon },
  { file: 'icon-512.png', size: 512, svg: favicon },
  { file: 'icon-maskable-512.png', size: 512, svg: fullBleed },
  { file: 'apple-touch-icon.png', size: 180, svg: fullBleed }
]
const icoSizes = [16, 32, 48]

const work = mkdtempSync(join(tmpdir(), 'portfolio-icons-'))

function render(svg: string, size: number, output: string) {
  const page = join(work, 'icon.html')
  writeFileSync(
    page,
    `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`
  )
  runChrome([
    `--window-size=${size},${size}`,
    '--default-background-color=00000000',
    `--screenshot=${output}`,
    pathToFileURL(page).href
  ])
}

/** An ICO file is a small directory of sizes followed by the PNG data for each one. */
function toIco(images: { size: number; data: Buffer }[]) {
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16
    header.writeUInt8(size, entry)
    header.writeUInt8(size, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(data.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map(({ data }) => data)])
}

try {
  for (const { file, size, svg } of pngs) {
    render(svg, size, join(publicDir, file))
    console.log(`Wrote public/${file}`)
  }
  const images = icoSizes.map((size) => {
    const output = join(work, `${size}.png`)
    render(favicon, size, output)
    return { size, data: readFileSync(output) }
  })
  writeFileSync(join(publicDir, 'favicon.ico'), toIco(images))
  console.log('Wrote public/favicon.ico')
} finally {
  rmSync(work, { recursive: true, force: true })
}
