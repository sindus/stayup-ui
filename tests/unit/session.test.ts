import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: mockGet }),
}))

/** Builds an unsigned JWT-shaped token whose payload is `payload`. */
function makeToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `header.${body}.signature`
}

beforeEach(() => {
  mockGet.mockReset()
})

describe('COOKIE_NAME', () => {
  it('is re-exported from constants', async () => {
    const { COOKIE_NAME } = await import('@/lib/session')
    expect(COOKIE_NAME).toBe('stayup_token')
  })
})

describe('decodeToken', () => {
  it('maps sub to userId and keeps the other claims', async () => {
    const { decodeToken } = await import('@/lib/session')
    const token = makeToken({ sub: 'u1', name: 'Ada', email: 'ada@example.com', role: 'admin' })
    expect(decodeToken(token)).toEqual({
      userId: 'u1',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'admin',
    })
  })

  it('defaults name and email to empty strings and role to user', async () => {
    const { decodeToken } = await import('@/lib/session')
    expect(decodeToken(makeToken({ sub: 'u2' }))).toEqual({
      userId: 'u2',
      name: '',
      email: '',
      role: 'user',
    })
  })

  it('throws on a malformed payload', async () => {
    const { decodeToken } = await import('@/lib/session')
    expect(() => decodeToken('header.not-base64-json.sig')).toThrow()
  })
})

describe('getSession', () => {
  it('returns null when no cookie is set', async () => {
    mockGet.mockReturnValue(undefined)
    const { getSession } = await import('@/lib/session')
    expect(await getSession()).toBeNull()
  })

  it('returns the decoded session when the cookie holds a valid token', async () => {
    mockGet.mockReturnValue({
      value: makeToken({ sub: 'u3', name: 'Bob', email: 'bob@example.com', role: 'user' }),
    })
    const { getSession } = await import('@/lib/session')
    expect(await getSession()).toEqual({
      userId: 'u3',
      name: 'Bob',
      email: 'bob@example.com',
      role: 'user',
    })
  })

  it('returns null when the token cannot be decoded', async () => {
    mockGet.mockReturnValue({ value: 'garbage' })
    const { getSession } = await import('@/lib/session')
    expect(await getSession()).toBeNull()
  })
})

describe('getToken', () => {
  it('returns the raw cookie value', async () => {
    mockGet.mockReturnValue({ value: 'raw-token' })
    const { getToken } = await import('@/lib/session')
    expect(await getToken()).toBe('raw-token')
  })

  it('returns null when the cookie is absent', async () => {
    mockGet.mockReturnValue(undefined)
    const { getToken } = await import('@/lib/session')
    expect(await getToken()).toBeNull()
  })
})
