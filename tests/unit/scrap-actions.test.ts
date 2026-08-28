import { describe, it, expect, vi, beforeEach } from 'vitest'
import { en } from '@/lib/translations'

// Les messages d'erreur passent par getServerTranslations(), qui lit le cookie de
// langue : sans ce mock, `cookies()` sort du scope de requête et lève.
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: vi.fn() }),
}))

const getToken = vi.fn()
vi.mock('@/lib/session', () => ({ getToken: () => getToken() }))

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePath(p) }))

const subscribeFlux = vi.fn()
const unsubscribeFlux = vi.fn()
vi.mock('@/lib/api-client', () => ({
  subscribeFlux: (...args: unknown[]) => subscribeFlux(...args),
  unsubscribeFlux: (...args: unknown[]) => unsubscribeFlux(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
  getToken.mockResolvedValue('token')
  subscribeFlux.mockResolvedValue(undefined)
  unsubscribeFlux.mockResolvedValue(undefined)
})

describe('subscribeScrapAction', () => {
  it('subscribes and revalidates /scrap and /feed', async () => {
    const { subscribeScrapAction } = await import('@/lib/scrap-actions')
    expect(await subscribeScrapAction(7)).toEqual({})
    expect(subscribeFlux).toHaveBeenCalledWith('scrap', 7, 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/scrap')
    expect(revalidatePath).toHaveBeenCalledWith('/feed')
  })

  it('returns an error when unauthenticated', async () => {
    getToken.mockResolvedValue(null)
    const { subscribeScrapAction } = await import('@/lib/scrap-actions')
    expect(await subscribeScrapAction(7)).toEqual({ error: en.errors.notAuthenticated })
    expect(subscribeFlux).not.toHaveBeenCalled()
  })

  it('returns the API error message on failure', async () => {
    subscribeFlux.mockRejectedValue(new Error('boom'))
    const { subscribeScrapAction } = await import('@/lib/scrap-actions')
    expect(await subscribeScrapAction(7)).toEqual({ error: 'boom' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('unsubscribeScrapAction', () => {
  it('unsubscribes and revalidates /scrap and /feed', async () => {
    const { unsubscribeScrapAction } = await import('@/lib/scrap-actions')
    expect(await unsubscribeScrapAction(9)).toEqual({})
    expect(unsubscribeFlux).toHaveBeenCalledWith('scrap', 9, 'token')
    expect(revalidatePath).toHaveBeenCalledWith('/scrap')
    expect(revalidatePath).toHaveBeenCalledWith('/feed')
  })

  it('returns an error when unauthenticated', async () => {
    getToken.mockResolvedValue(null)
    const { unsubscribeScrapAction } = await import('@/lib/scrap-actions')
    expect(await unsubscribeScrapAction(9)).toEqual({ error: en.errors.notAuthenticated })
    expect(unsubscribeFlux).not.toHaveBeenCalled()
  })

  it('returns the API error message on failure', async () => {
    unsubscribeFlux.mockRejectedValue(new Error('nope'))
    const { unsubscribeScrapAction } = await import('@/lib/scrap-actions')
    expect(await unsubscribeScrapAction(9)).toEqual({ error: 'nope' })
  })
})
