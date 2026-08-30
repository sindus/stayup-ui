import { describe, it, expect, vi, beforeEach } from 'vitest'
import { en } from '@/lib/translations'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// adminUpdateUserAction résout l'URL de l'API via un cookie (voir src/lib/apiUrl.ts) —
// aucune surcharge en test, donc on retombe sur STAYUP_API_URL.
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: vi.fn() }),
}))

const getAdminToken = vi.fn()
vi.mock('@/lib/session', () => ({ getAdminToken: () => getAdminToken() }))

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePath(p) }))

const api = {
  adminClearRepositoryData: vi.fn(),
  adminCreateRepository: vi.fn(),
  adminDeleteRepository: vi.fn(),
  adminDeleteUser: vi.fn(),
  adminListFluxRequests: vi.fn(),
  adminApproveFluxRequest: vi.fn(),
  adminRejectFluxRequest: vi.fn(),
  adminListProviders: vi.fn(),
  adminSetProviderApproval: vi.fn(),
  deleteUserRepository: vi.fn(),
  adminChangeOwnPassword: vi.fn(),
  adminCreateAdmin: vi.fn(),
  adminDeleteAdmin: vi.fn(),
  adminUpdateAdmin: vi.fn(),
  adminListPendingUsers: vi.fn(),
  adminApprovePendingUser: vi.fn(),
  adminRejectPendingUser: vi.fn(),
  adminListDataSources: vi.fn(),
  adminTestDataSource: vi.fn(),
  adminAddDataSource: vi.fn(),
  adminDeleteDataSource: vi.fn(),
}
vi.mock('@/lib/api-client', () => api)

beforeEach(() => {
  vi.clearAllMocks()
  getAdminToken.mockResolvedValue('token')
  for (const fn of Object.values(api)) fn.mockResolvedValue(undefined)
})

describe('adminDeleteUserAction', () => {
  it('deletes the user and revalidates the list', async () => {
    const { adminDeleteUserAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteUserAction('u1')).toEqual({})
    expect(api.adminDeleteUser).toHaveBeenCalledWith('u1', 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminDeleteUserAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteUserAction('u1')).toEqual({ error: en.errors.notAuthenticated })
  })

  it('returns the API error message on failure', async () => {
    api.adminDeleteUser.mockRejectedValue(new Error('cannot delete'))
    const { adminDeleteUserAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteUserAction('u1')).toEqual({ error: 'cannot delete' })
  })
})

describe('adminUpdateUserAction', () => {
  it('PATCHes the user and revalidates both user pages', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const { adminUpdateUserAction } = await import('@/lib/admin-actions')
    expect(await adminUpdateUserAction('u1', { name: 'Ada' })).toEqual({})

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/ui/users/u1')
    expect(init.method).toBe('PATCH')
    expect(init.headers.Authorization).toBe('Bearer token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users/u1')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminUpdateUserAction } = await import('@/lib/admin-actions')
    expect(await adminUpdateUserAction('u1', { name: 'Ada' })).toEqual({
      error: en.errors.notAuthenticated,
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // Le message brut de l'API n'est plus relayé : il est en anglais quelle que soit
  // la langue du visiteur. On renvoie le message traduit de ce déploiement.
  it('reports a translated failure instead of the raw API message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Email pris' }) })

    const { adminUpdateUserAction } = await import('@/lib/admin-actions')
    expect(await adminUpdateUserAction('u1', { email: 'x@y.z' })).toEqual({
      error: en.errors.updateFailed,
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when the body is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    })

    const { adminUpdateUserAction } = await import('@/lib/admin-actions')
    expect(await adminUpdateUserAction('u1', { name: 'x' })).toEqual({
      error: en.errors.updateFailed,
    })
  })
})

describe('adminDeleteUserFluxAction', () => {
  it('deletes the link and revalidates the user page', async () => {
    const { adminDeleteUserFluxAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteUserFluxAction('u1', 'link1')).toEqual({})
    expect(api.deleteUserRepository).toHaveBeenCalledWith('u1', 'link1', 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users/u1')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminDeleteUserFluxAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteUserFluxAction('u1', 'link1')).toEqual({
      error: en.errors.notAuthenticated,
    })
  })

  it('returns the API error message on failure', async () => {
    api.deleteUserRepository.mockRejectedValue(new Error('nope'))
    const { adminDeleteUserFluxAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteUserFluxAction('u1', 'link1')).toEqual({ error: 'nope' })
  })
})

