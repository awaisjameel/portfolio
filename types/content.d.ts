declare module '#content/meta' {
  import type { ArticleMeta, CaseStudyMeta } from '#shared/types/content'
  export const caseStudies: CaseStudyMeta[]
  export const articles: ArticleMeta[]
}

declare module '#content/body' {
  import type { Article, CaseStudy } from '#shared/types/content'
  export const caseStudies: CaseStudy[]
  export const articles: Article[]
  export const resume: string
}
