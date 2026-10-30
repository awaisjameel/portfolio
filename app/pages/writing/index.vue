<script setup lang="ts">
import { articles } from '#content/meta'
import { formatDate } from '#shared/utils/registry'
import { isWritingEnabled } from '#shared/utils/writing'

if (!isWritingEnabled(articles.length)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

usePageSeo({
  title: 'Writing',
  description: 'Engineering articles by Awais Jameel on SaaS, integrations, and reliable delivery.',
  path: '/writing'
})
</script>

<template>
  <main id="content">
    <div class="wrap">
      <div class="study-head">
        <p class="crumb mono"><NuxtLink to="/">~</NuxtLink> / writing</p>
        <h1>Writing</h1>
      </div>
      <ul class="article-list page-end">
        <li v-for="article in articles" :key="article.slug">
          <span class="mono muted">{{ formatDate(article.date) }}</span>
          <h2>
            <NuxtLink :to="`/writing/${article.slug}`">{{ article.title }}</NuxtLink>
          </h2>
          <p class="muted">{{ article.description }}</p>
        </li>
      </ul>
    </div>
  </main>
</template>
