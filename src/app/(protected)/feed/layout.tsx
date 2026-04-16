import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getUserFeed } from '@/lib/api-client'
import { extractIdentifier } from '@/lib/utils'
import { FeedSidebar } from '@/components/feed/FeedSidebar'
import type { Provider, UserRepository } from '@/types'

export default async function FeedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  const feedData = await getUserFeed(session!.user.id).catch(() => ({
    repositories: [],
    connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
  }))

  const fluxes: UserRepository[] = feedData.repositories.map((repo) => ({
    id: repo.id,
    userId: session!.user.id,
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
