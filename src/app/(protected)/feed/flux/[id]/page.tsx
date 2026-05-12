import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { getSession } from '@/lib/session'
import { FeedClientView } from '@/components/feed/FeedClientView'
import type { Provider, TaggedItem } from '@/types'

export default async function FluxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  let feedData
  try {
    feedData = await getCachedUserFeed(session!.userId, token)
  } catch {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
        <p className="text-sm">Impossible de charger ce flux. Veuillez réessayer.</p>
      </div>
    )
  }

  const repo = feedData.repositories.find((r) => r.id === id)
  if (!repo) notFound()

  const provider = repo.provider as Provider
  const allItems = feedData.connectors[provider] ?? []
  const items = allItems
    .filter((item) => item.repository_id === repo.repository_id)
    .map((item) => ({ provider, item })) as TaggedItem[]

  return <FeedClientView items={items} repositories={feedData.repositories} />
}
