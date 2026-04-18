import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { getSession } from '@/lib/session'
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

  const session = await getSession()
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  let feedData
  try {
    feedData = await getCachedUserFeed(session!.userId, token)
  } catch {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
        <p className="text-sm">Impossible de charger les données. Veuillez réessayer.</p>
      </div>
    )
  }

  const items = feedData.connectors[provider as Provider] ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{PROVIDER_LABELS[provider as Provider]}</h1>
      <FeedItemList items={items} provider={provider as Provider} />
    </div>
  )
}
