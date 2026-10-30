import { proof, site } from '../data/site.ts'
import type { ArticleMeta, CaseStudyMeta } from '../types/content'
import { formatDate, roundedDownLabel } from './registry.ts'

export interface ShareCard {
  /** File name in `public/og/`, without the extension. */
  key: string
  /** Shown after `~/`, like the breadcrumb on the page itself. */
  path: string
  title: string
  context: string
  stats: { value: string; label: string }[]
  portrait: boolean
  date?: string
  alt: string
}

export interface ShareTarget {
  id: string
  label: string
  href: string
  /** Text for the clipboard, for services with no way to prefill a post. */
  copy?: string
}

export type PageKind = 'profile' | 'contact' | 'collection' | 'case-study' | 'article'

export interface PageSchema {
  kind: PageKind
  siteUrl: string
  url: string
  title: string
  description: string
  image: string
  published?: string
  updated?: string
  tags?: string[]
}

export interface RegistryTotals {
  packagist: number
  npm: number
}

const MAX_CARD_STATS = 3
const WORDS_PER_MINUTE = 220

const SCHEMA_TYPES: Record<PageKind, string> = {
  profile: 'ProfilePage',
  contact: 'ContactPage',
  collection: 'CollectionPage',
  'case-study': 'Article',
  article: 'BlogPosting'
}

function card(fields: Omit<ShareCard, 'alt' | 'portrait'> & { portrait?: boolean }): ShareCard {
  const stats = fields.stats.map((stat) => `${stat.value} ${stat.label}`).join(', ')
  const sentences = [fields.title, fields.context, stats, `By ${site.name}`].filter(Boolean)
  return {
    ...fields,
    portrait: fields.portrait ?? false,
    alt: sentences.map((text) => `${text.replace(/\.$/, '')}.`).join(' ')
  }
}

export const cardImage = (shareCard: ShareCard) => `/og/${shareCard.key}.png`

export const homeCard = () =>
  card({
    key: 'home',
    path: site.handle,
    title: 'I build reliable SaaS products and solve complex integration problems.',
    context: 'Senior Full-Stack Engineer · Software Architect',
    stats: [proof[0]!, proof[2]!, proof[3]!],
    portrait: true
  })

export const openSourceCard = (totals: RegistryTotals) =>
  card({
    key: 'open-source',
    path: 'open-source',
    title: 'Open source',
    context: 'Laravel, PHP, and Node packages, plus starters and tools',
    stats: [
      { value: '8', label: 'published packages' },
      { value: roundedDownLabel(totals.packagist), label: 'Packagist installs' },
      { value: roundedDownLabel(totals.npm), label: 'npm downloads' }
    ]
  })

export const resumeCard = () =>
  card({
    key: 'resume',
    path: 'resume',
    title: site.name,
    context: 'Senior Full-Stack Engineer · Software Architect',
    stats: [
      { value: 'Since 2016', label: 'building production software' },
      proof[0]!,
      { value: '8', label: 'open-source packages' }
    ],
    portrait: true
  })

export const contactCard = () =>
  card({
    key: 'contact',
    path: 'contact',
    title: site.status,
    context: 'SaaS projects, integration problems, and senior engineering roles',
    stats: [
      { value: site.email, label: 'email' },
      { value: 'Remote', label: 'from Lahore, Pakistan' }
    ],
    portrait: true
  })

export const writingCard = () =>
  card({
    key: 'writing',
    path: 'writing',
    title: 'Writing',
    context: 'Engineering articles on SaaS, integrations, and reliable delivery',
    stats: []
  })

export const caseStudyCard = (study: CaseStudyMeta) =>
  card({
    key: `work-${study.slug}`,
    path: `work/${study.slug}`,
    title: study.title,
    context: study.tagline,
    stats: study.stats.slice(0, MAX_CARD_STATS)
  })

export const articleCard = (article: ArticleMeta) =>
  card({
    key: `writing-${article.slug}`,
    path: `writing/${article.slug}`,
    title: article.title,
    context: article.description,
    stats: [],
    date: formatDate(article.date)
  })

export function shareCards(content: {
  caseStudies: CaseStudyMeta[]
  articles: ArticleMeta[]
  totals: RegistryTotals
}): ShareCard[] {
  return [
    homeCard(),
    openSourceCard(content.totals),
    resumeCard(),
    contactCard(),
    writingCard(),
    ...content.caseStudies.map(caseStudyCard),
    ...content.articles.map(articleCard)
  ]
}

export function shareTargets({ title, url }: { title: string; url: string }): ShareTarget[] {
  const encodedUrl = encodeURIComponent(url)
  const post = `${title} ${url}`
  return [
    {
      id: 'linkedin',
      label: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      id: 'whatsapp',
      label: 'whatsapp',
      href: `https://wa.me/?text=${encodeURIComponent(post)}`
    },
    {
      id: 'reddit',
      label: 'reddit',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`
    },
    { id: 'dev-null', label: 'dev/null', href: 'https://dev-null.sh', copy: post }
  ]
}

export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export const personId = (siteUrl: string) => `${siteUrl}/#person`

function breadcrumbs({ kind, siteUrl, url, title }: PageSchema) {
  const trail = [
    { name: 'Home', item: siteUrl },
    ...(kind === 'article' ? [{ name: 'Writing', item: `${siteUrl}/writing` }] : []),
    { name: title, item: url }
  ]
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb }))
  }
}

export function pageSchema(page: PageSchema) {
  const person = { '@id': personId(page.siteUrl) }
  const isWriting = page.kind === 'case-study' || page.kind === 'article'
  const main = {
    '@type': SCHEMA_TYPES[page.kind],
    url: page.url,
    name: page.title,
    description: page.description,
    image: page.image,
    ...(page.kind === 'profile' && { mainEntity: person }),
    ...(isWriting && {
      headline: page.title,
      mainEntityOfPage: page.url,
      author: person,
      publisher: person,
      datePublished: page.published,
      dateModified: page.updated ?? page.published,
      keywords: page.tags
    })
  }
  return {
    '@context': 'https://schema.org',
    '@graph': page.url === page.siteUrl ? [main] : [main, breadcrumbs(page)]
  }
}

/** JSON-LD sits inside a script tag, so a stray `</script>` in the copy must stay inert. */
export const toJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
