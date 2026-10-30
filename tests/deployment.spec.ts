import { describe, expect, it } from 'vitest'
import {
  assertProductionSiteUrl,
  createSecurityHeaders,
  normalizeSiteUrl,
  parseBooleanEnv
} from '../shared/utils/deployment'

describe('createSecurityHeaders', () => {
  it('does not extend HSTS to subdomains from the apex domain', () => {
    const headers = createSecurityHeaders('https://afoxtech.com')
    expect(headers['Strict-Transport-Security']).toBe('max-age=31536000')
  })

  it('omits HSTS on plain HTTP', () => {
    expect(createSecurityHeaders('http://localhost:3001')['Strict-Transport-Security']).toBe(
      undefined
    )
  })

  it('allows only the configured analytics origin', () => {
    const policy = createSecurityHeaders(
      'https://afoxtech.com',
      'https://stats.example.com/script.js'
    )['Content-Security-Policy']
    expect(policy).toContain("script-src 'self' 'unsafe-inline' https://stats.example.com")
    expect(policy).toContain("connect-src 'self' https://stats.example.com")
  })
})

describe('assertProductionSiteUrl', () => {
  it('rejects a production build without a site URL', () => {
    expect(() => assertProductionSiteUrl({ NODE_ENV: 'production' })).toThrow()
  })

  it('rejects a local production URL', () => {
    expect(() =>
      assertProductionSiteUrl({
        NODE_ENV: 'production',
        NUXT_PUBLIC_SITE_URL: 'https://localhost:3001'
      })
    ).toThrow()
  })

  it('accepts an HTTPS URL', () => {
    expect(() =>
      assertProductionSiteUrl({
        NODE_ENV: 'production',
        NUXT_PUBLIC_SITE_URL: 'https://afoxtech.com'
      })
    ).not.toThrow()
  })
})

describe('environment parsing', () => {
  it('normalizes trailing slashes', () => {
    expect(normalizeSiteUrl('https://afoxtech.com/')).toBe('https://afoxtech.com')
  })

  it('reads booleans with a fallback', () => {
    expect(parseBooleanEnv('off', true)).toBe(false)
    expect(parseBooleanEnv(undefined, true)).toBe(true)
  })
})
