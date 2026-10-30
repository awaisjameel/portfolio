import { defineNuxtConfig } from 'nuxt/config'
import {
  assertProductionSiteUrl,
  createSecurityHeaders,
  parseBooleanEnv,
  resolveSiteUrl,
  withSecurityHeaders
} from './shared/utils/deployment'
import { site } from './shared/data/site'

const siteUrl = resolveSiteUrl()
const indexable = parseBooleanEnv(process.env.NUXT_SITE_INDEXABLE, true)
const analyticsSrc = process.env.NUXT_PUBLIC_ANALYTICS_SRC || ''
const securityHeaders = createSecurityHeaders(siteUrl, analyticsSrc)

// Runs before first paint so a saved theme never flashes the other one.
const themeInit =
  "try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}"

const cachedAsset = withSecurityHeaders(securityHeaders, {
  'Cache-Control': 'public, max-age=31536000, immutable'
})
const hourlyAsset = withSecurityHeaders(securityHeaders, {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
})

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-09-25',
  devtools: { enabled: false },
  telemetry: false,
  experimental: {
    payloadExtraction: false
  },
  sourcemap: {
    client: false,
    server: false
  },
  css: ['~/assets/css/main.css'],
  vite: {
    build: {
      // Inlined fonts become data: URLs, which the Content-Security-Policy rightly refuses.
      assetsInlineLimit: 0
    }
  },
  modules: [
    // `nuxt prepare` runs with NODE_ENV=production but only writes types, so it skips this check.
    (_options, nuxt) => {
      if (!nuxt.options._prepare) assertProductionSiteUrl()
    }
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: `%s | ${site.name}`,
      meta: [
        { name: 'theme-color', content: '#faf9f7', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#141210', media: '(prefers-color-scheme: dark)' },
        { name: 'author', content: site.name }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script: [{ innerHTML: themeInit, tagPosition: 'head' }]
    }
  },
  runtimeConfig: {
    trustProxyHeaders: true,
    githubToken: '',
    contactTo: '',
    smtp: {
      host: '',
      port: 587,
      user: '',
      password: '',
      from: ''
    },
    public: {
      siteUrl,
      indexable,
      whatsappNumber: '',
      analyticsSrc,
      analyticsWebsiteId: ''
    }
  },
  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml', '/robots.txt'],
      failOnError: true
    },
    routeRules: {
      '/**': { headers: securityHeaders },
      '/_nuxt/**': { headers: cachedAsset },
      '/robots.txt': { headers: hourlyAsset },
      '/sitemap.xml': { headers: hourlyAsset },
      '/api/**': {
        headers: withSecurityHeaders(securityHeaders, { 'X-Robots-Tag': 'noindex, nofollow' })
      }
    }
  }
})
