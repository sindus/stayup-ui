import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { addUserRepository, subscribeScrap, validateFlux } from '@/lib/api-client'
import { COOKIE_NAME, decodeToken } from '@/lib/session'
import { normalizeIdentifier, toRepositoryUrl } from '@/lib/utils'
import { z } from 'zod'

const createFluxSchema = z.discriminatedUnion('provider', [
  z.object({
    provider: z.enum(['changelog', 'youtube', 'rss']),
    identifier: z.string().min(1).max(200),
  }),
  z.object({
    provider: z.literal('scrap'),
    scrapRepoId: z.number().int().positive(),
  }),
])

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = decodeToken(token)

  const body = await request.json()
  const parsed = createFluxSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.issues },
      { status: 400 },
    )
  }

  if (parsed.data.provider === 'scrap') {
    try {
      await subscribeScrap(parsed.data.scrapRepoId, token)
      return NextResponse.json({ success: true }, { status: 201 })
    } catch (err) {
      const message = (err as Error).message
      if (message.toLowerCase().includes('already') || message.includes('abonné')) {
        return NextResponse.json({ error: 'Vous êtes déjà abonné à ce flux.' }, { status: 409 })
      }
      return NextResponse.json({ error: message ?? 'Une erreur est survenue.' }, { status: 500 })
    }
  }

  const { provider } = parsed.data
  const identifier = normalizeIdentifier(parsed.data.identifier, provider)

  const { valid, reason } = await validateFlux(provider, identifier)
  if (!valid) {
    return NextResponse.json({ error: reason }, { status: 404 })
  }

  const url = toRepositoryUrl(identifier, provider)
  const config = { max_scraps: 5, retention_days: 15 }

  try {
    const { repository } = await addUserRepository(session.userId, token, {
      provider,
      url,
      config,
    })
    return NextResponse.json({ flux: { ...repository, identifier } }, { status: 201 })
  } catch (err) {
    const message = (err as Error).message
    if (message.includes('abonné')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }
    return NextResponse.json({ error: message ?? 'Une erreur est survenue.' }, { status: 500 })
  }
}
