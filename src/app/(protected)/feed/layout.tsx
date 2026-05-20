import { cookies } from 'next/headers'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { extractIdentifier } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { FeedClientLayout } from '@/components/feed/FeedClientLayout'
import type { Provider, UserRepository, TaggedItem } from '@/types'

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

  const { changelog = [], youtube = [], rss = [], scrap = [] } = feedData.connectors ?? {}
  const allItems: TaggedItem[] = [
    ...changelog.map((item) => ({ provider: 'changelog' as const, item })),
    ...youtube.map((item) => ({ provider: 'youtube' as const, item })),
    ...rss.map((item) => ({ provider: 'rss' as const, item })),
    ...scrap.map((item) => ({ provider: 'scrap' as const, item })),
  ]

  return (
    <FeedClientLayout fluxes={fluxes} allItems={allItems}>
      {children}
    </FeedClientLayout>
  )
}
