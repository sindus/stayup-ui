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

  // Le serveur appellera vraiment cette URL, avec le token du visiteur en en-tête :
  // sans garde, c'est une primitive SSRF vers le réseau interne de l'hébergeur.
  it('rejects a non-http scheme', async () => {
    const { setApiUrlAction } = await import('@/lib/settings-actions')
    for (const url of ['file:///etc/passwd', 'ftp://example.com', 'gopher://x']) {
      expect(await setApiUrlAction(url)).toEqual({ error: 'invalid' })
    }
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('rejects addresses that only the server can reach', async () => {
    const { setApiUrlAction } = await import('@/lib/settings-actions')
    for (const url of [
      'http://localhost:3000',
      'http://127.0.0.1',
      'http://10.0.0.5',
      'http://192.168.1.4',
      'http://172.16.0.9',
      'http://169.254.169.254/latest/meta-data',
      'http://0.0.0.0',
    ]) {
      expect(await setApiUrlAction(url)).toEqual({ error: 'private' })
    }
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('still accepts a public host', async () => {
    const { setApiUrlAction } = await import('@/lib/settings-actions')
    expect(await setApiUrlAction('https://stayup-api.r-sik.workers.dev')).toEqual({})
    expect(cookieSet).toHaveBeenCalled()
  })
})

describe('resetApiUrlAction', () => {
  it('deletes the override cookie', async () => {
    const { resetApiUrlAction } = await import('@/lib/settings-actions')
    await resetApiUrlAction()
    expect(cookieDelete).toHaveBeenCalledWith('stayup_api_url')
  })
})