describe('adminDeleteRepositoryAction', () => {
  it('deletes the repository and revalidates the list', async () => {
    const { adminDeleteRepositoryAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteRepositoryAction(3)).toEqual({})
    expect(api.adminDeleteRepository).toHaveBeenCalledWith(3, 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/repositories')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminDeleteRepositoryAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteRepositoryAction(3)).toEqual({ error: en.errors.notAuthenticated })
  })

  it('returns the API error message on failure', async () => {
    api.adminDeleteRepository.mockRejectedValue(new Error('in use'))
    const { adminDeleteRepositoryAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteRepositoryAction(3)).toEqual({ error: 'in use' })
  })
})

describe('adminClearRepositoryDataAction', () => {
  it('clears the data and revalidates the list', async () => {
    const { adminClearRepositoryDataAction } = await import('@/lib/admin-actions')
    expect(await adminClearRepositoryDataAction(4)).toEqual({})
    expect(api.adminClearRepositoryData).toHaveBeenCalledWith(4, 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/repositories')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminClearRepositoryDataAction } = await import('@/lib/admin-actions')
    expect(await adminClearRepositoryDataAction(4)).toEqual({ error: en.errors.notAuthenticated })
  })

  it('returns the API error message on failure', async () => {
    api.adminClearRepositoryData.mockRejectedValue(new Error('locked'))
    const { adminClearRepositoryDataAction } = await import('@/lib/admin-actions')
    expect(await adminClearRepositoryDataAction(4)).toEqual({ error: 'locked' })
  })
})

describe('adminCreateRepositoryAction', () => {
  const payload = { url: 'https://example.com', type: 'scrap', config: {} }

  it('creates the repository and revalidates the list', async () => {
    const { adminCreateRepositoryAction } = await import('@/lib/admin-actions')
    expect(await adminCreateRepositoryAction(payload)).toEqual({})
    expect(api.adminCreateRepository).toHaveBeenCalledWith(payload, 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/repositories')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminCreateRepositoryAction } = await import('@/lib/admin-actions')
    expect(await adminCreateRepositoryAction(payload)).toEqual({
      error: en.errors.notAuthenticated,
    })
  })

  it('returns the API error message on failure', async () => {
    api.adminCreateRepository.mockRejectedValue(new Error('duplicate'))
    const { adminCreateRepositoryAction } = await import('@/lib/admin-actions')
    expect(await adminCreateRepositoryAction(payload)).toEqual({ error: 'duplicate' })
  })
})

describe('adminListFluxRequestsAction', () => {
  it('returns the requests', async () => {
    const requests = [{ id: 'r1', url: 'https://a.b' }]
    api.adminListFluxRequests.mockResolvedValue(requests)

    const { adminListFluxRequestsAction } = await import('@/lib/admin-actions')
    expect(await adminListFluxRequestsAction()).toEqual(requests)
  })

  it('returns an empty array when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminListFluxRequestsAction } = await import('@/lib/admin-actions')
    expect(await adminListFluxRequestsAction()).toEqual([])
    expect(api.adminListFluxRequests).not.toHaveBeenCalled()
  })

  it('swallows API failures and returns an empty array', async () => {
    api.adminListFluxRequests.mockRejectedValue(new Error('down'))
    const { adminListFluxRequestsAction } = await import('@/lib/admin-actions')
    expect(await adminListFluxRequestsAction()).toEqual([])
  })
})

describe('adminRejectFluxRequestAction', () => {
  it('rejects the request and revalidates the list', async () => {
    const { adminRejectFluxRequestAction } = await import('@/lib/admin-actions')
    expect(await adminRejectFluxRequestAction('r1')).toEqual({})
    expect(api.adminRejectFluxRequest).toHaveBeenCalledWith('r1', 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/flux-requests')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminRejectFluxRequestAction } = await import('@/lib/admin-actions')
    expect(await adminRejectFluxRequestAction('r1')).toEqual({ error: en.errors.notAuthenticated })
  })

  it('returns the API error message on failure', async () => {
    api.adminRejectFluxRequest.mockRejectedValue(new Error('already handled'))
    const { adminRejectFluxRequestAction } = await import('@/lib/admin-actions')
    expect(await adminRejectFluxRequestAction('r1')).toEqual({ error: 'already handled' })
  })
})

describe('adminApproveFluxRequestAction', () => {
  const payload = { config: {} }

  it('returns the new repository id and revalidates both pages', async () => {
    api.adminApproveFluxRequest.mockResolvedValue({ repository_id: 12 })

    const { adminApproveFluxRequestAction } = await import('@/lib/admin-actions')
    expect(await adminApproveFluxRequestAction('r1', payload)).toEqual({ repository_id: 12 })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/flux-requests')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/repositories')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminApproveFluxRequestAction } = await import('@/lib/admin-actions')
    expect(await adminApproveFluxRequestAction('r1', payload)).toEqual({
      error: en.errors.notAuthenticated,
    })
  })

  it('returns the API error message on failure', async () => {
    api.adminApproveFluxRequest.mockRejectedValue(new Error('bad config'))
    const { adminApproveFluxRequestAction } = await import('@/lib/admin-actions')
    expect(await adminApproveFluxRequestAction('r1', payload)).toEqual({ error: 'bad config' })
  })
})

describe('data-source actions', () => {
  it('lists data sources, null when unauthenticated or on failure', async () => {
    api.adminListDataSources.mockResolvedValue({ primary: { engine: 'postgres' }, sources: [] })
    const { adminListDataSourcesAction } = await import('@/lib/admin-actions')
    expect(await adminListDataSourcesAction()).toEqual({
      primary: { engine: 'postgres' },
      sources: [],
    })

    getAdminToken.mockResolvedValue(null)
    expect(await adminListDataSourcesAction()).toBeNull()

    getAdminToken.mockResolvedValue('token')
    api.adminListDataSources.mockRejectedValue(new Error('boom'))
    expect(await adminListDataSourcesAction()).toBeNull()
  })

  it('proxies a probe and its result', async () => {
    api.adminTestDataSource.mockResolvedValue({ ok: true, engine: 'postgres', connectors: ['rss'] })
    const { adminTestDataSourceAction } = await import('@/lib/admin-actions')
    expect(await adminTestDataSourceAction('postgres://x')).toEqual({
      ok: true,
      engine: 'postgres',
      connectors: ['rss'],
    })
    expect(api.adminTestDataSource).toHaveBeenCalledWith('postgres://x', 'token')
  })

  it('returns { ok: false } when the probe throws', async () => {
    api.adminTestDataSource.mockRejectedValue(new Error('unreachable'))
    const { adminTestDataSourceAction } = await import('@/lib/admin-actions')
    expect(await adminTestDataSourceAction('postgres://x')).toEqual({
      ok: false,
      error: 'unreachable',
    })
  })

  it('adds a data source and revalidates the page', async () => {
    const { adminAddDataSourceAction } = await import('@/lib/admin-actions')
    expect(await adminAddDataSourceAction({ name: 'A', url: 'postgres://x' })).toEqual({})
    expect(api.adminAddDataSource).toHaveBeenCalledWith({ name: 'A', url: 'postgres://x' }, 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/data-sources')
  })

  it('surfaces the add error', async () => {
    api.adminAddDataSource.mockRejectedValue(new Error('No connector_* table'))
    const { adminAddDataSourceAction } = await import('@/lib/admin-actions')
    expect(await adminAddDataSourceAction({ name: 'A', url: 'x' })).toEqual({
      error: 'No connector_* table',
    })
  })

  it('deletes a data source', async () => {
    const { adminDeleteDataSourceAction } = await import('@/lib/admin-actions')
    expect(await adminDeleteDataSourceAction(3)).toEqual({})
    expect(api.adminDeleteDataSource).toHaveBeenCalledWith(3, 'token')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminAddDataSourceAction, adminDeleteDataSourceAction } =
      await import('@/lib/admin-actions')
    expect(await adminAddDataSourceAction({ name: 'A', url: 'x' })).toEqual({
      error: en.errors.notAuthenticated,
    })
    expect(await adminDeleteDataSourceAction(1)).toEqual({
      error: en.errors.notAuthenticated,
    })
  })
})

describe('pending sign-up actions', () => {
  it('lists pending sign-ups, empty array when unauthenticated', async () => {
    api.adminListPendingUsers.mockResolvedValue([{ id: 'p-1', method: 'password' }])
    const { adminListPendingUsersAction } = await import('@/lib/admin-actions')
    expect(await adminListPendingUsersAction()).toEqual([{ id: 'p-1', method: 'password' }])

    getAdminToken.mockResolvedValue(null)
    expect(await adminListPendingUsersAction()).toEqual([])
  })

  it('swallows a listing failure and returns an empty array', async () => {
    api.adminListPendingUsers.mockRejectedValue(new Error('boom'))
    const { adminListPendingUsersAction } = await import('@/lib/admin-actions')
    expect(await adminListPendingUsersAction()).toEqual([])
  })

  for (const name of ['adminApprovePendingUserAction', 'adminRejectPendingUserAction'] as const) {
    const apiFn =
      name === 'adminApprovePendingUserAction'
        ? ('adminApprovePendingUser' as const)
        : ('adminRejectPendingUser' as const)

    describe(name, () => {
      it('calls the API and revalidates the users page', async () => {
        const mod = await import('@/lib/admin-actions')
        expect(await mod[name]('p-1')).toEqual({})
        expect(api[apiFn]).toHaveBeenCalledWith('p-1', 'token')
        expect(revalidatePath).toHaveBeenCalledWith('/admin/users')
      })

      it('returns an error when unauthenticated', async () => {
        getAdminToken.mockResolvedValue(null)
        const mod = await import('@/lib/admin-actions')
        expect(await mod[name]('p-1')).toEqual({ error: en.errors.notAuthenticated })
        expect(api[apiFn]).not.toHaveBeenCalled()
      })

      it('returns the API error message on failure', async () => {
        api[apiFn].mockRejectedValue(new Error('nope'))
        const mod = await import('@/lib/admin-actions')
        expect(await mod[name]('p-1')).toEqual({ error: 'nope' })
      })
    })
  }
})

describe('provider approval actions', () => {
  it('lists providers, empty array when unauthenticated', async () => {
    api.adminListProviders.mockResolvedValue([{ name: 'rss' }])
    const { adminListProvidersAction } = await import('@/lib/admin-actions')
    expect(await adminListProvidersAction()).toEqual([{ name: 'rss' }])

    getAdminToken.mockResolvedValue(null)
    expect(await adminListProvidersAction()).toEqual([])
  })

  it('sets the approval mode and revalidates the providers page', async () => {
    const { adminSetProviderApprovalAction } = await import('@/lib/admin-actions')
    expect(await adminSetProviderApprovalAction('rss', 'manual')).toEqual({})
    expect(api.adminSetProviderApproval).toHaveBeenCalledWith('rss', 'manual', 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/providers')
  })

  it('returns the API error message on failure', async () => {
    api.adminSetProviderApproval.mockRejectedValue(new Error('nope'))
    const { adminSetProviderApprovalAction } = await import('@/lib/admin-actions')
    expect(await adminSetProviderApprovalAction('rss', 'auto')).toEqual({ error: 'nope' })
  })
})

describe('admin account actions (super-admin only)', () => {
  const cases = [
    {
      name: 'adminCreateAdminAction',
      call: (m: Record<string, (...a: unknown[]) => unknown>) =>
        m.adminCreateAdminAction({ email: 'a@b.c', name: 'A', password: 'longenough1' }),
      apiFn: 'adminCreateAdmin' as const,
      revalidates: '/admin/admins',
    },
    {
      name: 'adminUpdateAdminAction',
      call: (m: Record<string, (...a: unknown[]) => unknown>) =>
        m.adminUpdateAdminAction('id1', { name: 'A' }),
      apiFn: 'adminUpdateAdmin' as const,
      revalidates: '/admin/admins',
    },
    {
      name: 'adminDeleteAdminAction',
      call: (m: Record<string, (...a: unknown[]) => unknown>) => m.adminDeleteAdminAction('id1'),
      apiFn: 'adminDeleteAdmin' as const,
      revalidates: '/admin/admins',
    },
    {
      name: 'adminChangeOwnPasswordAction',
      call: (m: Record<string, (...a: unknown[]) => unknown>) =>
        m.adminChangeOwnPasswordAction({ currentPassword: 'old', password: 'longenough1' }),
      apiFn: 'adminChangeOwnPassword' as const,
      revalidates: null,
    },
  ]

  for (const c of cases) {
    describe(c.name, () => {
      it('calls the API and returns an empty result', async () => {
        const mod = await import('@/lib/admin-actions')
        expect(await c.call(mod as never)).toEqual({})
        expect(api[c.apiFn]).toHaveBeenCalled()
        if (c.revalidates) expect(revalidatePath).toHaveBeenCalledWith(c.revalidates)
      })

      it('returns an error when unauthenticated', async () => {
        getAdminToken.mockResolvedValue(null)
        const mod = await import('@/lib/admin-actions')
        expect(await c.call(mod as never)).toEqual({ error: en.errors.notAuthenticated })
        expect(api[c.apiFn]).not.toHaveBeenCalled()
      })

      it('returns the API error message on failure', async () => {
        api[c.apiFn].mockRejectedValue(new Error('denied'))
        const mod = await import('@/lib/admin-actions')
        expect(await c.call(mod as never)).toEqual({ error: 'denied' })
      })
    })
  }
})

describe('documentation actions', () => {
  it('are no longer exported', async () => {
    const mod = await import('@/lib/admin-actions')
    expect(Object.keys(mod).filter((k) => /Doc/i.test(k))).toEqual([])
  })
})
