import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { extractIdentifier } from '@/lib/utils'
import { FeedItemList } from '@/components/feed/FeedItemList'
import type { Provider } from '@/types'

export default async function FluxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const feedData = await getCachedUserFeed(session!.user.id).catch(() => ({
    repositories: [],
    connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
  }))

  const repo = feedData.repositories.find((r) => r.id === id)
  if (!repo) notFound()

  const provider = repo.provider as Provider
  const identifier = extractIdentifier(repo.url, provider)
  const allItems = feedData.connectors[provider] ?? []
  const items = allItems.filter((item) => item.repository_id === repo.repository_id)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-mono">{identifier}</h1>
      <FeedItemList items={items} provider={provider} />
    </div>
  )
}
