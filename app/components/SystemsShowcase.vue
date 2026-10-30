<script setup lang="ts">
import { flowTabs, flows, type FlowName } from '#shared/data/flows'

const active = ref<FlowName>('quote-lifecycle')
const tabs = useTemplateRef<HTMLButtonElement[]>('tabs')

// Choosing a tab or reaching the tabs by keyboard ends the cycle, so nothing moves under a reader.
const pinned = ref(false)
// The first illustration opens mid-story. Every later one plays from its beginning.
const opened = ref(false)

function show(flow: FlowName) {
  pinned.value = true
  if (flow === active.value) return
  opened.value = true
  active.value = flow
}

function advance() {
  const current = flowTabs.findIndex((tab) => tab.flow === active.value)
  const tab = flowTabs[(current + 1) % flowTabs.length]
  if (!tab) return
  opened.value = true
  active.value = tab.flow
}

function move(event: KeyboardEvent) {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  const current = flowTabs.findIndex((tab) => tab.flow === active.value)
  const next = (current + step + flowTabs.length) % flowTabs.length
  const tab = flowTabs[next]
  if (!tab) return
  show(tab.flow)
  tabs.value?.[next]?.focus()
}
</script>

<template>
  <div class="showcase">
    <div
      class="flow-tabs mono"
      role="tablist"
      aria-label="System layers"
      @keydown="move"
      @focusin="pinned = true"
    >
      <button
        v-for="tab in flowTabs"
        :id="`tab-${tab.flow}`"
        ref="tabs"
        :key="tab.flow"
        type="button"
        role="tab"
        :aria-selected="active === tab.flow"
        :aria-controls="`panel-${tab.flow}`"
        :tabindex="active === tab.flow ? 0 : -1"
        @click="show(tab.flow)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div :id="`panel-${active}`" role="tabpanel" :aria-labelledby="`tab-${active}`">
      <FlowDiagram
        :key="active"
        :spec="flows[active]"
        :repeat="pinned"
        :from="opened ? 0 : undefined"
        @finished="advance"
      />
    </div>
  </div>
</template>
