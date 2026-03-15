import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConnector, validateFlux } from '@/lib/api-client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getConnector', () => {
  it('returns data array on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ connector: 'changelog', data: [{ repository: 'facebook/react' }] }),
    })

    const result = await getConnector('changelog')
    expect(result).toEqual([{ repository: 'facebook/react' }])
  })

  it('returns null on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    })

    const result = await getConnector('unknown')
    expect(result).toBeNull()
  })

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await getConnector('changelog')
    expect(result).toBeNull()
  })
})

describe('validateFlux', () => {
  it('returns true when identifier matches a changelog repository', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        connector: 'changelog',
        data: [{ repository: 'facebook/react', version: 'v19.0.0' }],
      }),
    })

    const valid = await validateFlux('changelog', 'facebook/react')
    expect(valid).toBe(true)
  })

  it('returns false when identifier is not in the data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        connector: 'changelog',
        data: [{ repository: 'other/repo' }],
      }),
    })

    const valid = await validateFlux('changelog', 'facebook/react')
    expect(valid).toBe(false)
  })

  it('returns false when connector is not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    })

    const valid = await validateFlux('changelog', 'facebook/react')
    expect(valid).toBe(false)
  })

  it('returns true when youtube profile matches', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        connector: 'youtube',
        data: [{ profile: 'fireship', title: 'Cool video' }],
      }),
    })

    const valid = await validateFlux('youtube', 'fireship')
    expect(valid).toBe(true)
  })
})
