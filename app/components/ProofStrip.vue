<script setup lang="ts">
defineProps<{
  items: { value: string; label: string }[]
  lead?: boolean
}>()
</script>

<template>
  <ul class="proof" :class="{ lead }">
    <li v-for="item in items" :key="item.label">
      <b>{{ item.value }}</b>
      <span>{{ item.label }}</span>
    </li>
  </ul>
</template>
