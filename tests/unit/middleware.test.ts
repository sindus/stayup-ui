import { describe, it, expect, vi, beforeEach } from 'vitest'
import { middleware, config } from '@/middleware'

const next = vi.fn(() => ({ type: 'next' }))
const redirectTo = vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() }))

vi.mock('next/server', () => ({
  NextResponse: {
    next: () => next(),
    redirect: (url: URL) => redirectTo(url),
  },
}))

/** Minimal NextRequest stand-in: only cookies and nextUrl are read. */
function makeRequest(pathname: string, token?: string) {
  return {
    cookies: {
      get: (name: string) => (token && name === 'stayup_token' ? { value: token } : undefined),
    },
    nextUrl: { pathname },
    url: `https://app.test${pathname}`,
  } as unknown as Parameters<typeof middleware>[0]
}

/** Unsigned JWT-shaped token carrying the given role. */
function tokenWithRole(role: string) {
  const body = Buffer.from(JSON.stringify({ sub: 'u1', role })).toString('base64url')
  return `header.${body}.sig`
}

/** The path a redirect response points at. */
function redirectPath() {
  return new URL(redirectTo.mock.calls[0][0].toString()).pathname
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('admin routes', () => {
  it('redirects an anonymous visitor to the admin login', () => {
    middleware(makeRequest('/admin/users'))
    expect(redirectPath()).toBe('/admin/login')
  })

  it('lets an admin through', () => {
    middleware(makeRequest('/admin/users', tokenWithRole('admin')))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('sends a non-admin user to the feed', () => {
    middleware(makeRequest('/admin/users', tokenWithRole('user')))
    expect(redirectPath()).toBe('/feed')
  })

  it('shows the admin login page to an anonymous visitor', () => {
    middleware(makeRequest('/admin/login'))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('redirects an already authenticated admin away from the login page', () => {
    middleware(makeRequest('/admin/login', tokenWithRole('admin')))
    expect(redirectPath()).toBe('/admin')
  })

  it('keeps a non-admin on the admin login page', () => {
    middleware(makeRequest('/admin/login', tokenWithRole('user')))
    expect(next).toHaveBeenCalled()
  })

  it('treats an undecodable token as non-admin', () => {
    middleware(makeRequest('/admin/users', 'garbage'))
    expect(redirectPath()).toBe('/feed')
  })
})

describe('protected routes', () => {
  it.each(['/feed', '/profile'])('redirects anonymous visitors from %s to /login', (path) => {
    middleware(makeRequest(path))
    expect(redirectPath()).toBe('/login')
  })

  it('lets an authenticated user reach the feed', () => {
    middleware(makeRequest('/feed', tokenWithRole('user')))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('protects nested paths too', () => {
    middleware(makeRequest('/feed/flux/12'))
    expect(redirectPath()).toBe('/login')
  })
})

describe('auth pages', () => {
  it.each(['/login', '/register'])('redirects a signed-in user from %s to /feed', (path) => {
    middleware(makeRequest(path, tokenWithRole('user')))
    expect(redirectPath()).toBe('/feed')
  })

  it.each(['/login', '/register'])('shows %s to anonymous visitors', (path) => {
    middleware(makeRequest(path))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })
})

describe('public routes', () => {
  it('lets anyone reach the landing page', () => {
    middleware(makeRequest('/'))
    expect(next).toHaveBeenCalled()
  })

  it('does not guard /scrap in the middleware', () => {
    middleware(makeRequest('/scrap'))
    expect(next).toHaveBeenCalled()
  })

  it('no longer guards /documentation', () => {
    middleware(makeRequest('/documentation'))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })
})

describe('config', () => {
  it('skips api, static assets and the favicon', () => {
    expect(config.matcher).toEqual(['/((?!api|_next/static|_next/image|favicon.ico).*)'])
  })
})
