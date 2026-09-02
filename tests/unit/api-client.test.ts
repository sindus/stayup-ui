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

describe('getProviderFluxes', () => {
  it('unwraps the fluxes array for the given provider', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ fluxes: [{ id: 1, url: 'https://a.dev' }] }),
    })

    const { getProviderFluxes } = await import('@/lib/api-client')
    expect(await getProviderFluxes('scrap', TEST_TOKEN)).toHaveLength(1)
    expect(mockFetch.mock.calls[0][0]).toContain('/providers/scrap/fluxes')
  })
})

describe('subscribeFlux / unsubscribeFlux', () => {
  it('POSTs then DELETEs the subscription for a provider flux', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) })

    const { subscribeFlux, unsubscribeFlux } = await import('@/lib/api-client')
    await subscribeFlux('rss', 4, TEST_TOKEN)
    expect(mockFetch.mock.calls[0][0]).toContain('/providers/rss/fluxes/4/subscribe')
    expect(mockFetch.mock.calls[0][1].method).toBe('POST')

    await unsubscribeFlux('rss', 4, TEST_TOKEN)
    expect(mockFetch.mock.calls[1][1].method).toBe('DELETE')
  })
})

describe('adminListProviders / adminSetProviderApproval', () => {
  it('lists providers then PATCHes one approval mode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        providers: [{ name: 'rss', displayName: 'RSS', flux_approval: 'auto' }],
      }),
    })
    const { adminListProviders, adminSetProviderApproval } = await import('@/lib/api-client')
    expect(await adminListProviders(TEST_TOKEN)).toHaveLength(1)

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    await adminSetProviderApproval('rss', 'manual', TEST_TOKEN)
    expect(mockFetch.mock.calls[1][0]).toContain('/ui/providers/rss')
    expect(mockFetch.mock.calls[1][1].method).toBe('PATCH')
  })
})

describe('adminListFluxRequests / approve / reject', () => {
  it('unwraps the requests array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requests: [{ id: 'r1', provider: 'rss' }] }),
    })
    const { adminListFluxRequests } = await import('@/lib/api-client')
    expect(await adminListFluxRequests(TEST_TOKEN)).toHaveLength(1)
  })

  it('POSTs the approval and returns the repository id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ repository_id: 9 }) })
    const { adminApproveFluxRequest } = await import('@/lib/api-client')
    expect(await adminApproveFluxRequest('r1', {}, TEST_TOKEN)).toEqual({ repository_id: 9 })
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/flux-requests/r1/approve')
  })

  it('POSTs the rejection', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminRejectFluxRequest } = await import('@/lib/api-client')
    await adminRejectFluxRequest('r1', TEST_TOKEN)
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/flux-requests/r1/reject')
  })
})

// ─── Removed documentation surface ─────────────────────────────────────────────

describe('documentation API helpers', () => {
  it('are no longer exported', async () => {
    const mod = await import('@/lib/api-client')
    expect(Object.keys(mod).filter((k) => /Doc/i.test(k))).toEqual([])
  })
})

describe('apiFetch — rejeu et cache', () => {
  it('does not replay a POST that failed with a 500', async () => {
    // Le serveur a pu traiter la requête avant l'erreur : la rejouer créerait un
    // doublon d'abonnement.
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })

    const { addUserRepository } = await import('@/lib/api-client')
    await expect(
      addUserRepository('u1', 'token', { provider: 'rss', url: 'https://x.dev', config: {} }),
    ).rejects.toThrow()
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('replays a GET that failed with a 500', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ providers: [] }) })

    const { getConnectorProviders } = await import('@/lib/api-client')
    await getConnectorProviders('token')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('carries the HTTP status on the thrown error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Already subscribed' }),
    })

    const { ApiError, subscribeFlux } = await import('@/lib/api-client')
    await expect(subscribeFlux('rss', 1, 'token')).rejects.toMatchObject({
      status: 409,
    })
    expect(ApiError).toBeDefined()
  })

  it('never sets both cache and next.revalidate on the same request', async () => {
    // Les deux options s'excluent : les poser ensemble laissait une réponse
    // `no-store` être revalidée à 60 s.
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ repositories: [], connectors: {} }),
    })

    const { getUserFeed } = await import('@/lib/api-client')
    await getUserFeed('u1', 'token')

    const init = mockFetch.mock.calls[0][1]
    expect(init.cache).toBe('no-store')
    expect(init.next).toBeUndefined()
  })

  it('replays a GET when fetch itself throws (network drop)', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ providers: [] }) })

    const { getConnectorProviders } = await import('@/lib/api-client')
    await expect(getConnectorProviders('token')).resolves.toEqual([])
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('does not replay a POST when fetch itself throws', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNRESET'))

    const { subscribeFlux } = await import('@/lib/api-client')
    await expect(subscribeFlux('rss', 1, 'token')).rejects.toThrow('ECONNRESET')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

describe('admin account API wrappers', () => {
  it('adminListAdmins returns the admins array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        admins: [
          { id: '1', email: 'root@example.com', name: 'Root', is_super: true, created_at: 'x' },
        ],
      }),
    })
    const { adminListAdmins } = await import('@/lib/api-client')
    const result = await adminListAdmins(TEST_TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0].is_super).toBe(true)
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/admins')
  })

  it('adminCreateAdmin POSTs the new admin', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ admin: { id: '2' } }) })
    const { adminCreateAdmin } = await import('@/lib/api-client')
    await adminCreateAdmin({ email: 'a@b.c', name: 'A', password: 'longenough1' }, TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/admins')
    expect(init.method).toBe('POST')
  })

  it('adminUpdateAdmin PATCHes the admin by id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminUpdateAdmin } = await import('@/lib/api-client')
    await adminUpdateAdmin('7', { name: 'Renamed' }, TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/admins/7')
    expect(init.method).toBe('PATCH')
  })

  it('adminDeleteAdmin DELETEs the admin by id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminDeleteAdmin } = await import('@/lib/api-client')
    await adminDeleteAdmin('7', TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/admins/7')
    expect(init.method).toBe('DELETE')
  })

  it('adminChangeOwnPassword PATCHes /ui/admins/me', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminChangeOwnPassword } = await import('@/lib/api-client')
    await adminChangeOwnPassword({ currentPassword: 'old', password: 'longenough1' }, TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/admins/me')
    expect(init.method).toBe('PATCH')
  })
})

