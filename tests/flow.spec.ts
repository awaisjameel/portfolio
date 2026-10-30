import { describe, expect, it } from 'vitest'
import { flowTabs, flows } from '../shared/data/flows'
import { edgeKey, flowAt, flowLayout, type FlowSpec } from '../shared/utils/flow'

const specs: FlowSpec[] = Object.values(flows)

describe.each(specs.map((spec) => [spec.name, spec] as const))('%s', (_name, spec) => {
  const keys = spec.nodes.map((node) => node.key)
  const edges = spec.edges.map(([from, to]) => edgeKey(from, to))

  it('connects only nodes it defines', () => {
    expect(new Set(keys).size).toBe(keys.length)
    expect(spec.edges.flat().filter((key) => !keys.includes(key))).toEqual([])
    expect(
      spec.events.flatMap((event) => event.node ?? []).filter((key) => !keys.includes(key))
    ).toEqual([])
  })

  it('moves packets along edges it draws, within the loop', () => {
    for (const segment of spec.segments) {
      expect(edges).toContain(segment.edge)
      expect(segment.from).toBeLessThan(segment.to)
      expect(segment.to).toBeLessThanOrEqual(spec.loop)
    }
  })

  it('keeps log lines short enough for a small phone', () => {
    const long = spec.events.flatMap((event) =>
      event.log && event.log.length > 34 ? event.log : []
    )
    expect(long).toEqual([])
  })

  it('rests with no packet in flight', () => {
    const inFlight = spec.segments.filter(({ from, to }) => from <= spec.rest && spec.rest < to)
    expect(inFlight).toEqual([])
  })

  it('keeps events in time order, within the loop', () => {
    const times = spec.events.map((event) => event.t)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(times.at(-1)).toBeLessThanOrEqual(spec.rest)
    expect(spec.rest).toBeLessThan(spec.loop)
  })

  it('shows a finished log at rest, with unique lines', () => {
    const { lines } = flowAt(spec, spec.rest)
    expect(lines).toHaveLength(4)
    expect(new Set(lines).size).toBe(4)
  })

  it('fits every width, from a phone to the widest column', () => {
    for (const width of [262, 302, 520, 680, 760, 880]) {
      const { narrow, nodeWidth, places } = flowLayout(spec, width)
      const columns = Math.max(...spec.nodes.map((node) => node.column)) + 1
      const gap = columns > 1 ? (width - nodeWidth * columns) / (columns - 1) : 0
      expect(gap).toBeGreaterThanOrEqual(8)
      expect(Math.max(...Object.values(places).map((place) => place.x)) + nodeWidth).toBeCloseTo(
        width
      )
      // Monospace characters at the small and normal sizes are about 6 and 6.6 pixels wide.
      const charWidth = narrow ? 6 : 6.6
      for (const node of spec.nodes) {
        const texts = [
          narrow ? (node.short ?? node.label) : node.label,
          ...spec.events
            .filter((event) => event.node === node.key)
            .flatMap((event) => (narrow ? (event.short ?? event.label ?? []) : (event.label ?? [])))
        ]
        for (const text of texts) {
          expect(text.length * charWidth, `${text} at ${width}`).toBeLessThanOrEqual(nodeWidth)
        }
      }
    }
  })
})

describe('flowAt', () => {
  const spec: FlowSpec = {
    name: 'test',
    description: '',
    loop: 10,
    rest: 5,
    start: 0,
    nodes: [{ key: 'a', label: 'alpha', short: 'a', column: 0, row: 1 }],
    edges: [],
    segments: [],
    events: [
      { t: 1, node: 'a', state: 'fail', label: 'timed out', log: 'first' },
      { t: 2, node: 'a', label: 'still out' },
      { t: 3, node: 'a', state: 'on', log: 'second' }
    ]
  }

  it('starts from each node`s own name', () => {
    expect(flowAt(spec, 0).nodes.a).toEqual({ state: '', label: 'alpha', short: 'a' })
  })

  it('keeps state when an event only changes the label', () => {
    expect(flowAt(spec, 2).nodes.a).toMatchObject({ state: 'fail', label: 'still out' })
  })

  it('clears a custom label when the state changes', () => {
    expect(flowAt(spec, 3).nodes.a).toMatchObject({ state: 'on', label: 'alpha' })
  })
})

describe('home page tabs', () => {
  it('run from infrastructure up to the product', () => {
    expect(flowTabs.map((tab) => tab.label)).toEqual(['infrastructure', 'platform', 'product'])
  })
})
