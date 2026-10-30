import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { articles, caseStudies } from '#content/meta'
import { llmsText } from '#shared/utils/llms'
import { isWritingEnabled } from '#shared/utils/writing'

export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig(event).public
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return llmsText({
    siteUrl,
    caseStudies,
    articles: isWritingEnabled(articles.length) ? articles : []
  })
})
