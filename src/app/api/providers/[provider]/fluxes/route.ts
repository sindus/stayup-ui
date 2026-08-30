import { NextResponse } from 'next/server'
import { getProviderFluxes, subscribeFlux, unsubscribeFlux } from '@/lib/api-client'
import { resolveInstance } from '@/lib/instances'

// GET  /api/providers/:provider/fluxes            → liste des flux existants
// POST /api/providers/:provider/fluxes  { id }    → s'abonner à un flux existant
// DELETE ...                            { id }    → se désabonner
// `?instanceId=` cible une instance d'API précise (multi-API) — défaut : primaire.
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const instance = await resolveInstance(new URL(req.url).searchParams.get('instanceId'))
  if (!instance) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider } = await params
  try {
    return NextResponse.json({
      fluxes: await getProviderFluxes(provider, instance.token, instance.url),
    })
  } catch {
    return NextResponse.json({ fluxes: [] })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const instance = await resolveInstance(new URL(req.url).searchParams.get('instanceId'))
  if (!instance) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider } = await params
  const { id, dataSourceId } = (await req.json().catch(() => ({}))) as {
    id?: number
    dataSourceId?: number
  }
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  try {
    await subscribeFlux(provider, id, instance.token, dataSourceId, instance.url)
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
  const instance = await resolveInstance(new URL(req.url).searchParams.get('instanceId'))
  if (!instance) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider } = await params
  const { id, dataSourceId } = (await req.json().catch(() => ({}))) as {
    id?: number
    dataSourceId?: number
  }
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  try {
    await unsubscribeFlux(provider, id, instance.token, dataSourceId, instance.url)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 404 })
  }
}
