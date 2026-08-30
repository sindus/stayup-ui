import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getApiUrl } from '@/lib/apiUrl'
import { upsertPrimaryInstance } from '@/lib/instances'

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

    await upsertPrimaryInstance(await getApiUrl(), token)
  } catch {
    redirect('/login?error=oauth_failed')
  }

  redirect('/feed')
}
