import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { deleteUserRepository } from '@/lib/api-client'
import { COOKIE_NAME, decodeToken } from '@/lib/session'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = decodeToken(token)
  const { id } = await params

  try {
    await deleteUserRepository(session.userId, id, token)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = (err as Error).message
    if (message.includes('introuvable')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    throw err
  }
}
