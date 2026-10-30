<script setup lang="ts">
const LOOP_SECONDS = 13.5
const REST_SECONDS = 10
const START_SECONDS = 6.2
const NODE_HEIGHT = 34

type NodeKey = 'q' | 'g' | 'a' | 'b' | 'c' | 'r'
type NodeState = '' | 'on' | 'wait' | 'fail'

const LABELS: Record<NodeKey, string> = {
  q: 'quote',
  g: 'gateway',
  a: 'carrier a',
  b: 'carrier b',
  c: 'carrier c',
  r: 'results'
}

const SEGMENTS = [
  { path: 'qg', from: 0.3, to: 1.4 },
  { path: 'ga', from: 1.5, to: 2.7 },
  { path: 'gb', from: 1.5, to: 2.7 },
  { path: 'gc', from: 1.5, to: 2.7 },
  { path: 'cr', from: 3.5, to: 4.6 },
  { path: 'ar', from: 4.5, to: 5.6 },
  { path: 'gb', from: 6, to: 7.1 },
  { path: 'br', from: 8, to: 9.1 }
]

const EVENTS: { t: number; node?: NodeKey; state?: NodeState; count?: number; log?: string }[] = [
  { t: 0.3, node: 'q', state: 'on', log: 'POST /quotes: request accepted' },
  { t: 1.4, node: 'g', state: 'on', log: 'gateway: fan out to 3 carriers' },
  { t: 1.4, node: 'q', state: '' },
  { t: 2.7, node: 'a', state: 'wait' },
  { t: 2.7, node: 'b', state: 'wait' },
  { t: 2.7, node: 'c', state: 'wait' },
  { t: 3.4, node: 'c', state: 'on', log: 'carrier c: quote returned' },
  { t: 4.4, node: 'a', state: 'on', log: 'carrier a: quote returned' },
  { t: 4.6, node: 'r', state: 'on', count: 1, log: 'results: 1 of 3 on screen' },
  { t: 5.4, node: 'b', state: 'fail', log: 'carrier b: timed out, retry 1 of 3' },
  { t: 5.6, count: 2, log: 'results: 2 of 3 on screen' },
  { t: 7.1, node: 'b', state: 'wait' },
  { t: 7.9, node: 'b', state: 'on', log: 'carrier b: quote returned on retry' },
  { t: 9.1, count: 3, log: 'results: 3 of 3 ranked' }
]

function snapshotAt(seconds: number) {
  const states: Record<NodeKey, NodeState> = { q: '', g: '', a: '', b: '', c: '', r: '' }
  const lines: string[] = []
  let count = 0
  let index = 0
  for (const event of EVENTS) {
    if (event.t > seconds) break
    index += 1
    if (event.node) states[event.node] = event.state ?? ''
    if (event.count) count = event.count
    if (event.log) lines.push(event.log)
  }
  return { index, states, count, lines: lines.slice(-4) }
}

const canvas = useTemplateRef<HTMLElement>('canvas')
const packets = useTemplateRef<SVGCircleElement[]>('packets')
const paths: Record<string, SVGPathElement> = {}

// The server renders the finished flow, so the diagram reads correctly before any script runs.
const width = ref(760)
const view = shallowRef(snapshotAt(REST_SECONDS))
const playing = ref(false)

const layout = computed(() => {
  const narrow = width.value < 520
  const nodeWidth = narrow ? Math.min(66, (width.value - 54) / 4) : 104
  const height = narrow ? 172 : 204
  const columns = [0, 1, 2, 3].map((step) => ((width.value - nodeWidth) * step) / 3)
  const rows = [0, (height - NODE_HEIGHT) / 2, height - NODE_HEIGHT]
  const [c0 = 0, c1 = 0, c2 = 0, c3 = 0] = columns
  const [r0 = 0, r1 = 0, r2 = 0] = rows
  const places: Record<NodeKey, [number, number]> = {
    q: [c0, r1],
    g: [c1, r1],
    a: [c2, r0],
    b: [c2, r1],
    c: [c2, r2],
    r: [c3, r1]
  }
  const middle = r1 + NODE_HEIGHT / 2
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const bend = (x1 + x2) / 2
    return `M${x1} ${y1} C${bend} ${y1} ${bend} ${y2} ${x2} ${y2}`
  }
  const edges: Record<string, string> = { qg: curve(c0 + nodeWidth, middle, c1, middle) }
  for (const [key, row] of [
    ['a', r0],
    ['b', r1],
    ['c', r2]
  ] as const) {
    const y = row + NODE_HEIGHT / 2
    edges[`g${key}`] = curve(c1 + nodeWidth, middle, c2, y)
    edges[`${key}r`] = curve(c2 + nodeWidth, y, c3, middle)
  }
  return { narrow, nodeWidth, height, places, edges }
})

