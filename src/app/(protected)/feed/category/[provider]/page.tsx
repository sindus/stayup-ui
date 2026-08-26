import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { getSession } from '@/lib/session'
import { FeedClientView } from '@/components/feed/FeedClientView'
import type { TaggedItem } from '@/types'

export default async function CategoryPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params

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

  // La liste des providers valides est 100% dynamique : c'est la présence de la clé
  // dans le feed (donc d'une table connector_<provider> côté API) qui fait foi.
  if (!(provider in feedData.connectors)) notFound()

  const rawItems = feedData.connectors[provider] ?? []
  const items = rawItems.map((item) => ({ provider, item })) as TaggedItem[]

  return <FeedClientView items={items} repositories={feedData.repositories} />
}
