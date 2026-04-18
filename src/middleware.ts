import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/constants'
import { decodeJwtPayload } from '@/lib/jwt'

const PROTECTED_PATHS = ['/feed', '/profile']
const AUTH_PATHS = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    const payload = decodeJwtPayload(token)
    if (payload.role !== 'admin') return NextResponse.redirect(new URL('/feed', request.url))
    return NextResponse.next()
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
