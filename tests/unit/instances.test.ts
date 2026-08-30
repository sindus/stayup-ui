import { describe, it, expect, vi, beforeEach } from 'vitest'

/** In-memory cookie jar mirroring the subset of `next/headers` cookies() used. */
const jar = new Map<string, string>()
const cookieMock = {
  get: (name: string) => (jar.has(name) ? { value: jar.get(name)! } : undefined),
  set: (name: string, value: string) => {
    jar.set(name, value)
  },
  delete: (name: string) => {
    jar.delete(name)
  },
}
vi.mock('next/headers', () => ({ cookies: async () => cookieMock }))

function makeToken(expOffset = 3600) {
  const body = Buffer.from(
    JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + expOffset }),
  ).toString('base64url')
  return `h.${body}.s`
}

const T = makeToken()

async function mod() {
  return import('@/lib/instances')
}

beforeEach(() => {
  jar.clear()
  vi.clearAllMocks()
})

describe('readInstances', () => {
  it('returns an empty list when nothing is stored', async () => {
    const { readInstances } = await mod()
    expect(await readInstances()).toEqual([])
  })

  it('parses the single-cookie form', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([{ id: 'a', url: 'https://a.dev', name: 'A', token: T }]),
    )
    const { readInstances } = await mod()
    expect(await readInstances()).toEqual([{ id: 'a', url: 'https://a.dev', name: 'A', token: T }])
  })

  it('reassembles a chunked cookie', async () => {
    const list = [{ id: 'a', url: 'https://a.dev', name: 'A', token: T }]
    const json = JSON.stringify(list)
    jar.set('stayup_instances_0', json.slice(0, 10))
    jar.set('stayup_instances_1', json.slice(10))
    const { readInstances } = await mod()
    expect(await readInstances()).toEqual(list)
  })

  it('ignores a malformed cookie and falls back to legacy', async () => {
    jar.set('stayup_instances', 'not json')
    jar.set('stayup_token', T)
    jar.set('stayup_api_url', 'https://legacy.dev/')
    const { readInstances } = await mod()
    expect(await readInstances()).toEqual([
      { id: 'primary', url: 'https://legacy.dev', name: 'legacy.dev', token: T },
    ])
  })

  it('rejects a cookie whose entries are the wrong shape', async () => {
    jar.set('stayup_instances', JSON.stringify([{ id: 'a' }]))
    const { readInstances } = await mod()
    expect(await readInstances()).toEqual([])
  })

  it('migrates a legacy session with no api-url cookie to the default', async () => {
    jar.set('stayup_token', T)
    const { readInstances } = await mod()
    const list = await readInstances()
    expect(list).toHaveLength(1)
    expect(list[0].token).toBe(T)
    expect(list[0].id).toBe('primary')
  })
})

describe('resolveInstance', () => {
  beforeEach(() => {
    jar.set(
      'stayup_instances',
      JSON.stringify([
        { id: 'a', url: 'https://a.dev', name: 'A', token: T },
        { id: 'b', url: 'https://b.dev', name: 'B', token: T },
      ]),
    )
  })

  it('returns the primary when no id is given', async () => {
    const { resolveInstance } = await mod()
    expect((await resolveInstance(null))?.id).toBe('a')
  })

  it('returns the instance matching the id', async () => {
    const { resolveInstance } = await mod()
    expect((await resolveInstance('b'))?.id).toBe('b')
  })

  it('returns null for an unknown id', async () => {
    const { resolveInstance } = await mod()
    expect(await resolveInstance('zzz')).toBeNull()
  })
})

