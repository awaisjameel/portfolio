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
    expect(content.caseStudies[0]?.body[0]).toContain('id="the-problem" class="label"')
  })

  it('splits case studies with a diagram around the marker', () => {
    for (const study of content.caseStudies.filter((item) => item.diagram)) {
      expect(study.body[1]).not.toBe('')
    }
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
