import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const TEST_TOKEN = 'header.eyJzdWIiOiIxIn0.sig'

beforeEach(() => {
  vi.resetModules()
  mockFetch.mockReset()
})

describe('getChangelogItems', () => {
  it('returns data array on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        connector: 'changelog',
        data: [{ id: 1, provider_id: 1, content: 'fix: bug', version: 'v1.0.0' }],
      }),
    })

    const { getChangelogItems } = await import('@/lib/api-client')
    const result = await getChangelogItems(TEST_TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0].version).toBe('v1.0.0')
  })

  it('returns empty array when data fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })

    const { getChangelogItems } = await import('@/lib/api-client')
    const result = await getChangelogItems(TEST_TOKEN)
    expect(result).toEqual([])
  })
})

describe('getYoutubeItems', () => {
  it('returns youtube items on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        connector: 'youtube',
        data: [
          {
            id: 1,
            provider_id: 1,
            version: 'abc123',
            content: '{"title":"Test","thumbnail":"","url":""}',
          },
        ],
      }),
    })

    const { getYoutubeItems } = await import('@/lib/api-client')
    const result = await getYoutubeItems(TEST_TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0].version).toBe('abc123')
  })

  it('returns empty array on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { getYoutubeItems } = await import('@/lib/api-client')
    const result = await getYoutubeItems(TEST_TOKEN)
    expect(result).toEqual([])
  })
})

describe('getRssItems', () => {
  it('returns rss items on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        connector: 'rss',
        data: [
          {
            id: 1,
            repository_id: 1,
            content: '{"title":"RSS Post"}',
            datetime: null,
            executed_at: '2024-01-01',
            success: true,
          },
        ],
      }),
    })
    const { getRssItems } = await import('@/lib/api-client')
    const result = await getRssItems(TEST_TOKEN)
    expect(result).toHaveLength(1)
  })

  it('returns empty array on failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'))
    const { getRssItems } = await import('@/lib/api-client')
    expect(await getRssItems(TEST_TOKEN)).toEqual([])
  })
})

describe('getScrapItems', () => {
  it('returns scrap items on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        connector: 'scrap',
        data: [
          {
            id: 1,
            repository_id: 1,
            content: 'scraped text',
            params: {},
            executed_at: '2024-01-01',
            success: true,
          },
        ],
      }),
    })
    const { getScrapItems } = await import('@/lib/api-client')
    const result = await getScrapItems(TEST_TOKEN)
    expect(result).toHaveLength(1)
  })

  it('returns empty array on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
    const { getScrapItems } = await import('@/lib/api-client')
    expect(await getScrapItems(TEST_TOKEN)).toEqual([])
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

  it('returns valid:false for unknown provider', async () => {
    const { validateFlux } = await import('@/lib/api-client')
    const result = await validateFlux('unknown', 'test')
    expect(result.valid).toBe(false)
  })
})
