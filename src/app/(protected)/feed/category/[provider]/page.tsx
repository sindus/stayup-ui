import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { getSession } from '@/lib/session'
import { FeedClientView } from '@/components/feed/FeedClientView'
import type { Provider, TaggedItem } from '@/types'

const PROVIDERS = ['changelog', 'youtube', 'rss', 'scrap'] as const

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

  const rawItems = feedData.connectors[provider as Provider] ?? []
  const items = rawItems.map((item) => ({
    provider: provider as Provider,
    item,
  })) as TaggedItem[]

  return <FeedClientView items={items} repositories={feedData.repositories} />
}
