<script setup lang="ts">
import { contactCard } from '#shared/utils/social'

usePageSeo({
  title: 'Contact',
  description:
    'Contact Awais Jameel about a SaaS project, an integration problem, or a senior engineering role.',
  path: '/contact',
  kind: 'contact',
  card: contactCard()
})
</script>

<template>
  <main id="content">
    <div class="wrap">
      <ContactSection page-title />
    </div>
  </main>
</template>
