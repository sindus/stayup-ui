/**
 * @vitest-environment node
 *
 * Integration tests for the /api/fluxes routes.
 * Requires a running PostgreSQL instance (DATABASE_URL env var).
 * Run via: docker compose run --rm app npm run test:integration
 */
import { describe, it, expect, vi } from 'vitest'

// Mock better-auth session for integration tests
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
        session: { id: 'test-session-id' },
      }),
    },
  },
}))

describe('POST /api/fluxes (validation flow)', () => {
  it('rejects missing provider', async () => {
    const { POST } = await import('@/app/api/fluxes/route')

    const request = new Request('http://localhost/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'facebook/react', label: 'React' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects invalid provider value', async () => {
    const { POST } = await import('@/app/api/fluxes/route')

    const request = new Request('http://localhost/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'invalid', identifier: 'test', label: 'Test' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
