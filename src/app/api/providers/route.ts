import { NextResponse } from 'next/server'
import { getConnectorProviders } from '@/lib/api-client'
import { resolveInstance } from '@/lib/instances'

// Proxy vers GET /connectors/providers — sert à construire dynamiquement les listes
// de providers côté client (ex: sélecteur "ajouter un flux"), sans exposer le token
// au navigateur. `?instanceId=` cible une instance d'API précise (multi-API).
export async function GET(request: Request) {
  const instanceId = new URL(request.url).searchParams.get('instanceId')
  const instance = await resolveInstance(instanceId)
  if (!instance) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const providers = await getConnectorProviders(instance.token, instance.url)
    return NextResponse.json({ providers })
  } catch {
    return NextResponse.json({ providers: [] })
  }
}
