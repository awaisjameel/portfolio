<script setup lang="ts">
import { NODE_HEIGHT, flowAt, flowLayout, type FlowSpec } from '#shared/utils/flow'

const {
  spec,
  repeat = true,
  from
} = defineProps<{
  spec: FlowSpec
  /** Without this, the diagram plays once and emits `finished`. */
  repeat?: boolean
  /** Overrides the moment the animation starts from. */
  from?: number
}>()

const emit = defineEmits<{ finished: [] }>()

const canvas = useTemplateRef<HTMLElement>('canvas')
const packets = useTemplateRef<SVGCircleElement[]>('packets')
const paths: Record<string, SVGPathElement> = {}

// The server renders the finished flow, so the diagram reads correctly before any script runs.
const width = ref(760)
const view = shallowRef(flowAt(spec, spec.rest))
const playing = ref(false)

const layout = computed(() => flowLayout(spec, width.value))

const nodes = computed(() =>
  spec.nodes.map(({ key }) => {
    const place = layout.value.places[key] ?? { x: 0, y: 0 }
    const node = view.value.nodes[key]
    return {
      key,
      ...place,
      state: node?.state ?? '',
      label: layout.value.narrow ? node?.short : node?.label
    }
  })
)

const setPath = (name: string) => (element: unknown) => {
  if (element) paths[name] = element as SVGPathElement
}

let clock = spec.rest
let startedAt: number | null = null
let frame: number | null = null
let onScreen = true

function drawPackets(seconds: number) {
  spec.segments.forEach((segment, i) => {
    const packet = packets.value?.[i]
    const path = paths[segment.edge]
    if (!packet || !path) return
    if (seconds < segment.from || seconds >= segment.to) {
      packet.setAttribute('visibility', 'hidden')
      return
    }
    const progress = (seconds - segment.from) / (segment.to - segment.from)
    const eased = progress * progress * (3 - 2 * progress)
    const point = path.getPointAtLength(path.getTotalLength() * (segment.back ? 1 - eased : eased))
    packet.setAttribute('cx', String(point.x))
    packet.setAttribute('cy', String(point.y))
    packet.setAttribute('visibility', 'visible')
  })
}

function draw(seconds: number) {
  const next = flowAt(spec, seconds)
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
  const elapsed = (now - startedAt) / 1000
  if (!repeat && elapsed >= spec.loop) {
    emit('finished')
    return
  }
  clock = elapsed % spec.loop
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
  clock = from ?? spec.start
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
      <span>{{ spec.name }}</span>
      <button type="button" @click="togglePlaying">{{ playing ? 'Pause' : 'Play' }}</button>
    </figcaption>
    <div ref="canvas" class="flow-canvas" role="img" :aria-label="spec.description">
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
            :class="{ small: layout.narrow, tiny: layout.nodeWidth < 48 }"
            :x="node.x + layout.nodeWidth / 2"
            :y="node.y + NODE_HEIGHT / 2"
          >
            {{ node.label }}
          </text>
        </g>
        <circle
          v-for="(segment, i) in spec.segments"
          :key="i"
          ref="packets"
          class="packet"
          r="3.5"
          visibility="hidden"
        />
      </svg>
    </div>
    <div class="flow-log mono" aria-hidden="true">
      <div v-for="(line, i) in view.lines" :key="i">{{ line }}</div>
    </div>
  </figure>
</template>
