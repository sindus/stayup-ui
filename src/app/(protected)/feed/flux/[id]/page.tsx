import { notFound } from 'next/navigation'
import { fanoutFeed, toFeedRepositories } from '@/lib/feed-fanout'
import { FeedClientView } from '@/components/feed/FeedClientView'
import type { Provider, TaggedItem } from '@/types'

export default async function FluxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Le lien de la sidebar encode `<instanceId>:<linkId>` pour lever l'ambiguïté
  // quand deux instances ont des id de flux qui se chevauchent.
  const sep = id.indexOf(':')
  const instanceId = sep === -1 ? null : id.slice(0, sep)
  const linkId = sep === -1 ? id : id.slice(sep + 1)

  const { instances, connectors, repositories, templates, instanceErrors } = await fanoutFeed()

  if (instances.length > 0 && instanceErrors.length === instances.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
        <p className="text-sm">Impossible de charger ce flux. Veuillez réessayer.</p>
      </div>
    )
  }

  const repo = repositories.find(
    (r) => r.id === linkId && (instanceId === null || r._instance_id === instanceId),
  )
  if (!repo) notFound()

  const provider = repo.provider as Provider
  const items = (connectors[provider] ?? [])
    .filter(
      (item) =>
        item.repository_id === repo.repository_id && item._instance_id === repo._instance_id,
    )
    .map((item) => ({ provider, item })) as TaggedItem[]

  return (
    <FeedClientView
      items={items}
      repositories={toFeedRepositories(repositories)}
      templates={templates}
      instanceErrors={instanceErrors}
    />
  )
}
