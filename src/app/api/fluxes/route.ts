import { NextResponse } from 'next/server'
import { ApiError, addUserRepository } from '@/lib/api-client'
import { getServerTranslations } from '@/lib/serverLang'
import { resolveInstance } from '@/lib/instances'
import { decodeToken } from '@/lib/session'
import { z } from 'zod'

// Un seul chemin d'ajout, quel que soit le provider : le client envoie une URL
// déjà construite (à partir du `form` du template du connecteur). Si le provider
// est en mode `manual`, l'API répond 202 et le flux part en file d'approbation.
// `?instanceId=` cible une instance d'API précise (multi-API) — défaut : primaire.
const createFluxSchema = z.object({
  provider: z.string().min(1),
  url: z.string().url().max(2000),
})

export async function POST(request: Request) {
  const t = await getServerTranslations()
  const instanceId = new URL(request.url).searchParams.get('instanceId')
  const instance = await resolveInstance(instanceId)
  if (!instance) return NextResponse.json({ error: t.errors.notAuthenticated }, { status: 401 })

  const session = decodeToken(instance.token)

  const body = await request.json()
  const parsed = createFluxSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.errors.invalidData, details: parsed.error.issues },
      { status: 400 },
    )
  }

  const { provider, url } = parsed.data
  const config = { max_scraps: 5, retention_days: 15 }

  try {
    const result = await addUserRepository(
      session.userId,
      instance.token,
      { provider, url, config },
      instance.url,
    )
    if (result.status === 'pending') {
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }
    // Le libellé d'affichage est calculé par le client depuis le template du
    // connecteur (resolveFeedLabel) après revalidation — pas ici.
    return NextResponse.json({ flux: result.repository }, { status: 201 })
  } catch (err) {
    return NextResponse.json(...toResponse(err, t))
  }
}

// L'API répond en anglais ('Already subscribed') : on branche sur le statut HTTP,
// seul contrat stable, et on traduit ici.
function toResponse(
  err: unknown,
  t: Awaited<ReturnType<typeof getServerTranslations>>,
): [{ error: string }, { status: number }] {
  const status = err instanceof ApiError ? err.status : 500
  if (status === 409) {
    const message = err instanceof ApiError ? err.message : ''
    return [
      {
        error: message.includes('another provider')
          ? t.errors.urlOtherProvider
          : t.errors.alreadySubscribed,
      },
      { status: 409 },
    ]
  }
  return [{ error: t.errors.generic }, { status: status >= 400 ? status : 500 }]
}
