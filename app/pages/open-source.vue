<script setup lang="ts">
import { openSourceGroups, techFilters, type Tech } from '#shared/data/open-source'
import { formatDate, roundedDownLabel } from '#shared/utils/registry'

usePageSeo({
  title: 'Open-source maintainer: Laravel and Node packages',
  description:
    'Open-source Laravel, PHP, and Node packages maintained by Awais Jameel, with live install counts, plus starters, tools, and the Lumen desktop app.',
  path: '/open-source'
})

const { registry, activity, countLabel, totals } = useLiveStats()

const filter = ref<Tech | null>(null)

const groups = computed(() =>
  openSourceGroups
    .map((group) => ({
      ...group,
      projects: group.projects.filter(
        (project) => !filter.value || project.tech.includes(filter.value)
      )
    }))
    .filter((group) => group.projects.length > 0)
)
</script>

<template>
  <main id="content">
    <div class="wrap">
      <div class="study-head">
        <p class="crumb mono"><NuxtLink to="/">~</NuxtLink> / open-source</p>
        <h1>Open source</h1>
        <p class="lede">
          Smaller, reusable versions of the problems I solve in production: provider abstractions,
          secure webhooks, typed data, and deployment constraints.
        </p>
        <p class="muted">
          6 Laravel and PHP packages with {{ roundedDownLabel(totals.packagist) }} installs, and 2
          npm packages with {{ roundedDownLabel(totals.npm) }} downloads. Counts as of
          {{ formatDate(registry.fetchedAt) }}.
        </p>
        <div class="filters" role="group" aria-label="Filter by technology">
          <button class="ctl" type="button" :aria-pressed="filter === null" @click="filter = null">
            All
          </button>
          <button
            v-for="tech in techFilters"
            :key="tech"
            class="ctl"
            type="button"
            :aria-pressed="filter === tech"
            @click="filter = tech"
          >
            {{ tech }}
          </button>
        </div>
      </div>

      <div v-for="group in groups" :key="group.title" class="os-group">
        <h2>{{ group.title }}</h2>
        <ul class="pkgs">
          <li v-for="project in group.projects" :key="project.name">
            <a :href="project.href">{{ project.name }}</a>
            <p>{{ project.description }}</p>
            <span class="n mono">{{ countLabel(project) || project.note }}</span>
          </li>
        </ul>
      </div>

      <ContributionGraph class="page-end" :calendar="activity" />
    </div>
  </main>
</template>
