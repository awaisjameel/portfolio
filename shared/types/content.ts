export interface CaseStudyMeta {
  slug: string
  title: string
  order: number
  size: 'large' | 'compact'
  role: string
  summary: string
  description: string
  lede: string
  visual?: 'tally' | 'speed'
  diagram?: 'quote-stages' | 'quote-speed'
  facts?: { value?: string; label: string }[]
  details: { label: string; value: string }[]
  image?: { src: string; alt: string; width: number; height: number }
  link?: { label: string; href: string }
  stats: { value: string; label: string }[]
  statsNote: string
}

export interface CaseStudy extends CaseStudyMeta {
  /** Rendered Markdown, split around the `<!-- diagram -->` marker. */
  body: [string, string]
}

export interface ArticleMeta {
  slug: string
  title: string
  description: string
  date: string
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
