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

const createFluxSchema = z.object({
  provider: z.enum(['changelog', 'youtube']),
  identifier: z.string().min(1).max(200),
  label: z.string().min(1).max(100),
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
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.issues }, { status: 400 })
  }

  const { provider, label } = parsed.data
  const identifier = normalizeIdentifier(parsed.data.identifier, provider)

  const { valid, reason } = await validateFlux(provider, identifier)
  if (!valid) {
    return NextResponse.json({ error: reason }, { status: 404 })
  }

  const [created] = await db
    .insert(userFlux)
    .values({ id: randomUUID(), userId: session.user.id, provider, identifier, label })
    .returning()

  return NextResponse.json({ flux: created }, { status: 201 })
}
