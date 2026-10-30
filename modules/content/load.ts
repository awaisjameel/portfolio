import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import matter from 'gray-matter'
import { Marked, type Tokens } from 'marked'
import type { CaseStudy, SiteContent } from '../../shared/types/content'

const kebab = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Section headings become the same `# section-name` labels the home page uses. */
const sectionMarkdown = new Marked({
  gfm: true,
  renderer: {
    heading(this: { parser: { parseInline(tokens: Tokens.Heading['tokens']): string } }, token) {
      const html = this.parser.parseInline(token.tokens)
      if (token.depth !== 2) return `<h${token.depth}>${html}</h${token.depth}>\n`
      const label = kebab(token.text)
      return `<h2 id="${label}" class="label"><span aria-hidden="true">#</span> ${label}</h2>\n`
    }
  }
})

const plainMarkdown = new Marked({ gfm: true })

function markdownFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
    .sort()
    .map((file) => join(directory, file))
}

function requireFields(file: string, data: Record<string, unknown>, fields: string[]): void {
  const missing = fields.filter((field) => data[field] === undefined || data[field] === '')
  if (missing.length > 0) {
    throw new Error(`${file} is missing front matter: ${missing.join(', ')}`)
  }
}

export function loadCaseStudy(file: string): CaseStudy {
  const { data, content } = matter(readFileSync(file, 'utf8'))
  requireFields(file, data, [
    'title',
    'order',
    'size',
    'role',
    'summary',
    'description',
    'lede',
    'details',
    'stats',
    'statsNote'
  ])
  const html = sectionMarkdown.parse(content, { async: false })
  const [before = '', after = ''] = html.split('<!-- diagram -->')
  return { ...data, slug: basename(file, '.md'), body: [before, after] } as CaseStudy
}

export function loadContent(contentDir: string): SiteContent {
  const caseStudies = markdownFiles(join(contentDir, 'work'))
    .map(loadCaseStudy)
    .sort((a, b) => a.order - b.order)

  const articles = markdownFiles(join(contentDir, 'writing'))
    .map((file) => {
      const { data, content } = matter(readFileSync(file, 'utf8'))
      requireFields(file, data, ['title', 'description', 'date'])
      return {
        slug: basename(file, '.md'),
        title: String(data.title),
        description: String(data.description),
        date: new Date(data.date).toISOString().slice(0, 10),
        draft: Boolean(data.draft),
        body: sectionMarkdown.parse(content, { async: false })
      }
    })
    .filter((article) => !article.draft)
    .sort((a, b) => b.date.localeCompare(a.date))

  const resume = plainMarkdown.parse(readFileSync(join(contentDir, 'resume.md'), 'utf8'), {
    async: false
  })

  return { caseStudies, articles, resume }
}
