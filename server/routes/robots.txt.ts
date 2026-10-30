import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  const { siteUrl, indexable } = useRuntimeConfig(event).public
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  if (!indexable) return 'User-agent: *\nDisallow: /\n'
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`
})
