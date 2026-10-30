import { createError, defineEventHandler, getRequestHeader, getRequestHost, readBody } from 'h3'
import { createTransport } from 'nodemailer'
import { useRuntimeConfig } from '#imports'
import { validateContact } from '#shared/utils/contact'
import { clientAddress, isRateLimited } from '../utils/rateLimit'

const MAX_PER_WINDOW = 5
const WINDOW_MS = 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const origin = getRequestHeader(event, 'origin')
  if (origin && new URL(origin).host !== getRequestHost(event, { xForwardedHost: true })) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This form only accepts messages sent from this site.'
    })
  }

  const address = clientAddress(event, config.trustProxyHeaders)
  if (isRateLimited(`contact:${address}`, MAX_PER_WINDOW, WINDOW_MS)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many messages. Try again in an hour, or email me directly.'
    })
  }

  const body = await readBody<Record<string, unknown>>(event)

  // Real visitors never see this field. Reporting success keeps bots from adapting.
  if (body?.website) return { ok: true }

  const result = validateContact(body)
  if (!result.ok) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Check the highlighted fields.',
      data: { errors: result.errors }
    })
  }

  const { host, port, user, password, from } = config.smtp
  if (!host || !from || !config.contactTo) {
    throw createError({
      statusCode: 503,
      statusMessage: 'The form is unavailable right now. Email me directly instead.'
    })
  }

  const { name, email, topic, message } = result.value
  try {
    await createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: user ? { user, pass: password } : undefined
    }).sendMail({
      from,
      to: config.contactTo,
      replyTo: { name, address: email },
      subject: `Portfolio: ${topic} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nAbout: ${topic}\n\n${message}\n`
    })
  } catch (error) {
    console.error('Contact mail failed', error instanceof Error ? error.message : error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Your message could not be sent. Email me directly instead.'
    })
  }

  return { ok: true }
})
