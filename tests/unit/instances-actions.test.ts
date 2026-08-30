import { describe, it, expect, vi, beforeEach } from 'vitest'
import { en } from '@/lib/translations'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`)
})
vi.mock('next/navigation', () => ({ redirect: (u: string) => redirect(u) }))

vi.mock('@/lib/serverLang', () => ({ getServerTranslations: async () => en }))

const { fetchAuthConfig, store } = vi.hoisted(() => ({
  fetchAuthConfig: vi.fn(),
  store: {
    readInstances: vi.fn(),
    addInstanceEntry: vi.fn(),
    removeInstanceEntry: vi.fn(),
    renameInstanceEntry: vi.fn(),
    setPrimaryInstanceEntry: vi.fn(),
    updateInstanceTokenEntry: vi.fn(),
    hostOf: (u: string) => {
      try {
        return new URL(u).host
      } catch {
        return u
      }
    },
  },
}))
vi.mock('@/lib/api-client', () => ({ fetchAuthConfig }))
vi.mock('@/lib/instances', () => store)

import {
  addInstanceAction,
  probeInstanceAction,
  reconnectInstanceAction,
  removeInstanceAction,
  renameInstanceAction,
  setPrimaryInstanceAction,
} from '@/lib/instances-actions'

beforeEach(() => {
  vi.clearAllMocks()
  store.readInstances.mockResolvedValue([])
  fetchAuthConfig.mockResolvedValue({ name: 'Beta' })
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ token: 'tok-b' }) })
})

describe('probeInstanceAction', () => {
  it('rejects a private / unreachable address', async () => {
    expect(await probeInstanceAction('http://169.254.169.254')).toEqual({
      error: en.errors.privateApiUrl,
    })
  })

  it('rejects a non-URL', async () => {
    expect(await probeInstanceAction('not-a-url')).toEqual({ error: en.errors.privateApiUrl })
  })

  it('returns the resolved display name', async () => {
    expect(await probeInstanceAction('https://b.example.com')).toEqual({ name: 'Beta' })
  })

  it('falls back to the host when the API exposes no name', async () => {
    fetchAuthConfig.mockResolvedValue(null)
    expect(await probeInstanceAction('https://b.example.com')).toEqual({ name: 'b.example.com' })
  })
})

describe('addInstanceAction', () => {
  it('logs in and stores the instance', async () => {
    expect(await addInstanceAction('https://b.example.com/', 'u@b.io', 'pw')).toEqual({})
    expect(mockFetch).toHaveBeenCalledWith(
      'https://b.example.com/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(store.addInstanceEntry).toHaveBeenCalledWith({
      url: 'https://b.example.com',
      name: 'Beta',
      token: 'tok-b',
    })
  })

  it('rejects an address already in the list', async () => {
    store.readInstances.mockResolvedValue([{ url: 'https://b.example.com' }])
    expect(await addInstanceAction('https://b.example.com', 'u@b.io', 'pw')).toEqual({
      error: en.instances.alreadyAdded,
    })
    expect(store.addInstanceEntry).not.toHaveBeenCalled()
  })

  it('returns invalid-credentials when the login fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) })
    expect(await addInstanceAction('https://b.example.com', 'u@b.io', 'bad')).toEqual({
      error: en.errors.invalidCredentials,
    })
  })

  it('returns invalid-credentials when the login request throws', async () => {
    mockFetch.mockRejectedValue(new Error('offline'))
    expect(await addInstanceAction('https://b.example.com', 'u@b.io', 'pw')).toEqual({
      error: en.errors.invalidCredentials,
    })
  })

  it('rejects a private address', async () => {
    expect(await addInstanceAction('http://10.0.0.1', 'u@b.io', 'pw')).toEqual({
      error: en.errors.privateApiUrl,
    })
  })
})

describe('reconnectInstanceAction', () => {
  it('refreshes the token of the matching instance', async () => {
    store.readInstances.mockResolvedValue([{ id: 'i1', url: 'https://b.example.com' }])
    expect(await reconnectInstanceAction('i1', 'u@b.io', 'pw')).toEqual({})
    expect(store.updateInstanceTokenEntry).toHaveBeenCalledWith('i1', 'tok-b')
  })

  it('errors when the instance id is unknown', async () => {
    store.readInstances.mockResolvedValue([])
    expect(await reconnectInstanceAction('gone', 'u@b.io', 'pw')).toEqual({
      error: en.errors.generic,
    })
  })

  it('surfaces a failed login', async () => {
    store.readInstances.mockResolvedValue([{ id: 'i1', url: 'https://b.example.com' }])
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) })
    expect(await reconnectInstanceAction('i1', 'u@b.io', 'bad')).toEqual({
      error: en.errors.invalidCredentials,
    })
  })
})

describe('the thin mutation actions', () => {
  it('renameInstanceAction trims and forwards a non-empty name', async () => {
    await renameInstanceAction('i1', '  Beta  ')
    expect(store.renameInstanceEntry).toHaveBeenCalledWith('i1', 'Beta')
  })

  it('renameInstanceAction ignores a blank name', async () => {
    await renameInstanceAction('i1', '   ')
    expect(store.renameInstanceEntry).not.toHaveBeenCalled()
  })

  it('setPrimaryInstanceAction forwards the id', async () => {
    await setPrimaryInstanceAction('i2')
    expect(store.setPrimaryInstanceEntry).toHaveBeenCalledWith('i2')
  })

  it('removeInstanceAction redirects home when the primary is removed', async () => {
    store.removeInstanceEntry.mockResolvedValue('cleared')
    await expect(removeInstanceAction('i1')).rejects.toThrow('NEXT_REDIRECT:/')
  })

  it('removeInstanceAction stays put when a secondary is removed', async () => {
    store.removeInstanceEntry.mockResolvedValue('removed')
    await expect(removeInstanceAction('i2')).resolves.toBeUndefined()
    expect(redirect).not.toHaveBeenCalled()
  })
})
