import { computed } from 'vue'
import activitySnapshot from '#shared/data/activity-snapshot.json'
import registrySnapshot from '#shared/data/registry-snapshot.json'
import type { OpenSourceProject } from '#shared/data/open-source'
import { sumCounts, type ActivityCalendar, type RegistryCounts } from '#shared/utils/registry'

/**
 * Prerendered pages show the snapshots shipped with the build. Once mounted, they switch to the
 * server's daily-refreshed figures. If that request fails, the snapshot and its date stay.
 */
export function useLiveStats() {
  const registry = useState<RegistryCounts>('registry', () => registrySnapshot as RegistryCounts)
  const activity = useState<ActivityCalendar>(
    'activity',
    () => activitySnapshot as ActivityCalendar
  )

  onMounted(async () => {
    const [counts, calendar] = await Promise.allSettled([
      $fetch<RegistryCounts>('/api/stats'),
      $fetch<ActivityCalendar>('/api/activity')
    ])
    if (counts.status === 'fulfilled') registry.value = counts.value
    if (calendar.status === 'fulfilled') activity.value = calendar.value
  })

  const countFor = (project: OpenSourceProject) => {
    if (!project.registry) return 0
    return registry.value[project.registry.source][project.registry.name] ?? 0
  }

  const countLabel = (project: OpenSourceProject) => {
    const count = countFor(project)
    if (count === 0) return ''
    const unit = project.registry?.source === 'npm' ? 'downloads' : 'installs'
    return `${count.toLocaleString('en-US')} ${unit}`
  }

  const totals = computed(() => ({
    packagist: sumCounts(registry.value.packagist),
    npm: sumCounts(registry.value.npm)
  }))

  return { registry, activity, countFor, countLabel, totals }
}
