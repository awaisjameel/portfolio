import { describe, expect, it } from 'vitest'
import {
  formatDate,
  npmRanges,
  roundedDownLabel,
  sumCounts,
  toActivityCalendar
} from '../shared/utils/registry'

describe('npmRanges', () => {
  it('covers the whole period without gaps or overlaps', () => {
    const ranges = npmRanges('2024-01-01', '2026-10-29')
    expect(ranges.length).toBeGreaterThan(1)
    expect(ranges[0]?.startsWith('2024-01-01:')).toBe(true)
    expect(ranges.at(-1)?.endsWith(':2026-10-29')).toBe(true)

    for (let i = 1; i < ranges.length; i += 1) {
      const previousEnd = new Date(`${ranges[i - 1]!.split(':')[1]}T00:00:00Z`).getTime()
      const start = new Date(`${ranges[i]!.split(':')[0]}T00:00:00Z`).getTime()
      expect(start - previousEnd).toBe(86_400_000)
    }
  })

  it('keeps every range within the 18-month limit', () => {
    for (const range of npmRanges('2024-01-01', '2026-10-29')) {
      const [from, to] = range.split(':').map((day) => new Date(`${day}T00:00:00Z`).getTime())
      expect((to! - from!) / 86_400_000).toBeLessThan(540)
    }
  })

  it('returns one range for a short period', () => {
    expect(npmRanges('2026-10-01', '2026-10-02')).toEqual(['2026-10-01:2026-10-02'])
  })
})

describe('labels', () => {
  it('rounds totals down so a claim is never overstated', () => {
    expect(roundedDownLabel(4833)).toBe('4,800+')
    expect(roundedDownLabel(4800)).toBe('4,800+')
    expect(roundedDownLabel(76)).toBe('76')
  })

  it('sums package counts', () => {
    expect(sumCounts({ a: 2, b: 3 })).toBe(5)
  })

  it('formats dates in UTC', () => {
    expect(formatDate('2026-10-21T23:30:00.000Z')).toBe('21 Oct 2026')
  })
})

describe('toActivityCalendar', () => {
  const response = {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 3,
            weeks: [
              {
                contributionDays: [
                  { date: '2026-10-25', contributionLevel: 'NONE' },
                  { date: '2026-10-26', contributionLevel: 'FOURTH_QUARTILE' }
                ]
              }
            ]
          }
        }
      }
    }
  }

  it('flattens days into one digit each', () => {
    expect(toActivityCalendar(response, 'now')).toEqual({
      fetchedAt: 'now',
      total: 3,
      from: '2026-10-25',
      to: '2026-10-26',
      levels: '04'
    })
  })

  it('returns null for an error response', () => {
    expect(toActivityCalendar({}, 'now')).toBeNull()
  })
})
