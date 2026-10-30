import { getRequestHeader, type H3Event } from 'h3'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_TRACKED = 5000

/**
 * The client address as the reverse proxy saw it. nginx overwrites `X-Real-IP` with the connecting
 * address; the other forwarding headers can carry client-supplied values, so they are not trusted.
 */
export function clientAddress(event: H3Event, trustProxyHeaders: boolean): string {
  const proxied = trustProxyHeaders ? getRequestHeader(event, 'x-real-ip')?.trim() : ''
  return proxied || event.node.req.socket.remoteAddress || 'unknown'
}

export function isRateLimited(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now()
): boolean {
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED) {
      for (const [candidate, { resetAt }] of buckets) {
        if (resetAt <= now) buckets.delete(candidate)
      }
      if (buckets.size >= MAX_TRACKED) buckets.clear()
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  bucket.count += 1
  return bucket.count > max
}

export function resetRateLimits(): void {
  buckets.clear()
}
