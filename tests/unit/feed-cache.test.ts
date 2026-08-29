import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// getUserFeed résout l'URL de l'API via un cookie (voir src/lib/apiUrl.ts) — aucune
// surcharge en test, donc on retombe sur STAYUP_API_URL.
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: vi.fn() }),
}))

beforeEach(() => {
  vi.resetModules()
  mockFetch.mockReset()
})

describe('getCachedUserFeed', () => {
  it('wraps getUserFeed and returns its payload', async () => {
    const payload = {
      repositories: [],
      connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
    }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => payload })

    const { getCachedUserFeed } = await import('@/lib/feed-cache')
    await expect(getCachedUserFeed('u1', 'token')).resolves.toEqual(payload)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('requests the feed endpoint for the given user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ repositories: [], connectors: {} }),
    })

    const { getCachedUserFeed } = await import('@/lib/feed-cache')
    await getCachedUserFeed('u42', 'token')
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/users/u42/feed')
  })
})

describe('getCachedTemplates', () => {
  it('indexes the providers returned by the API by name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        providers: [
          { name: 'changelog', displayName: 'Changelog', template: null },
          { name: 'rss', displayName: 'RSS', template: null },
        ],
      }),
    })

    const { getCachedTemplates } = await import('@/lib/feed-cache')
    const map = await getCachedTemplates('token')
    expect(Object.keys(map).sort()).toEqual(['changelog', 'rss'])
    expect(map.changelog.displayName).toBe('Changelog')
  })

  it('returns an empty map when the providers request fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'boom' })

    const { getCachedTemplates } = await import('@/lib/feed-cache')
    await expect(getCachedTemplates('token')).resolves.toEqual({})
  })
})
