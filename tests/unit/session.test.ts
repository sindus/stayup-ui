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

describe('ADMIN_COOKIE_NAME', () => {
  it('is re-exported from constants and distinct from COOKIE_NAME', async () => {
    const { COOKIE_NAME, ADMIN_COOKIE_NAME } = await import('@/lib/session')
    expect(ADMIN_COOKIE_NAME).toBe('stayup_admin_token')
    expect(ADMIN_COOKIE_NAME).not.toBe(COOKIE_NAME)
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

  it('reads the user cookie, not the admin one', async () => {
    mockGet.mockReturnValue({ value: 'raw-token' })
    const { getToken } = await import('@/lib/session')
    await getToken()
    expect(mockGet).toHaveBeenCalledWith('stayup_token')
  })
})

describe('getAdminSession', () => {
  it('returns null when no admin cookie is set', async () => {
    mockGet.mockReturnValue(undefined)
    const { getAdminSession } = await import('@/lib/session')
    expect(await getAdminSession()).toBeNull()
  })

  it('returns the decoded session when the admin cookie holds a valid token', async () => {
    mockGet.mockReturnValue({
      value: makeToken({ sub: 'admin1', name: 'Root', email: 'root@example.com', role: 'admin' }),
    })
    const { getAdminSession } = await import('@/lib/session')
    expect(await getAdminSession()).toEqual({
      userId: 'admin1',
      name: 'Root',
      email: 'root@example.com',
      role: 'admin',
    })
  })

  it('returns null when the token cannot be decoded', async () => {
    mockGet.mockReturnValue({ value: 'garbage' })
    const { getAdminSession } = await import('@/lib/session')
    expect(await getAdminSession()).toBeNull()
  })

  it('reads the admin cookie, not the user one', async () => {
    mockGet.mockReturnValue({ value: makeToken({ sub: 'admin1', role: 'admin' }) })
    const { getAdminSession } = await import('@/lib/session')
    await getAdminSession()
    expect(mockGet).toHaveBeenCalledWith('stayup_admin_token')
  })
})

describe('getAdminToken', () => {
  it('returns the raw admin cookie value', async () => {
    mockGet.mockReturnValue({ value: 'raw-admin-token' })
    const { getAdminToken } = await import('@/lib/session')
    expect(await getAdminToken()).toBe('raw-admin-token')
  })

  it('returns null when the admin cookie is absent', async () => {
    mockGet.mockReturnValue(undefined)
    const { getAdminToken } = await import('@/lib/session')
    expect(await getAdminToken()).toBeNull()
  })

  it('reads the admin cookie, not the user one', async () => {
    mockGet.mockReturnValue({ value: 'raw-admin-token' })
    const { getAdminToken } = await import('@/lib/session')
    await getAdminToken()
    expect(mockGet).toHaveBeenCalledWith('stayup_admin_token')
  })
})

describe('decodeToken — expiration', () => {
  it('rejects an expired token', async () => {
    const { decodeToken } = await import('@/lib/session')
    const expired = makeToken({
      sub: 'u1',
      role: 'user',
      exp: Math.floor(Date.now() / 1000) - 10,
    })
    expect(() => decodeToken(expired)).toThrow()
  })

  it('accepts a token that is still valid', async () => {
    const { decodeToken } = await import('@/lib/session')
    const live = makeToken({
      sub: 'u1',
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    expect(decodeToken(live).userId).toBe('u1')
  })
})

// Le payload d'un token n'est pas signé de ce côté : seule l'API peut dire si un
// cookie « admin » est authentique. Sans ça, un payload fabriqué ouvrait /admin.
describe('isAdminTokenValid', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('accepts a token the API confirms as admin', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ role: 'admin' }) })
    const { isAdminTokenValid } = await import('@/lib/session')
    expect(await isAdminTokenValid('whatever')).toBe(true)
  })

  it('rejects a forged token the API refuses', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) })
    const { isAdminTokenValid } = await import('@/lib/session')
    expect(await isAdminTokenValid('forged')).toBe(false)
  })

  it('rejects a valid token that is not admin', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ role: 'user' }) })
    const { isAdminTokenValid } = await import('@/lib/session')
    expect(await isAdminTokenValid('user-token')).toBe(false)
  })

  it('rejects rather than throws when the API is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const { isAdminTokenValid } = await import('@/lib/session')
    expect(await isAdminTokenValid('any')).toBe(false)
  })
})
