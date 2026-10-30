<script setup lang="ts">
import { articles } from '#content/meta'
import { isWritingEnabled } from '#shared/utils/writing'

const paletteOpen = usePalette()
const { toggleTheme } = useTheme()
const showWriting = isWritingEnabled(articles.length)

const paletteKeys = ref('Ctrl K')
onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.platform)) paletteKeys.value = '⌘ K'
})
</script>

<template>
  <header class="site-header">
    <div class="wrap bar">
      <NuxtLink class="mark" to="/"><span>~/</span>awaisjameel</NuxtLink>
      <nav class="nav" aria-label="Main">
        <NuxtLink to="/#work">Work</NuxtLink>
        <NuxtLink to="/open-source">Open source</NuxtLink>
        <NuxtLink v-if="showWriting" to="/writing">Writing</NuxtLink>
        <NuxtLink to="/#about">About</NuxtLink>
        <NuxtLink to="/#contact">Contact</NuxtLink>
      </nav>
      <div class="bar-actions">
        <NuxtLink class="ctl" to="/resume">Résumé</NuxtLink>
        <button
          class="ctl"
          type="button"
          aria-label="Open command palette"
          @click="paletteOpen = true"
        >
          <span class="wide-only">{{ paletteKeys }}</span>
          <span class="narrow-only">Menu</span>
        </button>
        <button class="ctl" type="button" aria-label="Switch theme" @click="toggleTheme">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 1.5v11a5.5 5.5 0 0 1 0-11Z" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