const nodes = computed(() =>
  (Object.keys(LABELS) as NodeKey[]).map((key) => {
    const [x, y] = layout.value.places[key]
    const { states, count } = view.value
    let label = LABELS[key]
    if (key === 'b' && states.b === 'fail') label = 'timed out'
    if (key === 'r' && count) label = layout.value.narrow ? `${count} of 3` : `results ${count}/3`
    return { key, x, y, label, state: states[key] }
  })
)

const setPath = (name: string) => (element: unknown) => {
  if (element) paths[name] = element as SVGPathElement
}

let clock = REST_SECONDS
let startedAt: number | null = null
let frame: number | null = null
let onScreen = true

function drawPackets(seconds: number) {
  SEGMENTS.forEach((segment, i) => {
    const packet = packets.value?.[i]
    const path = paths[segment.path]
    if (!packet || !path) return
    if (seconds < segment.from || seconds >= segment.to) {
      packet.setAttribute('visibility', 'hidden')
      return
    }
    const progress = (seconds - segment.from) / (segment.to - segment.from)
    const eased = progress * progress * (3 - 2 * progress)
    const point = path.getPointAtLength(path.getTotalLength() * eased)
    packet.setAttribute('cx', String(point.x))
    packet.setAttribute('cy', String(point.y))
    packet.setAttribute('visibility', 'visible')
  })
}

function draw(seconds: number) {
  const next = snapshotAt(seconds)
  if (next.index !== view.value.index) view.value = next
  drawPackets(seconds)
}

function tick(now: number) {
  frame = null
  if (!playing.value || !onScreen || document.hidden) {
    startedAt = null
    return
  }
  startedAt ??= now - clock * 1000
  clock = ((now - startedAt) / 1000) % LOOP_SECONDS
  draw(clock)
  frame = requestAnimationFrame(tick)
}

function run() {
  if (frame === null && playing.value) frame = requestAnimationFrame(tick)
}

function togglePlaying() {
  playing.value = !playing.value
  startedAt = null
  run()
}

function measure() {
  const element = canvas.value
  if (!element) return
  const inner = element.clientWidth - 28
  if (inner > 0) width.value = inner
}

let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined

onMounted(() => {
  measure()
  resizeObserver = new ResizeObserver(() => {
    measure()
    nextTick(() => drawPackets(clock))
  })
  intersectionObserver = new IntersectionObserver(([entry]) => {
    onScreen = Boolean(entry?.isIntersecting)
    run()
  })
  if (canvas.value) {
    resizeObserver.observe(canvas.value)
    intersectionObserver.observe(canvas.value)
  }
  document.addEventListener('visibilitychange', run)

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  clock = START_SECONDS
  playing.value = true
  run()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', run)
  if (frame !== null) cancelAnimationFrame(frame)
})
</script>

<template>
  <figure class="flow-frame">
    <figcaption class="flow-head mono">
      <span>quote-flow</span>
      <button type="button" @click="togglePlaying">{{ playing ? 'Pause' : 'Play' }}</button>
    </figcaption>
    <div
      ref="canvas"
      class="flow-canvas"
      role="img"
      aria-label="Animated diagram. A quote request reaches a gateway, which calls three carriers at once. Two respond. One times out and is retried. All three results then reach the screen, ranked."
    >
      <svg :viewBox="`0 0 ${width} ${layout.height}`" aria-hidden="true">
        <path
          v-for="(d, name) in layout.edges"
          :key="name"
          :ref="setPath(String(name))"
          class="edge"
          :d="d"
        />
        <g v-for="node in nodes" :key="node.key">
          <rect
            class="node"
            :class="node.state"
            :x="node.x"
            :y="node.y"
            :width="layout.nodeWidth"
            :height="NODE_HEIGHT"
            rx="4"
          />
          <text
            class="node-t"
            :class="{ small: layout.narrow }"
            :x="node.x + layout.nodeWidth / 2"
            :y="node.y + NODE_HEIGHT / 2"
          >
            {{ node.label }}
          </text>
        </g>
        <circle
          v-for="(segment, i) in SEGMENTS"
          :key="i"
          ref="packets"
          class="packet"
          r="3.5"
          visibility="hidden"
        />
      </svg>
    </div>
    <div class="flow-log mono" aria-hidden="true">
      <div v-for="line in view.lines" :key="line">{{ line }}</div>
    </div>
  </figure>
</template>
