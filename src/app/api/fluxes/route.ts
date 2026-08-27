import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ApiError, addUserRepository, subscribeScrap, validateFlux } from '@/lib/api-client'
import { getServerTranslations } from '@/lib/serverLang'
import { COOKIE_NAME, decodeToken } from '@/lib/session'
import { normalizeIdentifier, toRepositoryUrl } from '@/lib/utils'
import { z } from 'zod'

// Le provider n'est plus limité à une liste fermée : n'importe quel nom déclaré côté
// API (voir GET /connectors/providers) est accepté. 'scrap' garde son flux dédié
// (sélection d'un repo approuvé par un admin) ; tous les autres passent par un
// identifiant/URL, saisi par l'utilisateur.
const createFluxSchema = z
  .object({
    provider: z.string().min(1),
    identifier: z.string().max(200).optional(),
    scrapRepoId: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'scrap') {
      if (!data.scrapRepoId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'scrapRepoId requis',
          path: ['scrapRepoId'],
        })
      }
    } else if (!data.identifier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'identifier requis',
        path: ['identifier'],
      })
    }
  })

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const t = await getServerTranslations()
  if (!token) return NextResponse.json({ error: t.errors.notAuthenticated }, { status: 401 })

  const session = decodeToken(token)

  const body = await request.json()
  const parsed = createFluxSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.errors.invalidData, details: parsed.error.issues },
      { status: 400 },
    )
  }

  if (parsed.data.provider === 'scrap') {
    // scrapRepoId requis par le superRefine ci-dessus quand provider === 'scrap'.
    try {
      await subscribeScrap(parsed.data.scrapRepoId as number, token)
      return NextResponse.json({ success: true }, { status: 201 })
    } catch (err) {
      return NextResponse.json(...toResponse(err, t))
    }
  }

  // identifier requis par le superRefine ci-dessus quand provider !== 'scrap'.
  const { provider } = parsed.data
  const identifier = normalizeIdentifier(parsed.data.identifier as string, provider)

  const { valid, reason } = await validateFlux(provider, identifier)
  if (!valid) {
    return NextResponse.json({ error: t.errors[reason ?? 'invalidUrl'] }, { status: 404 })
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
    return NextResponse.json(...toResponse(err, t))
  }
}

// L'API répond en anglais ('Already subscribed') : l'ancien test `message.includes(
// 'abonné')` ne matchait jamais et renvoyait un 500 avec la phrase brute. On branche
// sur le statut HTTP, seul contrat stable, et on traduit ici.
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
