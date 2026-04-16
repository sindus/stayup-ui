import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userRepository } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const deleted = await db
    .delete(userRepository)
    .where(and(eq(userRepository.id, id), eq(userRepository.userId, session.user.id)))
    .returning()

  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Flux introuvable' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
