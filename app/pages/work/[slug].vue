<script setup lang="ts">
import { caseStudies } from '#content/body'

const route = useRoute()
const index = caseStudies.findIndex((candidate) => candidate.slug === route.params.slug)
const study = caseStudies[index]

if (!study) {
  throw createError({ statusCode: 404, statusMessage: 'Case study not found', fatal: true })
}

usePageSeo({
  title: `${study.title} case study`,
  description: study.description,
  path: `/work/${study.slug}`,
  type: 'article'
})

const next = caseStudies[(index + 1) % caseStudies.length]
</script>

<template>
  <main v-if="study" id="content">
    <div class="wrap">
      <div class="study-head">
        <p class="crumb mono"><NuxtLink to="/#work">~/work</NuxtLink> / {{ study.slug }}</p>
        <h1>{{ study.title }}</h1>
        <p class="lede">{{ study.lede }}</p>
        <dl class="meta">
          <div>
            <dt class="mono">role</dt>
            <dd>{{ study.role }}</dd>
          </div>
          <div v-for="detail in study.details" :key="detail.label">
            <dt class="mono">{{ detail.label }}</dt>
            <dd>{{ detail.value }}</dd>
          </div>
        </dl>
        <p v-if="study.link">
          <a class="more" :href="study.link.href">{{ study.link.label }}</a>
        </p>
      </div>

      <figure v-if="study.image" class="study-image">
        <img
          :src="study.image.src"
          :alt="study.image.alt"
          :width="study.image.width"
          :height="study.image.height"
          loading="lazy"
        />
      </figure>

      <div class="prose study-prose">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="study.body[0]"></div>
        <div v-if="study.diagram" class="study-diagram">
          <QuoteStages v-if="study.diagram === 'quote-stages'" />
          <SpeedBars v-if="study.diagram === 'quote-speed'" />
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="study.body[1]"></div>
      </div>

      <div class="study-block study-results">
        <SectionLabel>results</SectionLabel>
        <ProofStrip :items="study.stats" />
        <p class="note">{{ study.statsNote }}</p>
      </div>

      <div class="study-block next">
        <NuxtLink class="btn primary" to="/#contact">Discuss a project or role</NuxtLink>
        <NuxtLink v-if="next" class="more" :to="`/work/${next.slug}`">
          Next: {{ next.title }}
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
