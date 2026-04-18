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
