import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getUserFeed } from '@/lib/api-client'
import { extractIdentifier } from '@/lib/utils'
import { FluxList } from '@/components/feed/FluxList'
import { EmptyFeed } from '@/components/feed/EmptyFeed'
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

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const feedData = await getUserFeed(session!.user.id).catch(() => ({
    repositories: [],
    connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
  }))

  const { repositories, connectors } = feedData

  // Group connector items by repository_id — pure array processing, no DB
  const changelogByRepoId: Record<number, ChangelogItem[]> = {}
  for (const item of connectors.changelog) {
    ;(changelogByRepoId[item.repository_id] ??= []).push(item)
  }

  const youtubeByRepoId: Record<number, YoutubeItem[]> = {}
  for (const item of connectors.youtube) {
    ;(youtubeByRepoId[item.repository_id] ??= []).push(item)
  }

  const rssByRepoId: Record<number, RssItem[]> = {}
  for (const item of connectors.rss) {
    ;(rssByRepoId[item.repository_id] ??= []).push(item)
  }

  const scrapByRepoId: Record<number, ScrapItem[]> = {}
  for (const item of connectors.scrap) {
    ;(scrapByRepoId[item.repository_id] ??= []).push(item)
  }

  const fluxes: UserRepository[] = repositories.map((repo) => ({
    id: repo.id,
    userId: session!.user.id,
    repositoryId: repo.repository_id,
    label: repo.label,
    provider: repo.provider as Provider,
    url: repo.url,
    identifier: extractIdentifier(repo.url, repo.provider as Provider),
    config: repo.config ?? {},
    createdAt: repo.created_at,
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
