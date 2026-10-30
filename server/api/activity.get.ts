import { defineCachedEventHandler } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { site } from '#shared/data/site'
import activitySnapshot from '#shared/data/activity-snapshot.json'
import {
  CONTRIBUTIONS_QUERY,
  toActivityCalendar,
  type ActivityCalendar
} from '#shared/utils/registry'

/** The contribution calendar, refreshed daily. Without a token it stays on the build snapshot. */
export default defineCachedEventHandler(
  async (event): Promise<ActivityCalendar> => {
    const snapshot = activitySnapshot as ActivityCalendar
    const token = useRuntimeConfig(event).githubToken
    if (!token) return snapshot

    try {
      const response = await $fetch<Parameters<typeof toActivityCalendar>[0]>(
        'https://api.github.com/graphql',
        {
          method: 'POST',
          timeout: 8000,
          headers: { Authorization: `Bearer ${token}`, 'User-Agent': site.handle },
          body: { query: CONTRIBUTIONS_QUERY, variables: { login: site.handle } }
        }
      )
      return toActivityCalendar(response, new Date().toISOString()) ?? snapshot
    } catch {
      return snapshot
    }
  },
  { name: 'github-activity', maxAge: 60 * 60 * 24, swr: true }
)
