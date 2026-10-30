export const CONTACT_TOPICS = ['A project', 'A role', 'Something else'] as const

export type ContactTopic = (typeof CONTACT_TOPICS)[number]

export interface ContactMessage {
  name: string
  email: string
  topic: ContactTopic
  message: string
}

export type ContactResult =
  | { ok: true; value: ContactMessage }
  | { ok: false; errors: Partial<Record<keyof ContactMessage, string>> }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME = 120
const MAX_EMAIL = 254
const MIN_MESSAGE = 10
const MAX_MESSAGE = 5000

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Names end up in a mail subject, so line breaks are collapsed before anything else sees them. */
const singleLine = (value: string) => value.replace(/\s+/g, ' ')

export function validateContact(input: unknown): ContactResult {
  const body = (input ?? {}) as Record<string, unknown>
  const name = singleLine(text(body.name))
  const email = text(body.email)
  const message = text(body.message)
  const topic = CONTACT_TOPICS.find((option) => option === body.topic) ?? CONTACT_TOPICS[0]

  const errors: Partial<Record<keyof ContactMessage, string>> = {}
  if (!name) errors.name = 'Add your name.'
  else if (name.length > MAX_NAME) errors.name = 'Use a shorter name.'
  if (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Add a valid email address.'
  }
  if (message.length < MIN_MESSAGE) errors.message = 'Add a few words about what you need.'
  else if (message.length > MAX_MESSAGE)
    errors.message = 'Shorten your message to 5,000 characters.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { name, email, topic, message } }
}
