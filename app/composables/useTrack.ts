declare global {
  interface Window {
    umami?: { track: (event: string) => void }
  }
}

/** Sends a named, cookie-free event. Does nothing when analytics is not configured. */
export function track(event: string): void {
  if (import.meta.client) window.umami?.track(event)
}