describe('data-source API wrappers', () => {
  it('adminListDataSources reads /ui/data-sources', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ primary: { engine: 'postgres', host: 'db' }, sources: [] }),
    })
    const { adminListDataSources } = await import('@/lib/api-client')
    const res = await adminListDataSources(TEST_TOKEN)
    expect(res.primary.engine).toBe('postgres')
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/data-sources')
  })

  it('adminTestDataSource POSTs the url to /ui/data-sources/test', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, engine: 'postgres', connectors: ['rss'] }),
    })
    const { adminTestDataSource } = await import('@/lib/api-client')
    await adminTestDataSource('postgres://x', TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/data-sources/test')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ url: 'postgres://x' })
  })

  it('adminAddDataSource POSTs name + url', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ dataSource: { id: 1 } }) })
    const { adminAddDataSource } = await import('@/lib/api-client')
    await adminAddDataSource({ name: 'A', url: 'postgres://x' }, TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/data-sources')
    expect(init.method).toBe('POST')
  })

  it('adminDeleteDataSource DELETEs by id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminDeleteDataSource } = await import('@/lib/api-client')
    await adminDeleteDataSource(7, TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/data-sources/7')
    expect(init.method).toBe('DELETE')
  })

  it('subscribeFlux carries a dataSourceId when given', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { subscribeFlux } = await import('@/lib/api-client')
    await subscribeFlux('rss', 3, TEST_TOKEN, 5)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/providers/rss/fluxes/3/subscribe')
    expect(JSON.parse(init.body)).toEqual({ dataSourceId: 5 })
  })

  it('subscribeFlux sends no body for a local flux', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { subscribeFlux } = await import('@/lib/api-client')
    await subscribeFlux('rss', 3, TEST_TOKEN)
    expect(mockFetch.mock.calls[0][1].body).toBeUndefined()
  })
})

describe('fetchAuthConfig', () => {
  it('returns the parsed config on success', async () => {
    const cfg = {
      registrationMode: 'approval',
      emailPassword: true,
      oauth: { github: true, google: false },
    }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => cfg })

    const { fetchAuthConfig } = await import('@/lib/api-client')
    await expect(fetchAuthConfig()).resolves.toEqual(cfg)
    expect(mockFetch.mock.calls[0][0]).toContain('/auth/config')
  })

  it('returns null when the endpoint is missing', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })
    const { fetchAuthConfig } = await import('@/lib/api-client')
    await expect(fetchAuthConfig()).resolves.toBeNull()
  })

  it('returns null when the request throws', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('unreachable'))
    const { fetchAuthConfig } = await import('@/lib/api-client')
    await expect(fetchAuthConfig()).resolves.toBeNull()
  })
})

describe('probeApiUrl', () => {
  it('reports "unreachable" when nothing answers', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    const { probeApiUrl } = await import('@/lib/api-client')
    await expect(probeApiUrl('https://nope.example.com')).resolves.toEqual({
      ok: false,
      reason: 'unreachable',
    })
  })

  it('reports "incompatible" on a non-2xx answer', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
    const { probeApiUrl } = await import('@/lib/api-client')
    await expect(probeApiUrl('https://example.com')).resolves.toEqual({
      ok: false,
      reason: 'incompatible',
    })
  })

  it('reports "incompatible" when the JSON is not an auth config', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ hello: 'world' }) })
    const { probeApiUrl } = await import('@/lib/api-client')
    await expect(probeApiUrl('https://example.com')).resolves.toEqual({
      ok: false,
      reason: 'incompatible',
    })
  })

  it('returns the config when the shape checks out', async () => {
    const cfg = {
      name: 'Mine',
      registrationMode: 'open',
      emailPassword: true,
      oauth: { github: false, google: true },
    }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => cfg })
    const { probeApiUrl } = await import('@/lib/api-client')
    await expect(probeApiUrl('https://example.com')).resolves.toEqual({ ok: true, config: cfg })
  })
})

describe('pending sign-up API wrappers', () => {
  it('adminListPendingUsers reads /ui/users/pending', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [
          { id: 'p-1', name: 'Ada', email: 'ada@x.dev', method: 'password', created_at: 'x' },
        ],
      }),
    })
    const { adminListPendingUsers } = await import('@/lib/api-client')
    const result = await adminListPendingUsers(TEST_TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0].method).toBe('password')
    expect(mockFetch.mock.calls[0][0]).toContain('/ui/users/pending')
  })

  it('adminApprovePendingUser POSTs the approve endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'u-9' } }) })
    const { adminApprovePendingUser } = await import('@/lib/api-client')
    await adminApprovePendingUser('p-1', TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/users/pending/p-1/approve')
    expect(init.method).toBe('POST')
  })

  it('adminRejectPendingUser POSTs the reject endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    const { adminRejectPendingUser } = await import('@/lib/api-client')
    await adminRejectPendingUser('p-1', TEST_TOKEN)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/users/pending/p-1/reject')
    expect(init.method).toBe('POST')
  })
})
