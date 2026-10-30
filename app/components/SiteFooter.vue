<script setup lang="ts">
import { site } from '#shared/data/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="wrap foot mono">
      <span>© {{ year }} {{ site.name }} · AfoxTech</span>
      <NuxtLink to="/#contact">Get in touch</NuxtLink>
    </div>
  </footer>
</template>
