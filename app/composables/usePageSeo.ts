import { site } from '#shared/data/site'

interface PageSeo {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}

export function usePageSeo({ title, description, path, type = 'website' }: PageSeo) {
  const { siteUrl } = useRuntimeConfig().public
  const url = `${siteUrl}${path === '/' ? '' : path}`
  const fullTitle = `${title} | ${site.name}`
  const image = `${siteUrl}/og.png`

  useHead({
    title,
    link: [{ rel: 'canonical', href: url || siteUrl }]
  })
  useSeoMeta({
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    ogUrl: url,
    ogType: type,
    ogSiteName: site.name,
    ogImage: image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: image
  })
}
