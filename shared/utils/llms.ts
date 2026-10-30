import { site } from '../data/site.ts'

interface LlmsEntry {
  slug: string
  title: string
  description: string
}

interface LlmsInput {
  siteUrl: string
  caseStudies: LlmsEntry[]
  articles: LlmsEntry[]
}

const link = (label: string, url: string, note = '') =>
  `- [${label}](${url})${note ? `: ${note}` : ''}`

/** The site summary at /llms.txt, for tools that read a site on someone's behalf. */
export function llmsText({ siteUrl, caseStudies, articles }: LlmsInput): string {
  const sections = [
    `# ${site.name}`,
    `> ${site.description}`,
    `${site.status}. Location: ${site.location}. Contact: ${site.email}.`,
    '## Pages',
    [
      link('Home', siteUrl, 'Selected work, capabilities, and experience'),
      link('Résumé', `${siteUrl}/resume`, 'Full work history and skills'),
      link('Résumé PDF', `${siteUrl}${site.resumePdf}`),
      link('Open source', `${siteUrl}/open-source`, 'Packages and contribution activity'),
      link('Contact', `${siteUrl}/contact`, 'How to discuss a project or role')
    ].join('\n'),
    '## Case studies',
    caseStudies
      .map((study) => link(study.title, `${siteUrl}/work/${study.slug}`, study.description))
      .join('\n')
  ]
  if (articles.length) {
    sections.push(
      '## Articles',
      articles
        .map((article) =>
          link(article.title, `${siteUrl}/writing/${article.slug}`, article.description)
        )
        .join('\n')
    )
  }
  sections.push('## Profiles', site.links.map(({ label, href }) => link(label, href)).join('\n'))
  return `${sections.join('\n\n')}\n`
}
