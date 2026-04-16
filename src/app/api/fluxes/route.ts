import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userRepository } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { validateFlux } from '@/lib/api-client'
import { normalizeIdentifier, toRepositoryUrl, extractIdentifier } from '@/lib/utils'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import type { Provider } from '@/types'

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

type RepoRow = {
  id: string
  userId: string
  repositoryId: number
  label: string
  createdAt: Date
  url: string
  provider: string
  config: Record<string, unknown>
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = (await db.execute(sql`
    SELECT
      ur.id,
      ur.user_id       AS "userId",
      ur.repository_id AS "repositoryId",
      ur.label,
      ur.created_at    AS "createdAt",
      r.url,
      r.type           AS provider,
      r.config
    FROM user_repository ur
    JOIN repository r ON r.id = ur.repository_id
    WHERE ur.user_id = ${session.user.id}
    ORDER BY ur.created_at
  `)) as unknown as RepoRow[]

  const fluxes = rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    repositoryId: Number(row.repositoryId),
    label: row.label,
    provider: row.provider as Provider,
    url: row.url,
    identifier: extractIdentifier(row.url, row.provider as Provider),
    config: row.config ?? {},
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  }))

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

  // Upsert repository (shared across users — deduplicated by url)
  const repoRows = (await db.execute(sql`
    INSERT INTO repository (url, type, config)
    VALUES (${url}, ${provider}, ${JSON.stringify(config)}::jsonb)
    ON CONFLICT (url) DO UPDATE SET
      type   = EXCLUDED.type,
      config = EXCLUDED.config
    RETURNING id
  `)) as unknown as Array<{ id: number }>

  const repositoryId = Number(repoRows[0].id)

  // Link user to repository (ignore if already subscribed)
  const [created] = await db
    .insert(userRepository)
    .values({ id: randomUUID(), userId: session.user.id, repositoryId, label })
    .onConflictDoNothing()
    .returning()

  if (!created) {
    return NextResponse.json({ error: 'Vous êtes déjà abonné à ce flux' }, { status: 409 })
  }

  return NextResponse.json(
    {
      flux: {
        ...created,
        provider,
        url,
        identifier,
        config,
      },
    },
    { status: 201 },
  )
}
