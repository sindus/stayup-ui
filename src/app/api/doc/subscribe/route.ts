import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { subscribeDoc } from '@/lib/api-client'
import { COOKIE_NAME } from '@/lib/session'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { docId?: number }
  if (!body.docId) {
    return NextResponse.json({ error: 'docId is required' }, { status: 400 })
  }

  try {
    await subscribeDoc(body.docId, token)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    const message = (err as Error).message ?? 'Erreur'
    const status = message.toLowerCase().includes('already') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
