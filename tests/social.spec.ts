import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../modules/content/load'
import { site } from '../shared/data/site'
import registrySnapshot from '../shared/data/registry-snapshot.json'
import { sumCounts } from '../shared/utils/registry'
import {
  articleCard,
  caseStudyCard,
  cardImage,
  homeCard,
  pageSchema,
  readingMinutes,
  shareCards,
  shareTargets,
  toJsonLd,
  type ShareCard
} from '../shared/utils/social'

const root = resolve(import.meta.dirname, '..')
const content = loadContent(resolve(root, 'content'))
const cards = shareCards({
  caseStudies: content.caseStudies,
  articles: content.articles,
  totals: {
    packagist: sumCounts(registrySnapshot.packagist),
    npm: sumCounts(registrySnapshot.npm)
  }
})

const article = {
  slug: 'a-post',
  title: 'A post',
  description: 'About a thing.',
  date: '2026-11-02',
  draft: false
}
const page = {
  siteUrl: 'https://example.com',
  url: 'https://example.com/work/a',
  title: 'A | Awais Jameel',
  description: 'About A.',
  image: 'https://example.com/og/a.png'
}

function pngChunks(file: Buffer): { name: string; width?: number; height?: number }[] {
  const chunks = []
  for (let at = 8; at < file.length;) {
    const length = file.readUInt32BE(at)
    const name = file.toString('latin1', at + 4, at + 8)
    chunks.push(
      name === 'IHDR'
        ? { name, width: file.readUInt32BE(at + 8), height: file.readUInt32BE(at + 12) }
        : { name }
    )
    at += length + 12
  }
  return chunks
}

describe('share cards', () => {
  it('covers every page type', () => {
    expect(cards.map((card) => card.key)).toEqual([
      'home',
      'open-source',
      'resume',
      'contact',
      'writing',
      ...content.caseStudies.map((study) => `work-${study.slug}`),
      ...content.articles.map((item) => `writing-${item.slug}`)
    ])
  })

  it('has an image in the size platforms expect, with no metadata', () => {
    for (const card of cards) {
      const file = resolve(root, 'public', cardImage(card).slice(1))
      expect(existsSync(file), `${file} is missing: run npm run og:image`).toBe(true)
      const png = readFileSync(file)
      expect(png.length).toBeLessThan(300_000)
      const chunks = pngChunks(png)
      expect(chunks[0]).toMatchObject({ width: 1200, height: 630 })
      expect(chunks.map((chunk) => chunk.name)).toEqual(
        expect.not.arrayContaining(['tEXt', 'iTXt', 'zTXt', 'eXIf'])
      )
    }
  })

  it('matches the images on disk, so no card shows outdated numbers', () => {
    const built: ShareCard[] = JSON.parse(
      readFileSync(resolve(root, 'scripts/og-cards.json'), 'utf8')
    )
    expect(cards, 'Cards changed: run npm run og:image').toEqual(built)
  })

  it('shows the portrait only on personal pages', () => {
    expect(cards.filter((card) => card.portrait).map((card) => card.key)).toEqual([
      'home',
      'resume',
      'contact'
    ])
  })

  it('leads a case study with its own numbers', () => {
    const study = content.caseStudies[0]!
    expect(caseStudyCard(study).stats).toEqual(study.stats.slice(0, 3))
  })

  it('dates an article card', () => {
    expect(articleCard(article)).toMatchObject({ date: '2 Nov 2026', stats: [] })
  })

  it('writes clean sentences when copy already ends in a period', () => {
    expect(articleCard(article).alt).toBe('A post. About a thing. By Awais Jameel.')
  })

  it('describes the image for people who cannot see it', () => {
    expect(homeCard().alt).toContain('1,100+')
    for (const card of cards) {
      expect(card.alt).toContain(card.title)
      expect(card.alt.length).toBeLessThanOrEqual(420)
    }
  })
})

describe('share copy', () => {
  it('keeps titles and descriptions short enough not to be cut off', () => {
    for (const study of content.caseStudies) {
      expect(`${study.title} case study | ${site.name}`.length).toBeLessThanOrEqual(70)
      expect(study.description.length, study.slug).toBeLessThanOrEqual(160)
      expect(study.tagline.length, study.slug).toBeLessThanOrEqual(64)
    }
    expect(site.description.length).toBeLessThanOrEqual(160)
  })
})

describe('share links', () => {
  const targets = shareTargets({ title: 'A & B', url: 'https://example.com/work/a?b=c' })
  const href = (id: string) => targets.find((target) => target.id === id)?.href

  it('encodes the page for each platform', () => {
    expect(href('linkedin')).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fexample.com%2Fwork%2Fa%3Fb%3Dc'
    )
    expect(href('whatsapp')).toBe(
      'https://wa.me/?text=A%20%26%20B%20https%3A%2F%2Fexample.com%2Fwork%2Fa%3Fb%3Dc'
    )
    expect(href('reddit')).toBe(
      'https://www.reddit.com/submit?url=https%3A%2F%2Fexample.com%2Fwork%2Fa%3Fb%3Dc&title=A%20%26%20B'
    )
  })

  it('copies a post for /dev/null, which has no way to prefill one', () => {
    expect(targets.find((target) => target.id === 'dev-null')).toMatchObject({
      href: 'https://dev-null.sh',
      copy: 'A & B https://example.com/work/a?b=c'
    })
  })

  it('offers a copy step only where prefilling is impossible', () => {
    expect(targets.filter((target) => target.copy).map((target) => target.id)).toEqual(['dev-null'])
  })
})

describe('structured data', () => {
  const graph = (schema: ReturnType<typeof pageSchema>) => schema['@graph'] as { '@type': string }[]

  it('credits a case study to the person and carries its dates', () => {
    const [main] = graph(
      pageSchema({ ...page, kind: 'case-study', published: '2026-10-30' })
    ) as Record<string, unknown>[]
    expect(main).toMatchObject({
      '@type': 'Article',
      headline: page.title,
      image: page.image,
      author: { '@id': 'https://example.com/#person' },
      datePublished: '2026-10-30',
      dateModified: '2026-10-30'
    })
  })

  it('makes an article a blog post inside the writing section', () => {
    const [main, crumbs] = graph(
      pageSchema({
        ...page,
        kind: 'article',
        published: '2026-10-30',
        updated: '2026-11-02',
        tags: ['Laravel']
      })
    ) as Record<string, unknown>[]
    expect(main).toMatchObject({
      '@type': 'BlogPosting',
      dateModified: '2026-11-02',
      keywords: ['Laravel']
    })
    expect(crumbs?.itemListElement).toHaveLength(3)
  })

  it('makes the home page a profile with no breadcrumb', () => {
    const schema = pageSchema({ ...page, kind: 'profile', url: page.siteUrl })
    expect(graph(schema).map((item) => item['@type'])).toEqual(['ProfilePage'])
  })

  it('keeps copy from closing the script tag', () => {
    expect(toJsonLd({ name: '</script>' })).not.toContain('<')
    expect(JSON.parse(toJsonLd({ name: '</script>' }))).toEqual({ name: '</script>' })
  })
})

describe('reading time', () => {
  it('counts words, not markup', () => {
    expect(readingMinutes(`<p>${'word '.repeat(440)}</p>`)).toBe(2)
  })

  it('never reports zero', () => {
    expect(readingMinutes('<p>Short.</p>')).toBe(1)
  })
})
