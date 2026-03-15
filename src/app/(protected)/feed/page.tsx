import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userFlux } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { FluxList } from '@/components/feed/FluxList'
import { EmptyFeed } from '@/components/feed/EmptyFeed'
import { getChangelogItems, getYoutubeItems } from '@/lib/api-client'

export const metadata: Metadata = {
  title: 'Mon flux — StayUp',
}

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const [fluxes, changelogItems, youtubeItems] = await Promise.all([
    db
      .select()
      .from(userFlux)
      .where(eq(userFlux.userId, session!.user.id))
      .orderBy(userFlux.createdAt),
    getChangelogItems(),
    getYoutubeItems(),
  ])

  const typedFluxes = fluxes.map((f) => ({
    ...f,
    provider: f.provider as 'changelog' | 'youtube',
    createdAt: f.createdAt.toISOString(),
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mon flux</h1>
      </div>
      {typedFluxes.length === 0 ? (
        <EmptyFeed />
      ) : (
        <FluxList
          fluxes={typedFluxes}
          changelogItems={changelogItems}
          youtubeItems={youtubeItems}
        />
      )}
    </div>
  )
}
