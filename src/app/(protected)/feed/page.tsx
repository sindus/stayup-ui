import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { FluxList } from '@/components/feed/FluxList'
import { EmptyFeed } from '@/components/feed/EmptyFeed'
import { getChangelogItems, getYoutubeItems, getRssItems, getScrapItems } from '@/lib/api-client'
import { extractIdentifier } from '@/lib/utils'
import type {
  ChangelogItem,
  YoutubeItem,
  RssItem,
  ScrapItem,
  UserRepository,
  Provider,
} from '@/types'

export const metadata: Metadata = {
  title: 'Mon flux — StayUp',
}

type UserRepoRow = {
  id: string
  repositoryId: number
  label: string
  createdAt: Date
  url: string
  provider: string
  config: Record<string, unknown>
}

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const [userRepoRows, changelogItems, youtubeItems, rssItems, scrapItems] = await Promise.all([
    db.execute(sql`
      SELECT
        ur.id,
        ur.repository_id AS "repositoryId",
        ur.label,
        ur.created_at    AS "createdAt",
        r.url,
        r.type           AS provider,
        r.config
      FROM user_repository ur
      JOIN repository r ON r.id = ur.repository_id
      WHERE ur.user_id = ${session!.user.id}
      ORDER BY ur.created_at
    `) as unknown as UserRepoRow[],
    getChangelogItems(),
    getYoutubeItems(),
    getRssItems(),
    getScrapItems(),
  ])

  // Group connector items by repository_id for O(1) lookup
  const changelogByRepoId: Record<number, ChangelogItem[]> = {}
  for (const item of changelogItems) {
    ;(changelogByRepoId[item.repository_id] ??= []).push(item)
  }

  const youtubeByRepoId: Record<number, YoutubeItem[]> = {}
  for (const item of youtubeItems) {
    ;(youtubeByRepoId[item.repository_id] ??= []).push(item)
  }

  const rssByRepoId: Record<number, RssItem[]> = {}
  for (const item of rssItems) {
    ;(rssByRepoId[item.repository_id] ??= []).push(item)
  }

  const scrapByRepoId: Record<number, ScrapItem[]> = {}
  for (const item of scrapItems) {
    ;(scrapByRepoId[item.repository_id] ??= []).push(item)
  }

  const fluxes: UserRepository[] = (userRepoRows as UserRepoRow[]).map((row) => ({
    id: row.id,
    userId: session!.user.id,
    repositoryId: Number(row.repositoryId),
    label: row.label,
    provider: row.provider as Provider,
    url: row.url,
    identifier: extractIdentifier(row.url, row.provider as Provider),
    config: row.config ?? {},
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mon flux</h1>
      </div>
      {fluxes.length === 0 ? (
        <EmptyFeed />
      ) : (
        <FluxList
          fluxes={fluxes}
          changelogByRepoId={changelogByRepoId}
          youtubeByRepoId={youtubeByRepoId}
          rssByRepoId={rssByRepoId}
          scrapByRepoId={scrapByRepoId}
        />
      )}
    </div>
  )
}
