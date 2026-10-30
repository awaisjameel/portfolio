import type { FlowName } from '../data/flows'

export type DiagramName = FlowName | 'quote-speed'

/** Rendered Markdown, or a diagram placed by a `<!-- diagram:name -->` marker. */
export type CaseStudyBlock = { html: string; diagram?: never } | { diagram: DiagramName }

export interface CaseStudyMeta {
  slug: string
  title: string
  order: number
  size: 'large' | 'compact'
  role: string
  tagline: string
  published: string
  updated?: string
  summary: string
  description: string
  lede: string
  visual?: 'tally' | 'speed'
  facts?: { value?: string; label: string }[]
  details: { label: string; value: string }[]
  image?: { src: string; alt: string; width: number; height: number }
  link?: { label: string; href: string }
  stats: { value: string; label: string }[]
  statsNote: string
}

export interface CaseStudy extends CaseStudyMeta {
  body: CaseStudyBlock[]
}

export interface ArticleMeta {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  tags?: string[]
  draft: boolean
}

export interface Article extends ArticleMeta {
  body: string
}

export interface SiteContent {
  caseStudies: CaseStudy[]
  articles: Article[]
  resume: string
}
