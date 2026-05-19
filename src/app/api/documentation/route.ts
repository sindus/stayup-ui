import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getDocs } from '@/lib/api-client'
import { COOKIE_NAME } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const docs = await getDocs(token)
    return NextResponse.json({ docs })
  } catch {
    return NextResponse.json({ docs: [] })
  }
}