describe('mutations', () => {
  it('upsertPrimaryInstance creates the primary from a fresh login', async () => {
    const { upsertPrimaryInstance, readInstances } = await mod()
    await upsertPrimaryInstance('https://api.dev/', T)
    const list = await readInstances()
    expect(list).toEqual([{ id: 'primary', url: 'https://api.dev', name: 'api.dev', token: T }])
  })

  it('upsertPrimaryInstance drops the legacy cookies it replaces', async () => {
    jar.set('stayup_token', 'old')
    jar.set('stayup_api_url', 'https://old.dev')
    const { upsertPrimaryInstance } = await mod()
    await upsertPrimaryInstance('https://old.dev', T)
    expect(jar.has('stayup_token')).toBe(false)
    expect(jar.has('stayup_api_url')).toBe(false)
    expect(jar.has('stayup_instances')).toBe(true)
  })

  it('upsertPrimaryInstance keeps existing secondaries and the primary name', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([
        { id: 'p', url: 'https://api.dev', name: 'Home', token: 'stale' },
        { id: 's', url: 'https://b.dev', name: 'B', token: T },
      ]),
    )
    const { upsertPrimaryInstance, readInstances } = await mod()
    await upsertPrimaryInstance('https://api.dev', 'fresh')
    const list = await readInstances()
    expect(list[0]).toEqual({ id: 'p', url: 'https://api.dev', name: 'Home', token: 'fresh' })
    expect(list[1].id).toBe('s')
  })

  it('addInstanceEntry appends with a generated id', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([{ id: 'p', url: 'https://a.dev', name: 'A', token: T }]),
    )
    const { addInstanceEntry, readInstances } = await mod()
    await addInstanceEntry({ url: 'https://b.dev', name: 'B', token: T })
    const list = await readInstances()
    expect(list).toHaveLength(2)
    expect(list[1]).toMatchObject({ url: 'https://b.dev', name: 'B' })
    expect(list[1].id).not.toBe('')
  })

  it('removeInstanceEntry drops a secondary', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([
        { id: 'p', url: 'https://a.dev', name: 'A', token: T },
        { id: 's', url: 'https://b.dev', name: 'B', token: T },
      ]),
    )
    const { removeInstanceEntry, readInstances } = await mod()
    expect(await removeInstanceEntry('s')).toBe('removed')
    expect(await readInstances()).toHaveLength(1)
  })

  it('removeInstanceEntry on the primary clears everything', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([{ id: 'p', url: 'https://a.dev', name: 'A', token: T }]),
    )
    const { removeInstanceEntry, readInstances } = await mod()
    expect(await removeInstanceEntry('p')).toBe('cleared')
    expect(await readInstances()).toEqual([])
  })

  it('renameInstanceEntry renames only the matching entry', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([
        { id: 'p', url: 'https://a.dev', name: 'A', token: T },
        { id: 's', url: 'https://b.dev', name: 'B', token: T },
      ]),
    )
    const { renameInstanceEntry, readInstances } = await mod()
    await renameInstanceEntry('s', 'Beta')
    const list = await readInstances()
    expect(list.map((i) => i.name)).toEqual(['A', 'Beta'])
  })

  it('setPrimaryInstanceEntry moves the target to the front', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([
        { id: 'p', url: 'https://a.dev', name: 'A', token: T },
        { id: 's', url: 'https://b.dev', name: 'B', token: T },
      ]),
    )
    const { setPrimaryInstanceEntry, readInstances } = await mod()
    await setPrimaryInstanceEntry('s')
    expect((await readInstances()).map((i) => i.id)).toEqual(['s', 'p'])
  })

  it('setPrimaryInstanceEntry is a no-op for an unknown id', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([{ id: 'p', url: 'https://a.dev', name: 'A', token: T }]),
    )
    const { setPrimaryInstanceEntry, readInstances } = await mod()
    await setPrimaryInstanceEntry('nope')
    expect((await readInstances()).map((i) => i.id)).toEqual(['p'])
  })

  it('updateInstanceTokenEntry swaps the token', async () => {
    jar.set(
      'stayup_instances',
      JSON.stringify([{ id: 'p', url: 'https://a.dev', name: 'A', token: 'stale' }]),
    )
    const { updateInstanceTokenEntry, readInstances } = await mod()
    await updateInstanceTokenEntry('p', 'fresh')
    expect((await readInstances())[0].token).toBe('fresh')
  })

  it('writeInstances chunks a payload larger than the cookie limit', async () => {
    const big = 'x'.repeat(5000)
    const { writeInstances } = await mod()
    await writeInstances([{ id: 'p', url: 'https://a.dev', name: big, token: T }])
    expect(jar.has('stayup_instances')).toBe(false)
    expect(jar.has('stayup_instances_0')).toBe(true)
    expect(jar.has('stayup_instances_1')).toBe(true)
  })

  it('writeInstances clears leftover chunks when the payload shrinks', async () => {
    jar.set('stayup_instances_0', 'stale')
    jar.set('stayup_instances_1', 'stale')
    const { writeInstances, readInstances } = await mod()
    await writeInstances([{ id: 'p', url: 'https://a.dev', name: 'A', token: T }])
    expect(jar.has('stayup_instances_0')).toBe(false)
    expect(await readInstances()).toHaveLength(1)
  })

  it('clearInstances removes every cookie form', async () => {
    jar.set('stayup_instances', '[]')
    jar.set('stayup_instances_0', 'x')
    jar.set('stayup_token', T)
    jar.set('stayup_api_url', 'https://a.dev')
    const { clearInstances } = await mod()
    await clearInstances()
    expect([...jar.keys()]).toEqual([])
  })

  it('hostOf falls back to the raw string for a non-URL', async () => {
    const { hostOf } = await mod()
    expect(hostOf('https://a.dev/x')).toBe('a.dev')
    expect(hostOf('garbage')).toBe('garbage')
  })

  it('newInstanceId produces distinct ids', async () => {
    const { newInstanceId } = await mod()
    expect(newInstanceId()).not.toBe(newInstanceId())
  })
})
