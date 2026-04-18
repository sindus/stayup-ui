import { cookies } from 'next/headers'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { extractIdentifier } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { FeedSidebar } from '@/components/feed/FeedSidebar'
import type { Provider, UserRepository } from '@/types'

export default async function FeedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  const feedData = await getCachedUserFeed(session!.userId, token).catch(() => ({
    repositories: [],
    connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
  }))

  const fluxes: UserRepository[] = feedData.repositories.map((repo) => ({
    id: repo.id,
    userId: session!.userId,
    repositoryId: repo.repository_id,
    provider: repo.provider as Provider,
    url: repo.url,
    identifier: extractIdentifier(repo.url, repo.provider as Provider),
    config: repo.config ?? {},
    createdAt: repo.created_at,
  }))

  return (
    <div className="flex gap-6 min-h-0">
      <FeedSidebar fluxes={fluxes} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
