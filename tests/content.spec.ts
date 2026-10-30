import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../modules/content/load'

const content = loadContent(resolve(import.meta.dirname, '../content'))

describe('site content', () => {
  it('loads the five case studies in order', () => {
    expect(content.caseStudies.map((study) => study.slug)).toEqual([
      'one-pro-suite',
      'rocketmga',
      'menscript',
      'toolhub',
      'lumen'
    ])
  })

  it('renders section headings as labels', () => {
    expect(content.caseStudies[0]?.body[0]).toMatchObject({
      html: expect.stringContaining('id="the-problem" class="label"')
    })
  })

  it('places diagrams where the markers sit, in order', () => {
    const diagrams = (slug: string) =>
      content.caseStudies
        .find((study) => study.slug === slug)
        ?.body.flatMap((block) => block.diagram ?? [])

    expect(diagrams('one-pro-suite')).toEqual([
      'quote-lifecycle',
      'platform-layers',
      'blue-green-release'
    ])
    expect(diagrams('rocketmga')).toEqual(['quote-speed'])
  })

  it('leaves no raw marker in the rendered text', () => {
    const html = content.caseStudies.flatMap((study) =>
      study.body.flatMap((block) => block.html ?? [])
    )
    expect(html.join('')).not.toContain('<!-- diagram')
  })

  it('skips drafts and templates', () => {
    expect(content.articles).toEqual([])
  })

  it('gives every case study a real results section', () => {
    for (const study of content.caseStudies) {
      expect(study.stats).toHaveLength(4)
      expect(study.statsNote).not.toBe('')
    }
  })
})
