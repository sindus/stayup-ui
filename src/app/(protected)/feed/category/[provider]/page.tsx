import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { FeedItemList } from '@/components/feed/FeedItemList'
import type { Provider } from '@/types'

const PROVIDERS = ['changelog', 'youtube', 'rss', 'scrap'] as const

const PROVIDER_LABELS: Record<Provider, string> = {
  changelog: 'GitHub Changelog',
  youtube: 'YouTube',
  rss: 'RSS',
  scrap: 'Scraping web',
}

export default async function CategoryPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params

  if (!PROVIDERS.includes(provider as Provider)) notFound()

  const session = await auth.api.getSession({ headers: await headers() })

  const feedData = await getCachedUserFeed(session!.user.id).catch(() => ({
    repositories: [],
    connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
  }))

  const items = feedData.connectors[provider as Provider] ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{PROVIDER_LABELS[provider as Provider]}</h1>
      <FeedItemList items={items} provider={provider as Provider} />
    </div>
  )
}
