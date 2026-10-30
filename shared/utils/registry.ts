export interface RegistryCounts {
  fetchedAt: string
  packagist: Record<string, number>
  npm: Record<string, number>
}

export interface ActivityCalendar {
  fetchedAt: string
  total: number
  from: string
  to: string
  /** One digit per day, oldest first, 0 to 4. The first day is a Sunday. */
  levels: string
}

const MAX_NPM_RANGE_DAYS = 540
const DAY_MS = 86_400_000

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/**
 * npm caps one range query at 18 months and silently clamps longer ones, which would drop older
 * downloads from a lifetime total. These consecutive ranges cover the whole period.
 */
export function npmRanges(start: string, end: string): string[] {
  const ranges: string[] = []
  const last = new Date(`${end}T00:00:00Z`).getTime()
  let cursor = new Date(`${start}T00:00:00Z`).getTime()
  while (cursor <= last) {
    const stop = Math.min(cursor + (MAX_NPM_RANGE_DAYS - 1) * DAY_MS, last)
    ranges.push(`${isoDay(new Date(cursor))}:${isoDay(new Date(stop))}`)
    cursor = stop + DAY_MS
  }
  return ranges
}

/** "4,466" becomes "4,400+", matching how approved totals are worded. */
export function roundedDownLabel(count: number): string {
  if (count < 100) return String(count)
  return `${(Math.floor(count / 100) * 100).toLocaleString('en-US')}+`
}

export function sumCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((total, count) => total + count, 0)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

const CONTRIBUTION_LEVELS: Record<string, string> = {
  NONE: '0',
  FIRST_QUARTILE: '1',
  SECOND_QUARTILE: '2',
  THIRD_QUARTILE: '3',
  FOURTH_QUARTILE: '4'
}

export const CONTRIBUTIONS_QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionLevel } }
      }
    }
  }
}`

interface ContributionResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number
          weeks: { contributionDays: { date: string; contributionLevel: string }[] }[]
        }
      }
    }
  }
}

export function toActivityCalendar(
  response: ContributionResponse,
  fetchedAt: string
): ActivityCalendar | null {
  const calendar = response.data?.user?.contributionsCollection?.contributionCalendar
  const days = calendar?.weeks.flatMap((week) => week.contributionDays) ?? []
  if (!calendar || days.length === 0) return null
  return {
    fetchedAt,
    total: calendar.totalContributions,
    from: days[0]!.date,
    to: days.at(-1)!.date,
    levels: days.map((day) => CONTRIBUTION_LEVELS[day.contributionLevel] ?? '0').join('')
  }
}
