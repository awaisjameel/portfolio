// Updates the snapshots the site ships with: `npm run stats:refresh`.
// Uses GITHUB_TOKEN when set, otherwise the signed-in GitHub CLI, for the contribution calendar.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { CONTRIBUTIONS_QUERY, npmRanges, toActivityCalendar } from '../shared/utils/registry.ts'

const dataDir = new URL('../shared/data/', import.meta.url)
const projects = readFileSync(new URL('open-source.ts', dataDir), 'utf8')
const fetchedAt = new Date().toISOString()
const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return (await response.json()) as T
}

const packagistNames = [...projects.matchAll(/packagist\('([^']+)'\)/g)].map(
  (match) => `awaisjameel/${match[1]}`
)
const npmNames = [...projects.matchAll(/source: 'npm', name: '([^']+)'/g)].map((match) => match[1]!)

const packagist: Record<string, number> = {}
for (const name of packagistNames) {
  const stats = await json<{ downloads: { total: number } }>(
    `https://packagist.org/packages/${name}/stats.json`
  )
  packagist[name] = stats.downloads.total
}

const npm: Record<string, number> = {}
for (const name of npmNames) {
  let total = 0
  for (const range of npmRanges('2024-01-01', yesterday)) {
    const { downloads } = await json<{ downloads: number }>(
      `https://api.npmjs.org/downloads/point/${range}/${name}`
    )
    total += downloads
  }
  npm[name] = total
}

writeFileSync(
  new URL('registry-snapshot.json', dataDir),
  `${JSON.stringify({ fetchedAt, packagist, npm }, null, 2)}\n`
)

const token =
  process.env.GITHUB_TOKEN || execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim()
const response = await json<Parameters<typeof toActivityCalendar>[0]>(
  'https://api.github.com/graphql',
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'awaisjameel' },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: 'awaisjameel' } })
  }
)
const calendar = toActivityCalendar(response, fetchedAt)
if (!calendar) throw new Error('GitHub returned no contribution calendar')
writeFileSync(new URL('activity-snapshot.json', dataDir), `${JSON.stringify(calendar, null, 2)}\n`)

console.log(`Refreshed ${packagistNames.length + npmNames.length} packages and the calendar.`)
