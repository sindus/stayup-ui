import { describe, it, expect } from 'vitest'
import { decodeJwtPayload } from '@/lib/jwt'

function makeToken(payload: object): string {
  const encoded = btoa(JSON.stringify(payload))
  return `header.${encoded}.sig`
}

describe('decodeJwtPayload', () => {
  it('decodes role from a valid token', () => {
    const token = makeToken({ sub: 'user-1', role: 'admin', exp: 9999999999 })
    const payload = decodeJwtPayload(token)
    expect(payload.role).toBe('admin')
    expect(payload.sub).toBe('user-1')
    expect(payload.exp).toBe(9999999999)
  })

  it('decodes user role token', () => {
    const token = makeToken({ sub: 'user-2', role: 'user', exp: 9999999999 })
    const payload = decodeJwtPayload(token)
    expect(payload.role).toBe('user')
  })

  it('returns empty object for malformed token', () => {
    expect(decodeJwtPayload('notavalidtoken')).toEqual({})
    expect(decodeJwtPayload('')).toEqual({})
    expect(decodeJwtPayload('a.b')).toEqual({})
  })

  it('returns empty object when payload is not valid JSON', () => {
    const token = `header.${btoa('not-json')}.sig`
    expect(decodeJwtPayload(token)).toEqual({})
  })

  it('handles base64url encoding (- and _ chars)', () => {
    // Manually build a base64url payload (+ → -, / → _)
    const json = JSON.stringify({ sub: 'u', role: 'user' })
    const b64url = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    const token = `header.${b64url}.sig`
    const payload = decodeJwtPayload(token)
    expect(payload.role).toBe('user')
  })
})
