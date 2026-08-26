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

  const feedData = await getCachedUserFeed(session!.userId, token)

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

  const allItems: TaggedItem[] = Object.entries(feedData.connectors ?? {}).flatMap(
    ([provider, providerItems]) => providerItems.map((item) => ({ provider, item })),
  ) as TaggedItem[]

  return (
    <FeedClientLayout fluxes={fluxes} allItems={allItems}>
      {children}
    </FeedClientLayout>
  )
}
