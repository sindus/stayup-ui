import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    redirect('/login?error=oauth_failed')
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
      exp?: number
      sub?: string
    }

    if (!payload.sub || !payload.exp || payload.exp < Date.now() / 1000) {
      redirect('/login?error=oauth_failed')
    }

    const maxAge = Math.max(payload.exp - Math.floor(Date.now() / 1000), 0)
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge,
    })
  } catch {
    redirect('/login?error=oauth_failed')
  }

  redirect('/feed')
}
