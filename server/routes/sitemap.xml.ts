import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { articles, caseStudies } from '#content/meta'
import { isWritingEnabled } from '#shared/utils/writing'

export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig(event).public
  const paths = [
    '/',
    '/open-source',
    '/resume',
    '/contact',
    ...caseStudies.map((study) => `/work/${study.slug}`),
    ...(isWritingEnabled(articles.length)
      ? ['/writing', ...articles.map((article) => `/writing/${article.slug}`)]
      : [])
  ]
  const urls = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n')
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
})
