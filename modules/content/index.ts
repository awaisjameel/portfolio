import { addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { SiteContent } from '../../shared/types/content'
import { isWritingEnabled } from '../../shared/utils/writing'
import { loadContent } from './load'

const stripBody = <T extends { body: unknown }>({ body: _body, ...meta }: T) => meta

const metaModule = (content: SiteContent) => `export const caseStudies = ${JSON.stringify(
  content.caseStudies.map(stripBody)
)}
export const articles = ${JSON.stringify(content.articles.map(stripBody))}
`

const bodyModule = (content: SiteContent) => `export const caseStudies = ${JSON.stringify(
  content.caseStudies
)}
export const articles = ${JSON.stringify(content.articles)}
export const resume = ${JSON.stringify(content.resume)}
`

/**
 * Renders Markdown at build time into plain modules: `#content/meta` for lists and
 * `#content/body` for full pages. Pages need no database and no content runtime in the browser.
 */
export default defineNuxtModule({
  meta: { name: 'site-content' },
  setup(_options, nuxt) {
    const contentDir = createResolver(nuxt.options.rootDir).resolve('content')
    const load = () => loadContent(contentDir)

    const meta = addTemplate({
      filename: 'site-content-meta.mjs',
      write: true,
      getContents: () => metaModule(load())
    })
    const body = addTemplate({
      filename: 'site-content-body.mjs',
      write: true,
      getContents: () => bodyModule(load())
    })
    nuxt.options.alias['#content/meta'] = meta.dst
    nuxt.options.alias['#content/body'] = body.dst

    // Nuxt prerenders every static page, and a hidden section would fail as a 404.
    nuxt.hook('nitro:config', (config) => {
      if (isWritingEnabled(load().articles.length)) return
      config.prerender ??= {}
      config.prerender.ignore = [...(config.prerender.ignore ?? []), '/writing']
    })

    nuxt.options.watch.push(contentDir)
  }
})
