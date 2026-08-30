import { describe, it, expect, vi, beforeEach } from 'vitest'
import { en } from '@/lib/translations'

const cookieGet = vi.fn()
const cookieSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: cookieGet, set: cookieSet }),
}))

const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`)
})
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }))

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const api = {
  ApiError,
  addUserRepository: vi.fn(),
  deleteUserRepository: vi.fn(),
  getProviderFluxes: vi.fn(),
  subscribeFlux: vi.fn(),
  unsubscribeFlux: vi.fn(),
  getConnectorProviders: vi.fn(),
}
vi.mock('@/lib/api-client', () => api)

/** A token whose payload carries `sub` and an expiry one hour out. */
function makeToken(payload: Record<string, unknown> = {}) {
  const body = Buffer.from(
    JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600, ...payload }),
  ).toString('base64url')
  return `header.${body}.sig`
}

function jsonRequest(body: unknown) {
  return { json: async () => body } as Request
}

beforeEach(() => {
  vi.clearAllMocks()
  cookieGet.mockReturnValue({ value: makeToken() })
  api.addUserRepository.mockResolvedValue({ repository: { id: 'r1', repository_id: 1 } })
  api.deleteUserRepository.mockResolvedValue(undefined)
  api.getProviderFluxes.mockResolvedValue([])
  api.subscribeFlux.mockResolvedValue(undefined)
  api.unsubscribeFlux.mockResolvedValue(undefined)
  api.getConnectorProviders.mockResolvedValue([])
})

describe('POST /api/fluxes', () => {
  it('returns 401 without a session cookie', async () => {
    cookieGet.mockReturnValue(undefined)
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'changelog', url: 'https://github.com/a/b/' }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: en.errors.notAuthenticated })
  })

  it('returns 400 on a schema violation', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'changelog', url: 'not-a-url' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe(en.errors.invalidData)
  })

  it('forwards the client-built url to addUserRepository', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(
      jsonRequest({ provider: 'changelog', url: 'https://github.com/facebook/react/' }),
    )

    expect(res.status).toBe(201)
    expect((await res.json()).flux.identifier).toBe('github.com/facebook/react/')
    expect(api.addUserRepository).toHaveBeenCalledWith('u1', expect.any(String), {
      provider: 'changelog',
      url: 'https://github.com/facebook/react/',
      config: { max_scraps: 5, retention_days: 15 },
    })
  })

  it('returns 400 when the url is missing', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'changelog' }))
    expect(res.status).toBe(400)
  })

  it('returns 202 without a flux when the provider is `manual` (pending approval)', async () => {
    api.addUserRepository.mockResolvedValue({ status: 'pending', request: { id: 'req-1' } })
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'scrap', url: 'https://blog.dev' }))
    expect(res.status).toBe(202)
    expect(await res.json()).toEqual({ status: 'pending' })
  })

  // Le message de l'API est en anglais quelle que soit la langue : on branche sur le
  // statut HTTP, seul contrat stable, et on traduit ici.
  it('maps a 409 from the API to an already-following message', async () => {
    api.addUserRepository.mockRejectedValue(new ApiError(409, 'Already subscribed'))
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'rss', url: 'https://x.dev/feed' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe(en.errors.alreadySubscribed)
  })

  it('maps a 409 about another provider to its own message', async () => {
    api.addUserRepository.mockRejectedValue(
      new ApiError(409, 'This URL is already registered under another provider'),
    )
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'rss', url: 'https://x.dev/feed' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe(en.errors.urlOtherProvider)
  })

  it('maps any other API error to 500 without leaking its raw message', async () => {
    api.addUserRepository.mockRejectedValue(new Error('boom'))
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'rss', url: 'https://x.dev/feed' }))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe(en.errors.generic)
  })
})

describe('/api/providers/[provider]/fluxes', () => {
  const params = Promise.resolve({ provider: 'rss' })

  it('GET lists the fluxes of the provider', async () => {
    api.getProviderFluxes.mockResolvedValue([{ id: 1, url: 'https://a.dev' }])
    const { GET } = await import('@/app/api/providers/[provider]/fluxes/route')
    const res = await GET({} as Request, { params })
    expect(await res.json()).toEqual({ fluxes: [{ id: 1, url: 'https://a.dev' }] })
    expect(api.getProviderFluxes).toHaveBeenCalledWith('rss', expect.any(String))
  })

  it('GET degrades to an empty list on API failure', async () => {
    api.getProviderFluxes.mockRejectedValue(new Error('down'))
    const { GET } = await import('@/app/api/providers/[provider]/fluxes/route')
    expect(await (await GET({} as Request, { params })).json()).toEqual({ fluxes: [] })
  })

  it('POST subscribes the user to an existing flux', async () => {
    const { POST } = await import('@/app/api/providers/[provider]/fluxes/route')
    const res = await POST(jsonRequest({ id: 7 }), { params })
    expect(res.status).toBe(201)
    expect(api.subscribeFlux).toHaveBeenCalledWith('rss', 7, expect.any(String), undefined)
  })

  it('POST returns 400 without an id', async () => {
    const { POST } = await import('@/app/api/providers/[provider]/fluxes/route')
    expect((await POST(jsonRequest({}), { params })).status).toBe(400)
  })

  it('POST maps an "already subscribed" error to 409', async () => {
    api.subscribeFlux.mockRejectedValue(new Error('Already subscribed'))
    const { POST } = await import('@/app/api/providers/[provider]/fluxes/route')
    expect((await POST(jsonRequest({ id: 7 }), { params })).status).toBe(409)
  })

  it('DELETE unsubscribes the user', async () => {
    const { DELETE } = await import('@/app/api/providers/[provider]/fluxes/route')
    const res = await DELETE(jsonRequest({ id: 7 }), { params })
    expect(res.status).toBe(200)
    expect(api.unsubscribeFlux).toHaveBeenCalledWith('rss', 7, expect.any(String), undefined)
  })
})

describe('DELETE /api/fluxes/[id]', () => {
  const params = Promise.resolve({ id: 'link1' })

  it('returns 401 without a session cookie', async () => {
    cookieGet.mockReturnValue(undefined)
    const { DELETE } = await import('@/app/api/fluxes/[id]/route')
    const res = await DELETE({} as Request, { params })
    expect(res.status).toBe(401)
  })

  it('deletes the link', async () => {
    const { DELETE } = await import('@/app/api/fluxes/[id]/route')
    const res = await DELETE({} as Request, { params })
    expect(await res.json()).toEqual({ success: true })
    expect(api.deleteUserRepository).toHaveBeenCalledWith('u1', 'link1', expect.any(String))
  })

  it('returns 404 when the link is unknown', async () => {
    api.deleteUserRepository.mockRejectedValue(new Error('Flux introuvable'))
    const { DELETE } = await import('@/app/api/fluxes/[id]/route')
    const res = await DELETE({} as Request, { params })
    expect(res.status).toBe(404)
  })

  it('rethrows unexpected errors', async () => {
    api.deleteUserRepository.mockRejectedValue(new Error('database offline'))
    const { DELETE } = await import('@/app/api/fluxes/[id]/route')
    await expect(DELETE({} as Request, { params })).rejects.toThrow('database offline')
  })
})

describe('GET /api/providers', () => {
  it('returns 401 without a session cookie', async () => {
    cookieGet.mockReturnValue(undefined)
    const { GET } = await import('@/app/api/providers/route')
    expect((await GET()).status).toBe(401)
  })

  it('returns the discovered providers', async () => {
    api.getConnectorProviders.mockResolvedValue([{ name: 'youtube', displayName: 'YouTube' }])
    const { GET } = await import('@/app/api/providers/route')
    expect(await (await GET()).json()).toEqual({
      providers: [{ name: 'youtube', displayName: 'YouTube' }],
    })
  })

  it('degrades to an empty list when the API fails', async () => {
    api.getConnectorProviders.mockRejectedValue(new Error('down'))
    const { GET } = await import('@/app/api/providers/route')
    expect(await (await GET()).json()).toEqual({ providers: [] })
  })
})

describe('GET /api/auth/callback', () => {
  function requestWithToken(token?: string) {
    const params = new URLSearchParams(token ? { token } : {})
    return { nextUrl: { searchParams: params } } as never
  }

  it('redirects to the login page when no token is present', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')
    await expect(GET(requestWithToken())).rejects.toThrow('NEXT_REDIRECT:/login?error=oauth_failed')
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('sets the session cookie and redirects to the feed', async () => {
    const token = makeToken()
    const { GET } = await import('@/app/api/auth/callback/route')
    await expect(GET(requestWithToken(token))).rejects.toThrow('NEXT_REDIRECT:/feed')
    expect(cookieSet).toHaveBeenCalledWith(
      'stayup_token',
      token,
      expect.objectContaining({ httpOnly: true, path: '/' }),
    )
  })

  it('rejects a token without a sub claim', async () => {
    const token = makeToken({ sub: undefined })
    const { GET } = await import('@/app/api/auth/callback/route')
    await expect(GET(requestWithToken(token))).rejects.toThrow(
      'NEXT_REDIRECT:/login?error=oauth_failed',
    )
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('rejects an expired token', async () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) - 60 })
    const { GET } = await import('@/app/api/auth/callback/route')
    await expect(GET(requestWithToken(token))).rejects.toThrow(
      'NEXT_REDIRECT:/login?error=oauth_failed',
    )
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('rejects a token with no exp claim', async () => {
    const token = makeToken({ exp: undefined })
    const { GET } = await import('@/app/api/auth/callback/route')
    await expect(GET(requestWithToken(token))).rejects.toThrow(
      'NEXT_REDIRECT:/login?error=oauth_failed',
    )
  })

  it('rejects a malformed token', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')
    await expect(GET(requestWithToken('garbage'))).rejects.toThrow(
      'NEXT_REDIRECT:/login?error=oauth_failed',
    )
  })
})
