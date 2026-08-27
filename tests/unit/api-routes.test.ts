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
  subscribeScrap: vi.fn(),
  validateFlux: vi.fn(),
  deleteUserRepository: vi.fn(),
  getScrapRepos: vi.fn(),
  createScrapRequest: vi.fn(),
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
  api.validateFlux.mockResolvedValue({ valid: true })
  api.addUserRepository.mockResolvedValue({ repository: { id: 'r1', repository_id: 1 } })
  api.subscribeScrap.mockResolvedValue(undefined)
  api.deleteUserRepository.mockResolvedValue(undefined)
  api.getScrapRepos.mockResolvedValue([])
  api.createScrapRequest.mockResolvedValue({ id: 'req1' })
  api.getConnectorProviders.mockResolvedValue([])
})

describe('POST /api/fluxes', () => {
  it('returns 401 without a session cookie', async () => {
    cookieGet.mockReturnValue(undefined)
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'changelog', identifier: 'a/b' }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: en.errors.notAuthenticated })
  })

  it('returns 400 on a schema violation', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'changelog', identifier: '' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe(en.errors.invalidData)
  })

  it('returns 400 for an unknown provider', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'documentation', docId: 1 }))
    expect(res.status).toBe(400)
  })

  it('creates a changelog flux and normalizes the identifier', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(
      jsonRequest({ provider: 'changelog', identifier: 'https://github.com/facebook/react' }),
    )

    expect(res.status).toBe(201)
    expect((await res.json()).flux.identifier).toBe('facebook/react')
    expect(api.addUserRepository).toHaveBeenCalledWith('u1', expect.any(String), {
      provider: 'changelog',
      url: 'https://github.com/facebook/react/',
      config: { max_scraps: 5, retention_days: 15 },
    })
  })

  // validateFlux renvoie une clé de traduction, pas une phrase toute faite.
  it('returns 404 when validation rejects the identifier', async () => {
    api.validateFlux.mockResolvedValue({ valid: false, reason: 'githubRepoNotFound' })
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'changelog', identifier: 'nope/nope' }))
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe(en.errors.githubRepoNotFound)
  })

  // Le message de l'API est en anglais quelle que soit la langue : on branche sur le
  // statut HTTP, seul contrat stable, et on traduit ici.
  it('maps a 409 from the API to an already-following message', async () => {
    api.addUserRepository.mockRejectedValue(new ApiError(409, 'Already subscribed'))
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'rss', identifier: 'https://x.dev/feed' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe(en.errors.alreadySubscribed)
  })

  it('maps a 409 about another provider to its own message', async () => {
    api.addUserRepository.mockRejectedValue(
      new ApiError(409, 'This URL is already registered under another provider'),
    )
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'rss', identifier: 'https://x.dev/feed' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe(en.errors.urlOtherProvider)
  })

  it('maps any other API error to 500 without leaking its raw message', async () => {
    api.addUserRepository.mockRejectedValue(new Error('boom'))
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'rss', identifier: 'https://x.dev/feed' }))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe(en.errors.generic)
  })

  it('subscribes to a scrap repository', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'scrap', scrapRepoId: 5 }))
    expect(res.status).toBe(201)
    expect(api.subscribeScrap).toHaveBeenCalledWith(5, expect.any(String))
  })

  it('returns 409 when already subscribed to the scrap repository', async () => {
    api.subscribeScrap.mockRejectedValue(new ApiError(409, 'Already subscribed'))
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'scrap', scrapRepoId: 5 }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe(en.errors.alreadySubscribed)
  })

  it('returns 500 on any other scrap subscription error', async () => {
    api.subscribeScrap.mockRejectedValue(new Error('down'))
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'scrap', scrapRepoId: 5 }))
    expect(res.status).toBe(500)
  })

  it('rejects a non-positive scrapRepoId', async () => {
    const { POST } = await import('@/app/api/fluxes/route')
    const res = await POST(jsonRequest({ provider: 'scrap', scrapRepoId: 0 }))
    expect(res.status).toBe(400)
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

describe('GET /api/scrap', () => {
  it('returns 401 without a session cookie', async () => {
    cookieGet.mockReturnValue(undefined)
    const { GET } = await import('@/app/api/scrap/route')
    expect((await GET()).status).toBe(401)
  })

  it('returns the repositories', async () => {
    api.getScrapRepos.mockResolvedValue([{ id: 1, url: 'https://a.dev' }])
    const { GET } = await import('@/app/api/scrap/route')
    expect(await (await GET()).json()).toEqual({ repos: [{ id: 1, url: 'https://a.dev' }] })
  })

  it('degrades to an empty list when the API fails', async () => {
    api.getScrapRepos.mockRejectedValue(new Error('down'))
    const { GET } = await import('@/app/api/scrap/route')
    expect(await (await GET()).json()).toEqual({ repos: [] })
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

describe('POST /api/scrap/requests', () => {
  it('returns 401 without a session cookie', async () => {
    cookieGet.mockReturnValue(undefined)
    const { POST } = await import('@/app/api/scrap/requests/route')
    expect((await POST(jsonRequest({ url: 'https://a.dev' }))).status).toBe(401)
  })

  it('returns 400 when url is missing', async () => {
    const { POST } = await import('@/app/api/scrap/requests/route')
    const res = await POST(jsonRequest({}))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('url is required')
  })

  it('returns 400 when url is blank', async () => {
    const { POST } = await import('@/app/api/scrap/requests/route')
    expect((await POST(jsonRequest({ url: '   ' }))).status).toBe(400)
  })

  it('returns 400 when the body is not valid JSON', async () => {
    const { POST } = await import('@/app/api/scrap/requests/route')
    const res = await POST({
      json: async () => {
        throw new Error('bad json')
      },
    } as unknown as Request)
    expect(res.status).toBe(400)
  })

  it('returns 400 when the url is malformed', async () => {
    const { POST } = await import('@/app/api/scrap/requests/route')
    const res = await POST(jsonRequest({ url: 'not-a-url' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("L'URL n'est pas valide")
  })

  it('creates the request', async () => {
    const { POST } = await import('@/app/api/scrap/requests/route')
    const res = await POST(jsonRequest({ url: 'https://a.dev/blog' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ id: 'req1' })
  })

  it('returns 409 when the request already exists', async () => {
    api.createScrapRequest.mockRejectedValue(new Error('request already exists'))
    const { POST } = await import('@/app/api/scrap/requests/route')
    expect((await POST(jsonRequest({ url: 'https://a.dev' }))).status).toBe(409)
  })

  it('returns 500 on any other API error', async () => {
    api.createScrapRequest.mockRejectedValue(new Error('down'))
    const { POST } = await import('@/app/api/scrap/requests/route')
    expect((await POST(jsonRequest({ url: 'https://a.dev' }))).status).toBe(500)
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
