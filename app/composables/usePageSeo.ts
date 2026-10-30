import { site } from '#shared/data/site'
import {
  cardImage,
  pageSchema,
  toJsonLd,
  type PageKind,
  type ShareCard
} from '#shared/utils/social'

interface PageSeo {
  title: string
  description: string
  path: string
  kind: PageKind
  card: ShareCard
  published?: string
  updated?: string
  tags?: string[]
  /** Slack shows this as a small label and value under the preview. */
  detail?: { label: string; value: string }
}

const OG_TYPES: Record<PageKind, 'website' | 'article' | 'profile'> = {
  profile: 'profile',
  contact: 'website',
  collection: 'website',
  'case-study': 'article',
  article: 'article'
}

export function usePageSeo({
  title,
  description,
  path,
  kind,
  card,
  published,
  updated,
  tags,
  detail
}: PageSeo) {
  const { siteUrl } = useRuntimeConfig().public
  const url = `${siteUrl}${path === '/' ? '' : path}`
  const fullTitle = `${title} | ${site.name}`
  const image = `${siteUrl}${cardImage(card)}`
  const ogType = OG_TYPES[kind]

  useHead({
    title,
    link: [{ rel: 'canonical', href: url || siteUrl }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: toJsonLd(
          pageSchema({
            kind,
            siteUrl,
            url,
            title,
            description,
            image,
            published,
            updated,
            tags
          })
        )
      }
    ]
  })
  useSeoMeta({
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    ogUrl: url,
    ogType,
    ogSiteName: site.name,
    ogLocale: 'en_US',
    ogImage: image,
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: card.alt,
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: card.alt,
    ...(detail && { twitterLabel1: detail.label, twitterData1: detail.value }),
    ...(ogType === 'article' && {
      articleAuthor: [siteUrl],
      articlePublishedTime: published,
      articleModifiedTime: updated ?? published,
      articleTag: tags
    }),
    ...(ogType === 'profile' && {
      profileFirstName: site.firstName,
      profileLastName: site.lastName,
      profileUsername: site.handle
    })
  })
}
