<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const missing = computed(() => props.error.statusCode === 404)

useHead({
  title: missing.value ? 'Page not found' : 'Something went wrong',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<template>
  <SiteHeader />
  <main id="content" class="wrap not-found">
    <p class="mono muted">{{ error.statusCode }}</p>
    <h1>{{ missing ? "This page doesn't exist." : 'Something went wrong.' }}</h1>
    <button class="btn primary" type="button" @click="clearError({ redirect: '/' })">
      Back to the home page
    </button>
  </main>
  <SiteFooter />
  <CommandPalette />
</template>
