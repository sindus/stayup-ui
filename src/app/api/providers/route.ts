import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getConnectorProviders } from '@/lib/api-client'
import { COOKIE_NAME } from '@/lib/session'

// Proxy vers GET /connectors/providers — sert à construire dynamiquement les listes
// de providers côté client (ex: sélecteur "ajouter un flux"), sans exposer le token
// au navigateur.
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const providers = await getConnectorProviders(token)
    return NextResponse.json({ providers })
  } catch {
    return NextResponse.json({ providers: [] })
  }
}
