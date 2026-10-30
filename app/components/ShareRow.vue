<script setup lang="ts">
import { shareTargets, type ShareTarget } from '#shared/utils/social'

const props = defineProps<{ title: string; path: string }>()

const { siteUrl } = useRuntimeConfig().public
const url = `${siteUrl}${props.path}`
const targets = shareTargets({ title: props.title, url })

const status = ref('')

async function copy(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text)
    status.value = done
  } catch {
    status.value = `Couldn't copy automatically. The link is ${url}`
  }
}

async function share(event: MouseEvent, target: ShareTarget) {
  track(`share-${target.id}`)
  if (!target.copy) return
  // Browsers only let a focused page copy, and opening the tab first would take the focus.
  event.preventDefault()
  await copy(
    target.copy,
    `Copied the title and link. Paste them into your post on ${target.label}.`
  )
  window.open(target.href, '_blank', 'noopener,noreferrer')
}

function copyLink() {
  track('share-copy-link')
  void copy(url, 'Link copied.')
}
</script>

<template>
  <div class="study-block">
    <SectionLabel>share</SectionLabel>
    <ul class="share-links mono">
      <li v-for="target in targets" :key="target.id">
        <a
          :href="target.href"
          target="_blank"
          rel="noopener noreferrer"
          @click="share($event, target)"
        >
          {{ target.label }}
        </a>
      </li>
      <li><button type="button" @click="copyLink">copy link</button></li>
    </ul>
    <p class="note share-status" role="status">{{ status }}</p>
  </div>
</template>
