import { describe, it, expect, vi, beforeEach } from 'vitest'

const cookieGet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: cookieGet }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('STAYUP_API_URL', 'https://default-api.example.com')
})

describe('getApiUrl', () => {
  it('falls back to STAYUP_API_URL when no cookie override is set', async () => {
    cookieGet.mockReturnValue(undefined)
    vi.resetModules()
    const { getApiUrl } = await import('@/lib/apiUrl')
    expect(await getApiUrl()).toBe('https://default-api.example.com')
  })

  it("prefers the visitor's cookie override when present", async () => {
    cookieGet.mockReturnValue({ value: 'https://custom-api.example.com/' })
    vi.resetModules()
    const { getApiUrl } = await import('@/lib/apiUrl')
    expect(await getApiUrl()).toBe('https://custom-api.example.com')
  })
})
