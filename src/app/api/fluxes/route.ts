import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { validateFlux, addUserRepository } from '@/lib/api-client'
import { normalizeIdentifier, toRepositoryUrl } from '@/lib/utils'
import { z } from 'zod'

const createFluxSchema = z
  .object({
    provider: z.enum(['changelog', 'youtube', 'rss', 'scrap']),
    identifier: z.string().min(1).max(200),
    articles_selector: z.string().optional(),
    content_selector: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'scrap') {
      if (!data.articles_selector?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le sélecteur d'articles est requis",
          path: ['articles_selector'],
        })
      }
      if (!data.content_selector?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le sélecteur de contenu est requis',
          path: ['content_selector'],
        })
      }
    }
  })

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createFluxSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const { provider, articles_selector, content_selector } = parsed.data
  const identifier = normalizeIdentifier(parsed.data.identifier, provider)

  const { valid, reason } = await validateFlux(provider, identifier)
  if (!valid) {
    return NextResponse.json({ error: reason }, { status: 404 })
  }

  const url = toRepositoryUrl(identifier, provider)
  const config =
    provider === 'scrap'
      ? {
          articles_selector: articles_selector!,
          content_selector: content_selector!,
          max_scraps: 5,
          retention_days: 15,
        }
      : { max_scraps: 5, retention_days: 15 }

  try {
    const { repository } = await addUserRepository(session.user.id, {
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
    throw err
  }
}
