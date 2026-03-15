/**
 * @vitest-environment node
 *
 * Integration tests for the /api/fluxes route handlers.
 * Mocks the Next.js request context (headers, auth) to test validation logic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers before any imports that use it
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

// Mock better-auth session
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

// Mock DB to avoid real DB calls in validation tests
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}))

// Mock stayup-api client validation
vi.mock('@/lib/api-client', () => ({
  validateFlux: vi.fn().mockResolvedValue({ valid: true }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/fluxes — input validation', () => {
  it('rejects request with missing provider field', async () => {
    const { POST } = await import('@/app/api/fluxes/route')

    const request = new Request('http://localhost/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'facebook/react', label: 'React' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('rejects request with invalid provider value', async () => {
    const { POST } = await import('@/app/api/fluxes/route')

    const request = new Request('http://localhost/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'invalid', identifier: 'test', label: 'Test' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects request with empty identifier', async () => {
    const { POST } = await import('@/app/api/fluxes/route')

    const request = new Request('http://localhost/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'changelog', identifier: '', label: 'React' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})

describe('DELETE /api/fluxes/[id]', () => {
  it('returns 401 when session is missing', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

    const { DELETE } = await import('@/app/api/fluxes/[id]/route')

    const request = new Request('http://localhost/api/fluxes/some-id', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'some-id' }) })

    expect(response.status).toBe(401)
  })
})
