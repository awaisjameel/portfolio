import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../modules/content/load'
import { site } from '../shared/data/site'
import { llmsText } from '../shared/utils/llms'

const root = resolve(import.meta.dirname, '..')
const publicFile = (name: string) => readFileSync(resolve(root, 'public', name))
const content = loadContent(resolve(root, 'content'))

const pngSize = (data: Buffer) => [data.readUInt32BE(16), data.readUInt32BE(20)]

describe('site icons', () => {
  const manifest = JSON.parse(publicFile('site.webmanifest').toString())

  it('names the owner in the manifest', () => {
    expect(manifest.name).toBe(site.name)
    expect(manifest.start_url).toBe('/')
  })

  it('offers an ordinary and a maskable icon', () => {
    const purposes = manifest.icons.map((icon: { purpose?: string }) => icon.purpose ?? 'any')
    expect(purposes).toContain('any')
    expect(purposes).toContain('maskable')
  })

  it.each(manifest.icons as { src: string; sizes: string }[])(
    'matches the declared size of $src',
    ({ src, sizes }) => {
      expect(pngSize(publicFile(`.${src}`)).join('x')).toBe(sizes)
    }
  )

  it('gives iOS a 180 pixel icon', () => {
    expect(pngSize(publicFile('apple-touch-icon.png'))).toEqual([180, 180])
  })

  it('ships a real ICO with each size it declares', () => {
    const ico = publicFile('favicon.ico')
    expect(ico.readUInt16LE(2)).toBe(1)
    const sizes = Array.from({ length: ico.readUInt16LE(4) }, (_, index) => {
      const entry = 6 + index * 16
      const image = ico.subarray(ico.readUInt32LE(entry + 12))
      expect(pngSize(image)).toEqual([ico[entry], ico[entry + 1]])
      return ico[entry]
    })
    expect(sizes).toEqual([16, 32, 48])
  })
})

describe('llmsText', () => {
  const input = {
    siteUrl: 'https://afoxtech.com',
    caseStudies: content.caseStudies,
    articles: []
  }

  it('starts with the name and summary', () => {
    expect(llmsText(input).startsWith(`# ${site.name}\n\n> ${site.description}\n`)).toBe(true)
  })

  it('links every case study with its description', () => {
    const text = llmsText(input)
    for (const study of content.caseStudies) {
      expect(text).toContain(
        `- [${study.title}](https://afoxtech.com/work/${study.slug}): ${study.description}`
      )
    }
  })

  it('leaves out the articles section until articles are published', () => {
    expect(llmsText(input)).not.toContain('## Articles')
    const article = {
      slug: 'quote-speed',
      title: 'Quote speed',
      description: 'How it got faster.'
    }
    expect(llmsText({ ...input, articles: [article] })).toContain(
      '- [Quote speed](https://afoxtech.com/writing/quote-speed): How it got faster.'
    )
  })
})
