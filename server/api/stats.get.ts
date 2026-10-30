import { defineCachedEventHandler } from 'nitropack/runtime'
import { allProjects } from '#shared/data/open-source'
import registrySnapshot from '#shared/data/registry-snapshot.json'
import { npmRanges, type RegistryCounts } from '#shared/utils/registry'

const TIMEOUT_MS = 8000
const NPM_FIRST_DAY = '2024-01-01'

const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

async function packagistTotal(name: string): Promise<number> {
  const stats = await $fetch<{ downloads: { total: number } }>(
    `https://packagist.org/packages/${name}/stats.json`,
    { timeout: TIMEOUT_MS }
  )
  return stats.downloads.total
}

async function npmTotal(name: string): Promise<number> {
  const counts = await Promise.all(
    npmRanges(NPM_FIRST_DAY, yesterday()).map((range) =>
      $fetch<{ downloads: number }>(`https://api.npmjs.org/downloads/point/${range}/${name}`, {
        timeout: TIMEOUT_MS
      })
    )
  )
  return counts.reduce((total, { downloads }) => total + downloads, 0)
}

/** Registry counts, refreshed daily. A failed lookup keeps that package's snapshot value. */
export default defineCachedEventHandler(
  async (): Promise<RegistryCounts> => {
    const snapshot = registrySnapshot as RegistryCounts
    const result: RegistryCounts = {
      fetchedAt: new Date().toISOString(),
      packagist: { ...snapshot.packagist },
      npm: { ...snapshot.npm }
    }
    let failures = 0

    await Promise.all(
      allProjects.map(async ({ registry }) => {
        if (!registry) return
        try {
          result[registry.source][registry.name] =
            registry.source === 'npm'
              ? await npmTotal(registry.name)
              : await packagistTotal(registry.name)
        } catch {
          failures += 1
        }
      })
    )

    // The date on the page has to stay true, so partial data keeps the snapshot's date.
    if (failures > 0) result.fetchedAt = snapshot.fetchedAt
    return result
  },
  { name: 'registry-stats', maxAge: 60 * 60 * 24, swr: true }
)
