import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getScrapRepos } from '@/lib/api-client'
import { COOKIE_NAME } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const repos = await getScrapRepos(token)
    return NextResponse.json({ repos })
  } catch {
    return NextResponse.json({ repos: [] })
  }
}
