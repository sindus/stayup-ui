import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const getAdminToken = vi.fn()
vi.mock('@/lib/session', () => ({ getAdminToken: () => getAdminToken() }))

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePath(p) }))

const api = {
  adminClearRepositoryData: vi.fn(),
  adminCreateRepository: vi.fn(),
  adminDeleteRepository: vi.fn(),
  adminDeleteUser: vi.fn(),
  adminListScrapRequests: vi.fn(),
  adminApproveScrapRequest: vi.fn(),
  adminRejectScrapRequest: vi.fn(),
  deleteUserRepository: vi.fn(),
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
    expect(await adminDeleteUserAction('u1')).toEqual({ error: 'Non authentifié' })
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
      error: 'Non authentifié',
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('surfaces the API error message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Email pris' }) })

    const { adminUpdateUserAction } = await import('@/lib/admin-actions')
    expect(await adminUpdateUserAction('u1', { email: 'x@y.z' })).toEqual({ error: 'Email pris' })
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
      error: 'Erreur lors de la mise à jour',
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
    expect(await adminDeleteUserFluxAction('u1', 'link1')).toEqual({ error: 'Non authentifié' })
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
    expect(await adminDeleteRepositoryAction(3)).toEqual({ error: 'Non authentifié' })
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
    expect(await adminClearRepositoryDataAction(4)).toEqual({ error: 'Non authentifié' })
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
    expect(await adminCreateRepositoryAction(payload)).toEqual({ error: 'Non authentifié' })
  })

  it('returns the API error message on failure', async () => {
    api.adminCreateRepository.mockRejectedValue(new Error('duplicate'))
    const { adminCreateRepositoryAction } = await import('@/lib/admin-actions')
    expect(await adminCreateRepositoryAction(payload)).toEqual({ error: 'duplicate' })
  })
})

describe('adminListScrapRequestsAction', () => {
  it('returns the requests', async () => {
    const requests = [{ id: 'r1', url: 'https://a.b' }]
    api.adminListScrapRequests.mockResolvedValue(requests)

    const { adminListScrapRequestsAction } = await import('@/lib/admin-actions')
    expect(await adminListScrapRequestsAction()).toEqual(requests)
  })

  it('returns an empty array when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminListScrapRequestsAction } = await import('@/lib/admin-actions')
    expect(await adminListScrapRequestsAction()).toEqual([])
    expect(api.adminListScrapRequests).not.toHaveBeenCalled()
  })

  it('swallows API failures and returns an empty array', async () => {
    api.adminListScrapRequests.mockRejectedValue(new Error('down'))
    const { adminListScrapRequestsAction } = await import('@/lib/admin-actions')
    expect(await adminListScrapRequestsAction()).toEqual([])
  })
})

describe('adminRejectScrapRequestAction', () => {
  it('rejects the request and revalidates the list', async () => {
    const { adminRejectScrapRequestAction } = await import('@/lib/admin-actions')
    expect(await adminRejectScrapRequestAction('r1')).toEqual({})
    expect(api.adminRejectScrapRequest).toHaveBeenCalledWith('r1', 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/scrap-requests')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminRejectScrapRequestAction } = await import('@/lib/admin-actions')
    expect(await adminRejectScrapRequestAction('r1')).toEqual({ error: 'Non authentifié' })
  })

  it('returns the API error message on failure', async () => {
    api.adminRejectScrapRequest.mockRejectedValue(new Error('already handled'))
    const { adminRejectScrapRequestAction } = await import('@/lib/admin-actions')
    expect(await adminRejectScrapRequestAction('r1')).toEqual({ error: 'already handled' })
  })
})

describe('adminApproveScrapRequestAction', () => {
  const payload = { url: 'https://example.com', config: {} }

  it('returns the new repository id and revalidates both pages', async () => {
    api.adminApproveScrapRequest.mockResolvedValue({ repository_id: 12 })

    const { adminApproveScrapRequestAction } = await import('@/lib/admin-actions')
    expect(await adminApproveScrapRequestAction('r1', payload)).toEqual({ repository_id: 12 })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/scrap-requests')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/repositories')
  })

  it('returns an error when unauthenticated', async () => {
    getAdminToken.mockResolvedValue(null)
    const { adminApproveScrapRequestAction } = await import('@/lib/admin-actions')
    expect(await adminApproveScrapRequestAction('r1', payload)).toEqual({
      error: 'Non authentifié',
    })
  })

  it('returns the API error message on failure', async () => {
    api.adminApproveScrapRequest.mockRejectedValue(new Error('bad config'))
    const { adminApproveScrapRequestAction } = await import('@/lib/admin-actions')
    expect(await adminApproveScrapRequestAction('r1', payload)).toEqual({ error: 'bad config' })
  })
})

describe('documentation actions', () => {
  it('are no longer exported', async () => {
    const mod = await import('@/lib/admin-actions')
    expect(Object.keys(mod).filter((k) => /Doc/i.test(k))).toEqual([])
  })
})
