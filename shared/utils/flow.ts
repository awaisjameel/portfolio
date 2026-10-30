export type FlowState = '' | 'on' | 'wait' | 'fail'

export interface FlowNode {
  key: string
  label: string
  /** Replaces `label` on narrow screens. */
  short?: string
  column: number
  row: 0 | 1 | 2
}

export interface FlowEvent {
  t: number
  node?: string
  state?: FlowState
  label?: string
  short?: string
  log?: string
}

export interface FlowSegment {
  edge: string
  from: number
  to: number
  /** Travels from the edge's end back to its start. */
  back?: boolean
}

export interface FlowSpec {
  name: string
  description: string
  /** Seconds before the animation repeats. */
  loop: number
  /** The moment shown before scripts run, and to visitors who prefer reduced motion. */
  rest: number
  /** The moment the animation starts from. */
  start: number
  nodes: FlowNode[]
  edges: [from: string, to: string][]
  segments: FlowSegment[]
  /** In time order. */
  events: FlowEvent[]
}

export interface FlowNodeView {
  state: FlowState
  label: string
  short: string
}

export interface FlowSnapshot {
  index: number
  nodes: Record<string, FlowNodeView>
  lines: string[]
}

export const NODE_HEIGHT = 34

const WIDE_COLUMN = 130
const WIDE_GAP = 36
const NARROW_GAP = 12

export const edgeKey = (from: string, to: string) => `${from}-${to}`

const defaultView = (node: FlowNode): FlowNodeView => ({
  state: '',
  label: node.label,
  short: node.short ?? node.label
})

/** A state change clears a custom label, so a node returns to its own name unless it sets another. */
export function flowAt(spec: FlowSpec, seconds: number): FlowSnapshot {
  const nodes = Object.fromEntries(spec.nodes.map((node) => [node.key, defaultView(node)]))
  const lines: string[] = []
  let index = 0

  for (const event of spec.events) {
    if (event.t > seconds) break
    index += 1
    if (event.log) lines.push(event.log)
    const definition = spec.nodes.find((node) => node.key === event.node)
    if (!definition) continue
    const view = event.state === undefined ? nodes[definition.key] : defaultView(definition)
    if (!view) continue
    if (event.state !== undefined) view.state = event.state
    if (event.label) {
      view.label = event.label
      view.short = event.short ?? event.label
    }
    nodes[definition.key] = view
  }

  return { index, nodes, lines: lines.slice(-4) }
}

export function flowLayout(spec: FlowSpec, width: number) {
  const columns = Math.max(...spec.nodes.map((node) => node.column)) + 1
  const narrow = width < WIDE_COLUMN * columns
  const nodeWidth = narrow
    ? Math.min(66, (width - NARROW_GAP * (columns - 1)) / columns)
    : Math.min(104, (width - WIDE_GAP * (columns - 1)) / columns)
  const height = narrow ? 172 : 204

  const places = Object.fromEntries(
    spec.nodes.map((node) => [
      node.key,
      {
        x: ((width - nodeWidth) * node.column) / (columns - 1),
        y: ((height - NODE_HEIGHT) * node.row) / 2
      }
    ])
  )

  const edges = Object.fromEntries(
    spec.edges.map(([from, to]) => {
      const start = places[from] ?? { x: 0, y: 0 }
      const end = places[to] ?? { x: 0, y: 0 }
      const x1 = start.x + nodeWidth
      const y1 = start.y + NODE_HEIGHT / 2
      const y2 = end.y + NODE_HEIGHT / 2
      const bend = (x1 + end.x) / 2
      return [edgeKey(from, to), `M${x1} ${y1} C${bend} ${y1} ${bend} ${y2} ${end.x} ${y2}`]
    })
  )

  return { narrow, nodeWidth, height, places, edges }
}
