// Renders the social preview image to public/og.png: `npm run og:image`.
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runChrome } from './chrome.mjs'

const template = fileURLToPath(new URL('og-image.html', import.meta.url))
const output = fileURLToPath(new URL('../public/og.png', import.meta.url))

runChrome(['--window-size=1200,630', `--screenshot=${output}`, pathToFileURL(template).href])
console.log(`Wrote ${output}`)
