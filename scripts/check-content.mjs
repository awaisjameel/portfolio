// Scans published content for unfinished copy and for patterns in .content-guard.local.json,
// a gitignored array of case-insensitive regular expressions: `npm run check:content`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

const RULES = [[/lorem ipsum|TODO|FIXME/i, 'unfinished copy']]

const SCANNED = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  '.env.example',
  'ecosystem.config.cjs',
  'nuxt.config.ts',
  'content',
  'shared',
  'app',
  'server',
  'tests',
  '.output/public'
]
const TEXT_TYPES = new Set([
  '.cjs',
  '.css',
  '.example',
  '.html',
  '.json',
  '.md',
  '.ts',
  '.txt',
  '.vue',
  '.xml'
])

const localFile = join(root, '.content-guard.local.json')
const localRules = existsSync(localFile)
  ? JSON.parse(readFileSync(localFile, 'utf8')).map((pattern) => [
      new RegExp(pattern, 'i'),
      'matches a local rule'
    ])
  : []

function* walk(path) {
  if (!existsSync(path)) return
  if (statSync(path).isFile()) {
    yield path
    return
  }
  for (const entry of readdirSync(path)) yield* walk(join(path, entry))
}

const failures = []
let scanned = 0

for (const target of SCANNED) {
  for (const file of walk(join(root, target))) {
    if (!TEXT_TYPES.has(extname(file))) continue
    scanned += 1
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        for (const [pattern, reason] of [...RULES, ...localRules]) {
          const match = line.match(pattern)
          if (match) {
            failures.push(`${relative(root, file)}:${index + 1} "${match[0]}": ${reason}`)
          }
        }
      })
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  console.error(`\n${failures.length} problem(s) found.`)
  process.exit(1)
}

console.log(`Checked ${scanned} files with ${RULES.length + localRules.length} rules. No problems.`)
