import { NextResponse } from 'next/server'
import { deleteUserRepository } from '@/lib/api-client'
import { resolveInstance } from '@/lib/instances'
import { decodeToken } from '@/lib/session'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const instanceId = new URL(request.url).searchParams.get('instanceId')
  const instance = await resolveInstance(instanceId)
  if (!instance) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = decodeToken(instance.token)
  const { id } = await params

  try {
    await deleteUserRepository(session.userId, id, instance.token, instance.url)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = (err as Error).message
    if (message.includes('introuvable')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    throw err
  }
}
