import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userFlux } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { validateFlux } from '@/lib/api-client'
import { normalizeIdentifier } from '@/lib/utils'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const createFluxSchema = z
  .object({
    provider: z.enum(['changelog', 'youtube', 'rss', 'scrap']),
    identifier: z.string().min(1).max(200),
    label: z.string().min(1).max(100),
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

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fluxes = await db
    .select()
    .from(userFlux)
    .where(eq(userFlux.userId, session.user.id))
    .orderBy(userFlux.createdAt)

  return NextResponse.json({ fluxes })
}

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

  const { provider, label, articles_selector, content_selector } = parsed.data
  const identifier = normalizeIdentifier(parsed.data.identifier, provider)

  const { valid, reason } = await validateFlux(provider, identifier)
  if (!valid) {
    return NextResponse.json({ error: reason }, { status: 404 })
  }

  const params =
    provider === 'scrap'
      ? JSON.stringify({
          articles_selector: articles_selector!,
          content_selector: content_selector!,
        })
      : null

  const [created] = await db
    .insert(userFlux)
    .values({ id: randomUUID(), userId: session.user.id, provider, identifier, label, params })
    .returning()

  return NextResponse.json({ flux: created }, { status: 201 })
}
