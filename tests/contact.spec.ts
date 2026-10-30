import { describe, expect, it } from 'vitest'
import { validateContact } from '../shared/utils/contact'

const valid = {
  name: 'Sam Doe',
  email: 'sam@example.com',
  topic: 'A role',
  message: 'We need a senior engineer for an integration project.'
}

describe('validateContact', () => {
  it('accepts a complete message', () => {
    const result = validateContact(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.topic).toBe('A role')
  })

  it('reports each invalid field', () => {
    const result = validateContact({ name: ' ', email: 'nope', message: 'short' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name'])
  })

  it('collapses line breaks in names, which end up in the mail subject', () => {
    const result = validateContact({ ...valid, name: 'Sam\r\nBcc: someone@example.com' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.name).toBe('Sam Bcc: someone@example.com')
  })

  it('falls back to the first topic for an unknown value', () => {
    const result = validateContact({ ...valid, topic: 'Spam' })
    expect(result.ok && result.value.topic).toBe('A project')
  })

  it('handles a missing body', () => {
    expect(validateContact(undefined).ok).toBe(false)
  })

  it('rejects messages over the limit', () => {
    expect(validateContact({ ...valid, message: 'a'.repeat(5001) }).ok).toBe(false)
  })
})
