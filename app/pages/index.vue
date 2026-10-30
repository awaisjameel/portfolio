<script setup lang="ts">
import { caseStudies } from '#content/meta'
import { allProjects, highlightNames } from '#shared/data/open-source'
import { capabilities, experience, proof, site, waysToWork } from '#shared/data/site'
import { formatDate, roundedDownLabel } from '#shared/utils/registry'

usePageSeo({
  title: 'Senior Full-Stack Engineer and Software Architect',
  description: site.description,
  path: '/'
})

const { registry, activity, countFor, countLabel, totals } = useLiveStats()

const largeStudies = caseStudies.filter((study) => study.size === 'large')
const compactStudies = caseStudies.filter((study) => study.size === 'compact')

const highlights = computed(() =>
  allProjects
    .filter((project) => highlightNames.includes(project.name))
    .sort((a, b) => countFor(b) - countFor(a))
)
</script>

<template>
  <main id="content">
    <div class="wrap">
      <div class="hero">
        <p class="status mono"><i aria-hidden="true"></i>{{ site.status }}</p>
        <h1>I build reliable SaaS products and solve complex integration problems.</h1>
        <div class="intro">
          <p>
            I'm Awais Jameel, a senior full-stack engineer and software architect building
            production software since 2016, including software for the U.S. insurance industry since
            late 2019.
          </p>
          <p class="mono">{{ site.title }}</p>
        </div>
        <div class="actions">
          <NuxtLink class="btn primary" to="/#contact">Discuss a project or role</NuxtLink>
          <NuxtLink class="btn" to="/#work">Explore selected work</NuxtLink>
        </div>
        <SystemsShowcase />
        <p class="note">
          How <NuxtLink to="/work/one-pro-suite">One Pro Suite</NuxtLink> works, simplified for a
          public page. The carriers and events are not real data.
        </p>
      </div>

      <section aria-labelledby="proof-heading">
        <SectionLabel id="proof-heading">proof</SectionLabel>
        <ProofStrip :items="proof" lead />
        <p class="note">
          Scale and performance figures come from my production work on proprietary platforms.
        </p>
      </section>

      <section id="work" aria-labelledby="work-heading">
        <SectionLabel id="work-heading">selected-work</SectionLabel>
        <div class="work-list">
          <article v-for="study in largeStudies" :key="study.slug" class="case large">
            <div class="case-top">
              <h3>
                <NuxtLink :to="`/work/${study.slug}`">{{ study.title }}</NuxtLink>
              </h3>
              <span class="mono muted">{{ study.role }}</span>
            </div>
            <p>{{ study.summary }}</p>
            <ScaleTally v-if="study.visual === 'tally'" />
            <SpeedBars v-if="study.visual === 'speed'" />
            <p class="facts mono">
              <span v-for="fact in study.facts" :key="fact.label">
                <b v-if="fact.value">{{ fact.value }}</b> {{ fact.label }}
              </span>
            </p>
            <NuxtLink class="more" :to="`/work/${study.slug}`">Read case study</NuxtLink>
          </article>

          <div class="compact">
            <article v-for="study in compactStudies" :key="study.slug" class="case">
              <h3>
                <NuxtLink :to="`/work/${study.slug}`">{{ study.title }}</NuxtLink>
              </h3>
              <p>{{ study.summary }}</p>
              <NuxtLink class="more" :to="`/work/${study.slug}`">Read case study</NuxtLink>
            </article>
          </div>
        </div>
      </section>

      <section id="open-source" aria-labelledby="open-source-heading">
        <SectionLabel id="open-source-heading">open-source</SectionLabel>
        <p class="os-summary">
          6 Laravel and PHP packages with {{ roundedDownLabel(totals.packagist) }} installs, and 2
          npm packages with {{ roundedDownLabel(totals.npm) }} downloads.
        </p>
        <ul class="pkgs">
          <li v-for="project in highlights" :key="project.name">
            <a :href="project.href">{{ project.name }}</a>
            <p>{{ project.description }}</p>
            <span class="n mono">{{ countLabel(project) }}</span>
          </li>
        </ul>
        <div class="os-foot">
          <NuxtLink class="more" to="/open-source">All open source</NuxtLink>
          <span class="mono muted">Registry counts as of {{ formatDate(registry.fetchedAt) }}</span>
        </div>
        <ContributionGraph :calendar="activity" />
      </section>

      <section id="ways" aria-labelledby="ways-heading">
        <SectionLabel id="ways-heading">ways-to-work</SectionLabel>
        <dl class="ways">
          <div v-for="way in waysToWork" :key="way.title">
            <dt>{{ way.title }}</dt>
            <dd>{{ way.body }}</dd>
          </div>
        </dl>
      </section>

      <section id="capabilities" aria-labelledby="capabilities-heading">
        <SectionLabel id="capabilities-heading">capabilities</SectionLabel>
        <div class="caps">
          <div v-for="capability in capabilities" :key="capability.title">
            <h3>{{ capability.title }}</h3>
            <p>{{ capability.body }}</p>
            <p class="mono">{{ capability.tech }}</p>
          </div>
        </div>
      </section>

      <section id="about" aria-labelledby="about-heading">
        <SectionLabel id="about-heading">about</SectionLabel>
        <div class="about">
          <div class="portrait">
            <img
              v-if="site.photo"
              :src="site.photo"
              :alt="`Portrait of ${site.name}`"
              width="480"
              height="480"
              loading="lazy"
            />
            <span v-else aria-hidden="true">AJ</span>
          </div>
          <div class="about-copy">
            <p>
              I'm based in Lahore, Pakistan, and I work remotely. I lead a team of 4+ engineers and
              stay hands-on in the architecture and the code.
            </p>
            <p>
              I like the part of a system where outside services meet real business rules. I use AI
              coding agents daily, and I build my own products too, including Lumen and ToolHub.
              AfoxTech is my personal brand and the home for that independent work.
            </p>
          </div>
        </div>
        <ol class="timeline">
          <li v-for="item in experience" :key="item.role">
            <span class="when mono">{{ item.when }}</span>
            <div>
              <b>{{ item.role }}</b>
              <span class="org">{{ item.org }}</span>
            </div>
          </li>
        </ol>
      </section>

      <ContactSection />
    </div>
  </main>
</template>
