<script setup lang="ts">
import { site } from '#shared/data/site'

const { public: config } = useRuntimeConfig()

useHead({
  meta: config.indexable ? [] : [{ name: 'robots', content: 'noindex, nofollow' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: site.name,
        url: config.siteUrl,
        jobTitle: 'Senior Full-Stack Engineer and Software Architect',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Lahore',
          addressCountry: 'PK'
        },
        knowsAbout: [
          'Laravel',
          'Vue.js',
          'Nuxt',
          'TypeScript',
          'SaaS architecture',
          'Insurance software',
          'API integration',
          'Open-source software'
        ],
        sameAs: site.links.map((link) => link.href)
      })
    }
  ]
})
</script>

<template>
  <a class="skip" href="#content">Skip to content</a>
  <SiteHeader />
  <NuxtPage />
  <SiteFooter />
  <CommandPalette />
</template>
