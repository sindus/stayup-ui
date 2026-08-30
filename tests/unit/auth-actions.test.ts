import { describe, it, expect, vi, beforeEach } from 'vitest'
import { en } from '@/lib/translations'

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
  it('stores the session in the instances cookie and redirects to /feed on success', async () => {
    const token = makeToken()
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token }) })

    const { loginAction } = await import('@/lib/auth-actions')
    await expect(loginAction('ada@example.com', 'pw')).rejects.toThrow('NEXT_REDIRECT:/feed')

    expect(cookieSet).toHaveBeenCalledWith(
      'stayup_instances',
      expect.stringContaining(token),
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
    expect(await loginAction('a@b.c', 'wrong')).toEqual({ error: en.errors.invalidCredentials })
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
      error: en.errors.emailTaken,
    })
  })

  // Le message brut de l'API est en anglais quelle que soit la langue du visiteur :
  // on affiche celui de ce déploiement plutôt que de le relayer.
  it('reports a translated failure instead of the raw API message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Password too short' }),
    })

    const { registerAction } = await import('@/lib/auth-actions')
    expect(await registerAction('Ada', 'ada@example.com', 'x')).toEqual({
      error: en.errors.generic,
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
      error: en.errors.generic,
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

  it('sets the admin cookie, not the user cookie', async () => {
    const token = makeToken()
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token }) })

    const { adminLoginAction } = await import('@/lib/auth-actions')
    await expect(adminLoginAction('root', 'pw')).rejects.toThrow()

    expect(cookieSet).toHaveBeenCalledWith(
      'stayup_admin_token',
      token,
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    )
  })

  it('returns an error on bad credentials', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })

    const { adminLoginAction } = await import('@/lib/auth-actions')
    expect(await adminLoginAction('root', 'nope')).toEqual({ error: en.errors.invalidCredentials })
    expect(cookieSet).not.toHaveBeenCalled()
  })
})

describe('logoutAction', () => {
  it('deletes the user cookie and redirects home', async () => {
    const { logoutAction } = await import('@/lib/auth-actions')
    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/')
    expect(cookieDelete).toHaveBeenCalledWith('stayup_token')
  })
})

describe('adminLogoutAction', () => {
  it('deletes the admin cookie and redirects to the admin login', async () => {
    const { adminLogoutAction } = await import('@/lib/auth-actions')
    await expect(adminLogoutAction()).rejects.toThrow('NEXT_REDIRECT:/admin/login')
    expect(cookieDelete).toHaveBeenCalledWith('stayup_admin_token')
  })
})

describe('updateProfileAction', () => {
  it('returns an error when there is no token', async () => {
    cookieGet.mockReturnValue(undefined)

    const { updateProfileAction } = await import('@/lib/auth-actions')
    expect(await updateProfileAction({ name: 'Ada' })).toEqual({
      error: en.errors.notAuthenticated,
    })
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

  it('maps a 409 to the taken-email message', async () => {
    cookieGet.mockReturnValue({ value: makeToken() })
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Email already in use' }),
    })

    const { updateProfileAction } = await import('@/lib/auth-actions')
    expect(await updateProfileAction({ email: 'x@y.z' })).toEqual({ error: en.errors.emailTaken })
  })

  // L'API refuse un changement de mot de passe sans l'actuel : le 401 doit se lire
  // comme « mot de passe actuel incorrect », pas comme une session perdue.
  it('maps a 401 to the wrong-current-password message', async () => {
    cookieGet.mockReturnValue({ value: makeToken() })
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    })

    const { updateProfileAction } = await import('@/lib/auth-actions')
    expect(await updateProfileAction({ password: 'pw', currentPassword: 'nope' })).toEqual({
      error: en.errors.wrongCurrentPassword,
    })
  })

  it('forwards the current password to the API', async () => {
    cookieGet.mockReturnValue({ value: makeToken() })
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const { updateProfileAction } = await import('@/lib/auth-actions')
    await updateProfileAction({ password: 'new-one', currentPassword: 'old-one' })

    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      password: 'new-one',
      currentPassword: 'old-one',
    })
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
      error: en.errors.updateFailed,
    })
  })
})
