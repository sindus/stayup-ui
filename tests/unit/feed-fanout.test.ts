import { describe, it, expect, vi, beforeEach } from 'vitest'

const readInstances = vi.fn()
vi.mock('@/lib/instances', () => ({ readInstances: () => readInstances() }))

const getCachedUserFeed = vi.fn()
const getCachedTemplates = vi.fn()
vi.mock('@/lib/feed-cache', () => ({
  getCachedUserFeed: (...a: unknown[]) => getCachedUserFeed(...a),
  getCachedTemplates: (...a: unknown[]) => getCachedTemplates(...a),
}))

vi.mock('@/lib/session', () => ({
  decodeToken: (t: string) => {
    if (t === 'bad') throw new Error('nope')
    return { userId: `user-${t}` }
  },
  isTokenExpired: (t: string) => t === 'expired',
}))

import { fanoutFeed, mergeTemplates, needsReconnect, toFeedRepositories } from '@/lib/feed-fanout'
import { ApiError } from '@/lib/api-client'

const inst = (id: string, token = id) => ({
  id,
  url: `https://${id}.dev`,
  name: id.toUpperCase(),
  token,
})

function feed(over: Record<string, unknown> = {}) {
  return {
    repositories: [
      {
        id: 'r1',
        repository_id: 1,
        provider: 'rss',
        url: 'https://x.dev',
        config: {},
        created_at: '',
      },
    ],
    connectors: { rss: [{ id: 10, repository_id: 1, executed_at: '' }] },
    ...over,
  }
}

const tpl = (name: string) => ({ [name]: { name, displayName: name, template: null } })

beforeEach(() => {
  vi.clearAllMocks()
  getCachedUserFeed.mockResolvedValue(feed())
  getCachedTemplates.mockResolvedValue(tpl('rss'))
})

describe('mergeTemplates', () => {
  it('keeps the first provider seen but fills a missing template later', () => {
    const into: Record<string, never> = {}
    mergeTemplates(into, { a: { name: 'a', displayName: 'a', template: null } } as never)
    mergeTemplates(into, { a: { name: 'a', displayName: 'a', template: { version: 1 } } } as never)
    expect((into as Record<string, { template: unknown }>).a.template).toEqual({ version: 1 })
  })
})

describe('needsReconnect', () => {
  it('keeps expired and auth, drops unreachable', () => {
    const out = needsReconnect([
      { instanceId: '1', instanceName: 'a', reason: 'expired' },
      { instanceId: '2', instanceName: 'b', reason: 'auth' },
      { instanceId: '3', instanceName: 'c', reason: 'unreachable' },
    ])
    expect(out.map((e) => e.instanceId)).toEqual(['1', '2'])
  })
})

describe('toFeedRepositories', () => {
  it('carries the instance id onto the FeedRepository', () => {
    const out = toFeedRepositories([
      {
        id: 'r',
        repository_id: 3,
        provider: 'rss',
        url: 'u',
        config: {},
        created_at: '',
        _instance_id: 'i7',
      } as never,
    ])
    expect(out[0]).toEqual({
      repository_id: 3,
      url: 'u',
      provider: 'rss',
      config: {},
      instanceId: 'i7',
    })
  })
})

describe('fanoutFeed', () => {
  it('tags rows with their instance and, with several instances, the name', async () => {
    readInstances.mockResolvedValue([inst('a'), inst('b')])
    const res = await fanoutFeed()

    expect(res.repositories).toHaveLength(2)
    expect(res.repositories.map((r) => r._instance_id).sort()).toEqual(['a', 'b'])
    expect(res.repositories[0]._instance_name).toBe('A')
    expect(res.connectors.rss).toHaveLength(2)
    expect(res.connectors.rss[0]._instance_name).toBeDefined()
    expect(res.instanceErrors).toEqual([])
  })

  it('omits the display name tag when there is a single instance', async () => {
    readInstances.mockResolvedValue([inst('a')])
    const res = await fanoutFeed()
    expect(res.repositories[0]._instance_id).toBe('a')
    expect(res.repositories[0]._instance_name).toBeUndefined()
    expect(res.connectors.rss[0]._instance_name).toBeUndefined()
  })

  it('records a soft error for an instance whose feed throws', async () => {
    readInstances.mockResolvedValue([inst('a'), inst('b')])
    getCachedUserFeed.mockImplementation((_u: string, _t: string, url: string) =>
      url === 'https://b.dev' ? Promise.reject(new Error('down')) : Promise.resolve(feed()),
    )
    const res = await fanoutFeed()

    expect(res.repositories).toHaveLength(1)
    expect(res.instanceErrors).toEqual([
      { instanceId: 'b', instanceName: 'B', reason: 'unreachable' },
    ])
  })

  it('marks an instance whose token cannot be decoded as needing reconnection', async () => {
    readInstances.mockResolvedValue([inst('a', 'bad')])
    const res = await fanoutFeed()
    expect(res.instanceErrors).toEqual([{ instanceId: 'a', instanceName: 'A', reason: 'auth' }])
    expect(res.repositories).toEqual([])
  })

  it('flags an expired token without fetching that instance', async () => {
    readInstances.mockResolvedValue([inst('a', 'expired')])
    const res = await fanoutFeed()
    expect(getCachedUserFeed).not.toHaveBeenCalled()
    expect(res.instanceErrors).toEqual([{ instanceId: 'a', instanceName: 'A', reason: 'expired' }])
  })

  it('classes a 401 as `auth` and any other failure as `unreachable`', async () => {
    readInstances.mockResolvedValue([inst('a'), inst('b')])
    getCachedUserFeed.mockImplementation((_u: string, _t: string, url: string) =>
      url === 'https://a.dev'
        ? Promise.reject(new ApiError(401, 'Unauthorized'))
        : Promise.reject(new Error('boom')),
    )
    const res = await fanoutFeed()
    expect(res.instanceErrors).toEqual([
      { instanceId: 'a', instanceName: 'A', reason: 'auth' },
      { instanceId: 'b', instanceName: 'B', reason: 'unreachable' },
    ])
  })

  it('also treats a 403 as `auth`', async () => {
    readInstances.mockResolvedValue([inst('a')])
    getCachedUserFeed.mockRejectedValue(new ApiError(403, 'Forbidden'))
    const res = await fanoutFeed()
    expect(res.instanceErrors[0].reason).toBe('auth')
  })

  it('passes each instance its own url and token', async () => {
    readInstances.mockResolvedValue([inst('a')])
    await fanoutFeed()
    expect(getCachedUserFeed).toHaveBeenCalledWith('user-a', 'a', 'https://a.dev')
    expect(getCachedTemplates).toHaveBeenCalledWith('a', 'https://a.dev')
  })
})
