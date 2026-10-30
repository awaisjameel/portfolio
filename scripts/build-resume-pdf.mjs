// Prints the built /resume page to public/awais-jameel-resume.pdf: `npm run resume:pdf`.
// Run `npm run build` first, then build again so the new PDF ships with the site.
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { runChrome } from './chrome.mjs'

const PORT = 3179
const output = fileURLToPath(new URL('../public/awais-jameel-resume.pdf', import.meta.url))
const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, NITRO_PORT: String(PORT), NITRO_HOST: '127.0.0.1', PORT: String(PORT) },
  stdio: 'ignore'
})

try {
  const deadline = Date.now() + 15_000
  for (;;) {
    const ready = await fetch(`http://127.0.0.1:${PORT}/api/ping`).catch(() => null)
    if (ready?.ok) break
    if (Date.now() > deadline) throw new Error('The built server did not start.')
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  runChrome([
    '--no-pdf-header-footer',
    '--virtual-time-budget=3000',
    `--print-to-pdf=${output}`,
    `http://127.0.0.1:${PORT}/resume`
  ])
  console.log(`Wrote ${output}`)
} finally {
  server.kill()
}
