<script setup lang="ts">
import { articles } from '#content/body'
import { formatDate } from '#shared/utils/registry'
import { isWritingEnabled } from '#shared/utils/writing'

const route = useRoute()
const article = articles.find((candidate) => candidate.slug === route.params.slug)

if (!article || !isWritingEnabled(articles.length)) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

usePageSeo({
  title: article.title,
  description: article.description,
  path: `/writing/${article.slug}`,
  type: 'article'
})
</script>

<template>
  <main v-if="article" id="content">
    <div class="wrap">
      <div class="study-head">
        <p class="crumb mono"><NuxtLink to="/writing">~/writing</NuxtLink> / {{ article.slug }}</p>
        <h1>{{ article.title }}</h1>
        <p class="mono muted">{{ formatDate(article.date) }}</p>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="prose page-end" v-html="article.body"></div>
    </div>
  </main>
</template>
