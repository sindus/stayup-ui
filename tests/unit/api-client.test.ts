import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// apiFetch résout l'URL de l'API via un cookie (voir src/lib/apiUrl.ts) — aucune
// surcharge en test, donc on retombe sur STAYUP_API_URL (non défini ici, donc '').
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: vi.fn() }),
}))

const TEST_TOKEN = 'header.eyJzdWIiOiIxIn0.sig'

beforeEach(() => {
  vi.resetModules()
  mockFetch.mockReset()
})

describe('getConnectorProviders', () => {
  it('returns the discovered providers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        providers: [
          { name: 'changelog', displayName: 'Changelog' },
          { name: 'youtube', displayName: 'YouTube' },
        ],
      }),
    })

    const { getConnectorProviders } = await import('@/lib/api-client')
    const result = await getConnectorProviders(TEST_TOKEN)
    expect(result).toEqual([
      { name: 'changelog', displayName: 'Changelog' },
      { name: 'youtube', displayName: 'YouTube' },
    ])
    expect(mockFetch.mock.calls[0][0]).toContain('/connectors/providers')
  })

  it('propagates an API error', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403, json: async () => ({ error: 'Denied' }) })

    const { getConnectorProviders } = await import('@/lib/api-client')
    await expect(getConnectorProviders(TEST_TOKEN)).rejects.toThrow('Denied')
  })

  it('sends the bearer token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ providers: [] }) })

    const { getConnectorProviders } = await import('@/lib/api-client')
    await getConnectorProviders(TEST_TOKEN)
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${TEST_TOKEN}`)
  })
})

describe('admin API functions', () => {
  it('adminListUsers returns users array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [{ id: '1', name: 'Alice', email: 'alice@example.com', created_at: '2024-01-01' }],
      }),
    })
    const { adminListUsers } = await import('@/lib/api-client')
    const result = await adminListUsers(TEST_TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('alice@example.com')
  })

  it('adminGetUser returns single user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: '1', name: 'Alice', email: 'alice@example.com', created_at: '2024-01-01' },
      }),
    })
    const { adminGetUser } = await import('@/lib/api-client')
    const result = await adminGetUser('1', TEST_TOKEN)
    expect(result.id).toBe('1')
  })

  it('adminDeleteUser calls DELETE endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminDeleteUser } = await import('@/lib/api-client')
    await expect(adminDeleteUser('1', TEST_TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/ui/users/1'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('adminListRepositories returns repositories array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        repositories: [
          {
            id: 1,
            url: 'https://github.com/test/repo',
            type: 'changelog',
            config: {},
            subscriber_count: '3',
          },
        ],
      }),
    })
    const { adminListRepositories } = await import('@/lib/api-client')
    const result = await adminListRepositories(TEST_TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0].subscriber_count).toBe('3')
  })

  it('adminDeleteRepository calls DELETE endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminDeleteRepository } = await import('@/lib/api-client')
    await expect(adminDeleteRepository(42, TEST_TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/ui/repositories/42'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('adminClearRepositoryData calls DELETE /data endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminClearRepositoryData } = await import('@/lib/api-client')
    await expect(adminClearRepositoryData(42, TEST_TOKEN)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/ui/repositories/42/data'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('validateFlux', () => {
  // validateFlux calls the GitHub API directly — no JWT needed
  it('returns valid:true when GitHub repo exists', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: 'react' }),
    })

    const { validateFlux } = await import('@/lib/api-client')
    const result = await validateFlux('changelog', 'facebook/react')
    expect(result.valid).toBe(true)
  })

  it('returns valid:false when GitHub repo does not exist', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })

    const { validateFlux } = await import('@/lib/api-client')
    const result = await validateFlux('changelog', 'fake/nonexistent-repo-xyz')
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('GitHub')
  })

  it('returns valid:true for youtube provider without API call', async () => {
    const { validateFlux } = await import('@/lib/api-client')
    const result = await validateFlux('youtube', 'fireship')
    expect(result.valid).toBe(true)
    // fetch should not have been called (no API check for youtube)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns valid:false for an unknown provider given a non-URL identifier', async () => {
    const { validateFlux } = await import('@/lib/api-client')
    const result = await validateFlux('unknown', 'test')
    expect(result.valid).toBe(false)
  })

  it('returns valid:true for an unknown provider given a full URL', async () => {
    const { validateFlux } = await import('@/lib/api-client')
    const result = await validateFlux('unknown', 'https://example.com/feed')
    expect(result.valid).toBe(true)
    // Aucune requête réseau pour un provider inconnu.
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

// ─── Connectors & user feed ────────────────────────────────────────────────────

describe('getUserFeed', () => {
  it('requests the feed for the given user without caching', async () => {
    const payload = { repositories: [], connectors: {} }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => payload })

    const { getUserFeed } = await import('@/lib/api-client')
    await expect(getUserFeed('u1', TEST_TOKEN)).resolves.toEqual(payload)
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/users/u1/feed')
    expect(mockFetch.mock.calls[0][1].cache).toBe('no-store')
  })
})

describe('addUserRepository', () => {
  it('POSTs the repository payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ repository: { id: 'l1' } }),
    })

    const { addUserRepository } = await import('@/lib/api-client')
    const data = { provider: 'rss', url: 'https://a.dev/feed', config: {} }
    await expect(addUserRepository('u1', TEST_TOKEN, data)).resolves.toEqual({
      repository: { id: 'l1' },
    })

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/users/u1/repositories')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual(data)
    expect(init.headers['Content-Type']).toBe('application/json')
  })
})

describe('deleteUserRepository', () => {
  it('DELETEs the link', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { deleteUserRepository } = await import('@/lib/api-client')
    await deleteUserRepository('u1', 'l1', TEST_TOKEN)

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/users/u1/repositories/l1')
    expect(init.method).toBe('DELETE')
  })
})

// ─── Admin: users ──────────────────────────────────────────────────────────────

describe('adminListUsers', () => {
  it('unwraps the users array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [{ id: 'u1', name: 'Ada' }] }),
    })

    const { adminListUsers } = await import('@/lib/api-client')
    const users = await adminListUsers(TEST_TOKEN)
    expect(users).toHaveLength(1)
    expect(users[0].name).toBe('Ada')
  })
})

describe('adminGetUser', () => {
  it('unwraps the single user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 'u1', name: 'Ada' } }),
    })

    const { adminGetUser } = await import('@/lib/api-client')
    expect((await adminGetUser('u1', TEST_TOKEN)).name).toBe('Ada')
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/users/u1')
  })
})

describe('adminDeleteUser', () => {
  it('DELETEs the user', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { adminDeleteUser } = await import('@/lib/api-client')
    await adminDeleteUser('u1', TEST_TOKEN)
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE')
  })
})

// ─── Admin: repositories ───────────────────────────────────────────────────────

describe('adminListRepositories', () => {
  it('unwraps the repositories array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ repositories: [{ id: 1, url: 'https://a.dev' }] }),
    })

    const { adminListRepositories } = await import('@/lib/api-client')
    expect(await adminListRepositories(TEST_TOKEN)).toHaveLength(1)
  })
})

describe('adminCreateRepository', () => {
  it('POSTs the repository and returns its id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 12 }) })

    const { adminCreateRepository } = await import('@/lib/api-client')
    const body = { url: 'https://a.dev', type: 'scrap', config: {} }
    expect(await adminCreateRepository(body, TEST_TOKEN)).toEqual({ id: 12 })
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual(body)
  })
})

describe('adminDeleteRepository', () => {
  it('DELETEs the repository', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { adminDeleteRepository } = await import('@/lib/api-client')
    await adminDeleteRepository(3, TEST_TOKEN)
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/repositories/3')
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE')
  })
})

describe('adminClearRepositoryData', () => {
  it('DELETEs only the repository data', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { adminClearRepositoryData } = await import('@/lib/api-client')
    await adminClearRepositoryData(3, TEST_TOKEN)
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/repositories/3/data')
  })
})

// ─── Scrap ─────────────────────────────────────────────────────────────────────

describe('getScrapRepos', () => {
  it('unwraps the repos array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ repos: [{ id: 1, url: 'https://a.dev' }] }),
    })

    const { getScrapRepos } = await import('@/lib/api-client')
    expect(await getScrapRepos(TEST_TOKEN)).toHaveLength(1)
  })
})

describe('subscribeScrap', () => {
  it('POSTs the subscription', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { subscribeScrap } = await import('@/lib/api-client')
    await subscribeScrap(4, TEST_TOKEN)
    expect(mockFetch.mock.calls[0][0]).toContain('/scrap/4/subscribe')
    expect(mockFetch.mock.calls[0][1].method).toBe('POST')
  })
})

describe('unsubscribeScrap', () => {
  it('DELETEs the subscription', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { unsubscribeScrap } = await import('@/lib/api-client')
    await unsubscribeScrap(4, TEST_TOKEN)
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE')
  })
})

describe('createScrapRequest', () => {
  it('POSTs the request URL', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'r1' }) })

    const { createScrapRequest } = await import('@/lib/api-client')
    expect(await createScrapRequest({ url: 'https://a.dev' }, TEST_TOKEN)).toEqual({ id: 'r1' })
    expect(mockFetch.mock.calls[0][0]).toContain('/scrap/requests')
  })
})

describe('adminListScrapRequests', () => {
  it('unwraps the requests array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requests: [{ id: 'r1' }] }),
    })

    const { adminListScrapRequests } = await import('@/lib/api-client')
    expect(await adminListScrapRequests(TEST_TOKEN)).toHaveLength(1)
  })
})

describe('adminApproveScrapRequest', () => {
  it('POSTs the approval and returns the repository id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ repository_id: 9 }) })

    const { adminApproveScrapRequest } = await import('@/lib/api-client')
    const body = { url: 'https://a.dev', config: {} }
    expect(await adminApproveScrapRequest('r1', body, TEST_TOKEN)).toEqual({ repository_id: 9 })
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/scrap-requests/r1/approve')
  })
})

describe('adminRejectScrapRequest', () => {
  it('POSTs the rejection', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { adminRejectScrapRequest } = await import('@/lib/api-client')
    await adminRejectScrapRequest('r1', TEST_TOKEN)
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/scrap-requests/r1/reject')
    expect(mockFetch.mock.calls[0][1].method).toBe('POST')
  })
})

// ─── Removed documentation surface ─────────────────────────────────────────────

describe('documentation API helpers', () => {
  it('are no longer exported', async () => {
    const mod = await import('@/lib/api-client')
    expect(Object.keys(mod).filter((k) => /Doc/i.test(k))).toEqual([])
  })
})
