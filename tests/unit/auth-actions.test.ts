import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const cookieSet = vi.fn()
const cookieDelete = vi.fn()
const cookieGet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet, delete: cookieDelete, get: cookieGet }),
}))

/** next/navigation redirect throws to unwind the server action, like in Next.js. */
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`)
})
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }))

/** A token whose payload expires one hour after `now`. */
function makeToken(payload: Record<string, unknown> = {}) {
  const body = Buffer.from(
    JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600, ...payload }),
  ).toString('base64url')
  return `header.${body}.sig`
}

beforeEach(() => {
  vi.resetModules()
  mockFetch.mockReset()
  cookieSet.mockReset()
  cookieDelete.mockReset()
  cookieGet.mockReset()
  redirect.mockClear()
})

describe('loginAction', () => {
  it('sets the session cookie and redirects to /feed on success', async () => {
    const token = makeToken()
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token }) })

    const { loginAction } = await import('@/lib/auth-actions')
    await expect(loginAction('ada@example.com', 'pw')).rejects.toThrow('NEXT_REDIRECT:/feed')

    expect(cookieSet).toHaveBeenCalledWith(
      'stayup_token',
      token,
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    )
  })

  it('computes maxAge from the token exp claim', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token: makeToken() }) })

    const { loginAction } = await import('@/lib/auth-actions')
    await expect(loginAction('a@b.c', 'pw')).rejects.toThrow()

    const { maxAge } = cookieSet.mock.calls[0][2]
    expect(maxAge).toBeGreaterThan(3500)
    expect(maxAge).toBeLessThanOrEqual(3600)
  })

  it('clamps maxAge to 0 for an already expired token', async () => {
    const expired = makeToken({ exp: Math.floor(Date.now() / 1000) - 10 })
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token: expired }) })

    const { loginAction } = await import('@/lib/auth-actions')
    await expect(loginAction('a@b.c', 'pw')).rejects.toThrow()
    expect(cookieSet.mock.calls[0][2].maxAge).toBe(0)
  })

  it('returns an error and sets no cookie on bad credentials', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })

    const { loginAction } = await import('@/lib/auth-actions')
    expect(await loginAction('a@b.c', 'wrong')).toEqual({ error: 'Identifiants incorrects.' })
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('posts the credentials to the login endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })

    const { loginAction } = await import('@/lib/auth-actions')
    await loginAction('ada@example.com', 'pw')

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/auth/login')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ email: 'ada@example.com', password: 'pw' })
  })
})

describe('registerAction', () => {
  it('sets the cookie and redirects to /feed on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token: makeToken() }) })

    const { registerAction } = await import('@/lib/auth-actions')
    await expect(registerAction('Ada', 'ada@example.com', 'pw')).rejects.toThrow(
      'NEXT_REDIRECT:/feed',
    )
    expect(cookieSet).toHaveBeenCalled()
  })

  it('returns a dedicated message when the email is already taken', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({}) })

    const { registerAction } = await import('@/lib/auth-actions')
    expect(await registerAction('Ada', 'ada@example.com', 'pw')).toEqual({
      error: 'Cette adresse e-mail est déjà utilisée.',
    })
  })

  it('surfaces the API error message when present', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Mot de passe trop court' }),
    })

    const { registerAction } = await import('@/lib/auth-actions')
    expect(await registerAction('Ada', 'ada@example.com', 'x')).toEqual({
      error: 'Mot de passe trop court',
    })
  })

  it('falls back to a generic message when the body is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json')
      },
    })

    const { registerAction } = await import('@/lib/auth-actions')
    expect(await registerAction('Ada', 'ada@example.com', 'pw')).toEqual({
      error: "Une erreur est survenue lors de l'inscription.",
    })
  })
})

describe('adminLoginAction', () => {
  it('sends username/password and redirects to /admin on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token: makeToken() }) })

    const { adminLoginAction } = await import('@/lib/auth-actions')
    await expect(adminLoginAction('root', 'pw')).rejects.toThrow('NEXT_REDIRECT:/admin')
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      username: 'root',
      password: 'pw',
    })
  })

  it('returns an error on bad credentials', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })

    const { adminLoginAction } = await import('@/lib/auth-actions')
    expect(await adminLoginAction('root', 'nope')).toEqual({ error: 'Identifiants incorrects.' })
  })
})

describe('logoutAction', () => {
  it('deletes the session cookie and redirects home', async () => {
    const { logoutAction } = await import('@/lib/auth-actions')
    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/')
    expect(cookieDelete).toHaveBeenCalledWith('stayup_token')
  })
})

describe('updateProfileAction', () => {
  it('returns an error when there is no token', async () => {
    cookieGet.mockReturnValue(undefined)

    const { updateProfileAction } = await import('@/lib/auth-actions')
    expect(await updateProfileAction({ name: 'Ada' })).toEqual({ error: 'Non authentifié.' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('PATCHes the current user with a bearer token', async () => {
    cookieGet.mockReturnValue({ value: makeToken({ sub: 'u9' }) })
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const { updateProfileAction } = await import('@/lib/auth-actions')
    expect(await updateProfileAction({ name: 'Ada' })).toEqual({})

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/users/u9')
    expect(init.method).toBe('PATCH')
    expect(init.headers.Authorization).toMatch(/^Bearer /)
  })

  it('surfaces the API error message', async () => {
    cookieGet.mockReturnValue({ value: makeToken() })
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email déjà pris' }),
    })

    const { updateProfileAction } = await import('@/lib/auth-actions')
    expect(await updateProfileAction({ email: 'x@y.z' })).toEqual({ error: 'Email déjà pris' })
  })

  it('falls back to a generic message when the error body is unreadable', async () => {
    cookieGet.mockReturnValue({ value: makeToken() })
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    })

    const { updateProfileAction } = await import('@/lib/auth-actions')
    expect(await updateProfileAction({ password: 'pw' })).toEqual({
      error: 'Erreur lors de la mise à jour.',
    })
  })
})
