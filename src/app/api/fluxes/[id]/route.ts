import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteUserRepository } from '@/lib/api-client'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    await deleteUserRepository(session.user.id, id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = (err as Error).message
    if (message.includes('introuvable')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    throw err
  }
}
