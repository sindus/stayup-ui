import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userFlux } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { FluxList } from '@/components/feed/FluxList'
import { EmptyFeed } from '@/components/feed/EmptyFeed'
import { getChangelogItems, getYoutubeItems, getRssItems, getScrapItems } from '@/lib/api-client'
import type { ChangelogItem, YoutubeItem, RssItem, ScrapItem } from '@/types'

export const metadata: Metadata = {
  title: 'Mon flux — StayUp',
}

type ProviderRow = { id: number; url: string }

function extractChangelogIdentifier(url: string): string {
  const m = url.match(/github\.com\/([^/]+\/[^/?\s]+)/i)
  return m ? m[1] : url
}

function extractYoutubeIdentifier(url: string): string {
  const m = url.match(/(?:youtube\.com\/(?:@|channel\/|user\/)|@)([^/?\s]+)/i)
  return m ? m[1] : url.replace(/^@/, '')
}

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const [fluxes, changelogItems, youtubeItems, rssItems, scrapItems, repositories, profiles] =
    await Promise.all([
      db
        .select()
        .from(userFlux)
        .where(eq(userFlux.userId, session!.user.id))
        .orderBy(userFlux.createdAt),
      getChangelogItems(),
      getYoutubeItems(),
      getRssItems(),
      getScrapItems(),
      db.execute(sql`SELECT id, url FROM repository`),
      db.execute(sql`SELECT id, url FROM profile`),
    ])

  // Build provider_id → identifier maps from the stayup-api tables
  const changelogProviderMap = new Map<number, string>(
    (repositories as unknown as ProviderRow[]).map((r) => [
      r.id,
      extractChangelogIdentifier(r.url),
    ]),
  )
  const youtubeProviderMap = new Map<number, string>(
    (profiles as unknown as ProviderRow[]).map((p) => [p.id, extractYoutubeIdentifier(p.url)]),
  )
  // rss and scrap use repository_id → url directly (no extraction needed)
  const rssRepositoryMap = new Map<number, string>(
    (repositories as unknown as ProviderRow[]).map((r) => [r.id, r.url]),
  )
  const scrapRepositoryMap = new Map<number, string>(
    (repositories as unknown as ProviderRow[]).map((r) => [r.id, r.url]),
  )

  // Group items by identifier
  const changelogByIdentifier: Record<string, ChangelogItem[]> = {}
  for (const item of changelogItems) {
    const identifier = changelogProviderMap.get(item.provider_id)
    if (identifier) {
      changelogByIdentifier[identifier] = [...(changelogByIdentifier[identifier] ?? []), item]
    }
  }

  const youtubeByIdentifier: Record<string, YoutubeItem[]> = {}
  for (const item of youtubeItems) {
    const identifier = youtubeProviderMap.get(item.provider_id)
    if (identifier) {
      youtubeByIdentifier[identifier] = [...(youtubeByIdentifier[identifier] ?? []), item]
    }
  }

  const rssByIdentifier: Record<string, RssItem[]> = {}
  for (const item of rssItems) {
    const identifier = rssRepositoryMap.get(item.repository_id)
    if (identifier) {
      rssByIdentifier[identifier] = [...(rssByIdentifier[identifier] ?? []), item]
    }
  }

  const scrapByIdentifier: Record<string, ScrapItem[]> = {}
  for (const item of scrapItems) {
    const identifier = scrapRepositoryMap.get(item.repository_id)
    if (identifier) {
      scrapByIdentifier[identifier] = [...(scrapByIdentifier[identifier] ?? []), item]
    }
  }

  const typedFluxes = fluxes.map((f) => ({
    ...f,
    provider: f.provider as 'changelog' | 'youtube' | 'rss' | 'scrap',
    params: f.params ?? null,
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
          changelogByIdentifier={changelogByIdentifier}
          youtubeByIdentifier={youtubeByIdentifier}
          rssByIdentifier={rssByIdentifier}
          scrapByIdentifier={scrapByIdentifier}
        />
      )}
    </div>
  )
}
