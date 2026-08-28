import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getProviderFluxes, subscribeFlux, unsubscribeFlux } from '@/lib/api-client'
import { COOKIE_NAME } from '@/lib/session'

// GET  /api/providers/:provider/fluxes            → liste des flux existants
// POST /api/providers/:provider/fluxes  { id }    → s'abonner à un flux existant
// DELETE ...                            { id }    → se désabonner
export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider } = await params
  try {
    return NextResponse.json({ fluxes: await getProviderFluxes(provider, token) })
  } catch {
    return NextResponse.json({ fluxes: [] })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider } = await params
  const { id } = (await req.json().catch(() => ({}))) as { id?: number }
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  try {
    await subscribeFlux(provider, id, token)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    const message = (err as Error).message ?? 'Erreur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('subscribed') ? 409 : 500 },
    )
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider } = await params
  const { id } = (await req.json().catch(() => ({}))) as { id?: number }
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  try {
    await unsubscribeFlux(provider, id, token)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 404 })
  }
}
