import { describe, it, expect, vi, beforeEach } from 'vitest'

const cookieSet = vi.fn()
const cookieDelete = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet, delete: cookieDelete }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('setApiUrlAction', () => {
  it('stores a trimmed URL in the cookie', async () => {
    const { setApiUrlAction } = await import('@/lib/settings-actions')
    expect(await setApiUrlAction('https://api.example.com/ ')).toEqual({})
    expect(cookieSet).toHaveBeenCalledWith(
      'stayup_api_url',
      'https://api.example.com',
      expect.objectContaining({ httpOnly: true }),
    )
  })

  it('rejects an invalid URL without touching the cookie', async () => {
    const { setApiUrlAction } = await import('@/lib/settings-actions')
    expect(await setApiUrlAction('not-a-url')).toEqual({ error: 'invalid' })
    expect(cookieSet).not.toHaveBeenCalled()
  })
})

describe('resetApiUrlAction', () => {
  it('deletes the override cookie', async () => {
    const { resetApiUrlAction } = await import('@/lib/settings-actions')
    await resetApiUrlAction()
    expect(cookieDelete).toHaveBeenCalledWith('stayup_api_url')
  })
})
