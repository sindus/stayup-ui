import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createScrapRequest } from '@/lib/api-client'
import { COOKIE_NAME } from '@/lib/session'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { url?: string }
  if (!body.url?.trim()) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    new URL(body.url)
  } catch {
    return NextResponse.json({ error: "L'URL n'est pas valide" }, { status: 400 })
  }

  try {
    const result = await createScrapRequest({ url: body.url }, token)
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    const message = (err as Error).message ?? 'Erreur'
    const status = message.includes('already exists') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
