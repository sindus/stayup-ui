import { notFound } from 'next/navigation'
import { fanoutFeed, toFeedRepositories } from '@/lib/feed-fanout'
import { FeedClientView } from '@/components/feed/FeedClientView'
import type { TaggedItem } from '@/types'

export default async function CategoryPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params

  const { instances, connectors, repositories, templates, instanceErrors } = await fanoutFeed()

  if (instances.length > 0 && instanceErrors.length === instances.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
        <p className="text-sm">Impossible de charger les données. Veuillez réessayer.</p>
      </div>
    )
  }

  // La liste des providers valides est 100% dynamique : c'est la présence de la clé
  // dans le feed (donc d'une table connector_<provider> côté API) qui fait foi.
  if (!(provider in connectors)) notFound()

  const items = (connectors[provider] ?? []).map((item) => ({ provider, item })) as TaggedItem[]

  return (
    <FeedClientView
      items={items}
      repositories={toFeedRepositories(repositories)}
      templates={templates}
      instanceErrors={instanceErrors}
    />
  )
}
