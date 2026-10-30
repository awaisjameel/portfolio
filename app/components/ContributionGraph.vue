<script setup lang="ts">
import { formatDate, type ActivityCalendar } from '#shared/utils/registry'

const props = defineProps<{ calendar: ActivityCalendar }>()

const scroller = useTemplateRef<HTMLElement>('scroller')
const days = computed(() => props.calendar.levels.split(''))
const total = computed(() => props.calendar.total.toLocaleString('en-US'))

// Narrow screens scroll this graph sideways, so start at the most recent weeks.
onMounted(() => {
  if (scroller.value) scroller.value.scrollLeft = scroller.value.scrollWidth
})
</script>

<template>
  <div class="cal-block">
    <div ref="scroller" class="cal-scroll">
      <div
        class="cal"
        role="img"
        :aria-label="`GitHub contribution calendar with ${total} contributions in the last twelve months.`"
      >
        <i v-for="(level, day) in days" :key="day" :data-l="level"></i>
      </div>
    </div>
    <p class="note">
      {{ total }} contributions on my main GitHub account, {{ formatDate(calendar.from) }} to
      {{ formatDate(calendar.to) }}. Most of my professional work is proprietary and lives in
      company organizations, so this shows only part of it.
    </p>
  </div>
</template>
