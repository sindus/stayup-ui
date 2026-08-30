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
function makeRequest(
  pathname: string,
  cookies: { user?: string; admin?: string; jar?: Record<string, string> } = {},
) {
  const jar = cookies.jar ?? {}
  return {
    cookies: {
      get: (name: string) => {
        if (name === 'stayup_token' && cookies.user) return { value: cookies.user }
        if (name === 'stayup_admin_token' && cookies.admin) return { value: cookies.admin }
        if (name in jar) return { value: jar[name] }
        return undefined
      },
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

/** A token that is live (exp in the future) or dead (exp in the past). */
function tokenWithExp(offset: number) {
  const body = Buffer.from(
    JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + offset }),
  ).toString('base64url')
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
    middleware(makeRequest('/admin/users', { admin: tokenWithRole('admin') }))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('is unaffected by a regular user session in the other cookie', () => {
    middleware(
      makeRequest('/admin/users', { user: tokenWithRole('user'), admin: tokenWithRole('admin') }),
    )
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('sends a non-admin token back to the admin login', () => {
    middleware(makeRequest('/admin/users', { admin: tokenWithRole('user') }))
    expect(redirectPath()).toBe('/admin/login')
  })

  it('shows the admin login page to an anonymous visitor', () => {
    middleware(makeRequest('/admin/login'))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('redirects an already authenticated admin away from the login page', () => {
    middleware(makeRequest('/admin/login', { admin: tokenWithRole('admin') }))
    expect(redirectPath()).toBe('/admin')
  })

  it('keeps a non-admin on the admin login page', () => {
    middleware(makeRequest('/admin/login', { admin: tokenWithRole('user') }))
    expect(next).toHaveBeenCalled()
  })

  it('treats an undecodable token as non-admin', () => {
    middleware(makeRequest('/admin/users', { admin: 'garbage' }))
    expect(redirectPath()).toBe('/admin/login')
  })
})

describe('protected routes', () => {
  it.each(['/feed', '/profile'])('redirects anonymous visitors from %s to /login', (path) => {
    middleware(makeRequest(path))
    expect(redirectPath()).toBe('/login')
  })

  it('lets an authenticated user reach the feed', () => {
    middleware(makeRequest('/feed', { user: tokenWithRole('user') }))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('protects nested paths too', () => {
    middleware(makeRequest('/feed/flux/12'))
    expect(redirectPath()).toBe('/login')
  })

  it('is unaffected by an admin session in the other cookie', () => {
    middleware(makeRequest('/feed', { admin: tokenWithRole('admin') }))
    expect(redirectPath()).toBe('/login')
  })

  it('lets a user through on a live token in the instances cookie', () => {
    const jar = {
      stayup_instances: JSON.stringify([
        { id: 'a', url: 'https://a.dev', name: 'A', token: tokenWithExp(3600) },
      ]),
    }
    middleware(makeRequest('/feed', { jar }))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('redirects when every instance token has expired', () => {
    const jar = {
      stayup_instances: JSON.stringify([
        { id: 'a', url: 'https://a.dev', name: 'A', token: tokenWithExp(-60) },
      ]),
    }
    middleware(makeRequest('/feed', { jar }))
    expect(redirectPath()).toBe('/login')
  })

  it('reassembles a chunked instances cookie', () => {
    const json = JSON.stringify([
      { id: 'a', url: 'https://a.dev', name: 'A', token: tokenWithExp(3600) },
    ])
    const jar = {
      stayup_instances_0: json.slice(0, 12),
      stayup_instances_1: json.slice(12),
    }
    middleware(makeRequest('/feed', { jar }))
    expect(next).toHaveBeenCalled()
  })

  it('treats a malformed instances cookie as no session', () => {
    middleware(makeRequest('/feed', { jar: { stayup_instances: 'not json' } }))
    expect(redirectPath()).toBe('/login')
  })
})

describe('auth pages', () => {
  it.each(['/login', '/register'])('redirects a signed-in user from %s to /feed', (path) => {
    middleware(makeRequest(path, { user: tokenWithRole('user') }))
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

// Le middleware ne fait que des redirections de confort — le payload n'est pas
// signé — mais il doit au moins refuser un token périmé.
describe('admin token expiry', () => {
  function tokenWithExp(role: string, exp: number) {
    const body = Buffer.from(JSON.stringify({ sub: 'u1', role, exp })).toString('base64url')
    return `header.${body}.sig`
  }

  it('sends an expired admin token back to the login page', () => {
    const expired = tokenWithExp('admin', Math.floor(Date.now() / 1000) - 10)
    middleware(makeRequest('/admin/users', { admin: expired }))
    expect(redirectPath()).toBe('/admin/login')
  })

  it('lets a live admin token through', () => {
    const live = tokenWithExp('admin', Math.floor(Date.now() / 1000) + 3600)
    middleware(makeRequest('/admin/users', { admin: live }))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('does not bounce an expired admin token away from the login page', () => {
    const expired = tokenWithExp('admin', Math.floor(Date.now() / 1000) - 10)
    middleware(makeRequest('/admin/login', { admin: expired }))
    expect(next).toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })
})
