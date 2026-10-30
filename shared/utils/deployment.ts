const DEFAULT_DEV_SITE_URL = 'http://localhost:3001'

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

export type EnvSource = Record<string, string | undefined>

export function parseBooleanEnv(value: string | undefined, fallback = false): boolean {
  if (value == null || value === '') return fallback
  switch (value.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true
    case '0':
    case 'false':
    case 'no':
    case 'off':
      return false
    default:
      return fallback
  }
}

export function normalizeSiteUrl(rawSiteUrl?: string | null): string {
  if (!rawSiteUrl) return DEFAULT_DEV_SITE_URL
  return rawSiteUrl.trim().replace(/\/+$/, '') || DEFAULT_DEV_SITE_URL
}

export function resolveSiteUrl(env: EnvSource = process.env): string {
  return normalizeSiteUrl(env.NUXT_PUBLIC_SITE_URL)
}

export function assertProductionSiteUrl(env: EnvSource = process.env): void {
  if (env.NODE_ENV !== 'production' || env.NUXT_DISABLE_SITE_URL_VALIDATION === 'true') return
  const siteUrl = env.NUXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    throw new Error(
      'Production builds require NUXT_PUBLIC_SITE_URL so canonical URLs and the sitemap are not generated with localhost.'
    )
  }
  const parsed = new URL(normalizeSiteUrl(siteUrl))
  if (parsed.protocol !== 'https:' || LOCAL_HOSTNAMES.has(parsed.hostname)) {
    throw new Error(`Production builds require an HTTPS site URL. Received "${siteUrl}".`)
  }
}

/**
 * Headers for every response. HSTS deliberately omits `includeSubDomains`: this site runs on the
 * apex domain, and that directive would also force HTTPS on mail and other subdomains.
 */
export function createSecurityHeaders(siteUrl: string, analyticsSrc = ''): Record<string, string> {
  const analyticsOrigin = analyticsSrc ? new URL(analyticsSrc).origin : ''
  const withAnalytics = (sources: string) =>
    analyticsOrigin ? `${sources} ${analyticsOrigin}` : sources

  const headers: Record<string, string> = {
    'Content-Security-Policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data:",
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      `script-src ${withAnalytics("'self' 'unsafe-inline'")}`,
      `connect-src ${withAnalytics("'self'")}`
    ].join('; '),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin'
  }

  if (new URL(normalizeSiteUrl(siteUrl)).protocol === 'https:') {
    headers['Strict-Transport-Security'] = 'max-age=31536000'
    headers['Content-Security-Policy'] += '; upgrade-insecure-requests'
  }

  return headers
}

export function withSecurityHeaders(
  securityHeaders: Record<string, string>,
  headers: Record<string, string> = {}
): Record<string, string> {
  return { ...securityHeaders, ...headers }
}
