<script setup lang="ts">
import { resume } from '#content/body'
import { site } from '#shared/data/site'

usePageSeo({
  title: 'Résumé',
  description:
    'Résumé of Awais Jameel: senior full-stack engineer, software architect, and open-source maintainer building production software since 2016.',
  path: '/resume'
})

const print = () => window.print()
</script>

<template>
  <main id="content">
    <div class="wrap resume-page">
      <div class="resume-actions">
        <a class="btn primary" :href="site.resumePdf" download @click="track('resume-download')">
          Download PDF
        </a>
        <button class="btn" type="button" @click="print">Print</button>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <article class="resume" v-html="resume"></article>
    </div>
  </main>
</template>
