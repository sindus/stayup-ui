import { resolveFeedLabel } from '@/lib/providerTemplate'
import { fanoutFeed } from '@/lib/feed-fanout'
import { decodeToken } from '@/lib/session'
import { FeedClientLayout } from '@/components/feed/FeedClientLayout'
import type { Provider, UserRepository, TaggedItem } from '@/types'

export default async function FeedLayout({ children }: { children: React.ReactNode }) {
  const { instances, repositories, connectors, templates } = await fanoutFeed()

  const userIdByInstance = new Map(
    instances.map((i) => {
      try {
        return [i.id, decodeToken(i.token).userId]
      } catch {
        return [i.id, '']
      }
    }),
  )

  const fluxes: UserRepository[] = repositories.map((repo) => ({
    id: repo.id,
    userId: userIdByInstance.get(repo._instance_id) ?? '',
    repositoryId: repo.repository_id,
    provider: repo.provider as Provider,
    url: repo.url,
    identifier: resolveFeedLabel(templates[repo.provider]?.template ?? null, {
      url: repo.url,
      config: repo.config ?? {},
    }),
    config: repo.config ?? {},
    createdAt: repo.created_at,
    instanceId: repo._instance_id,
    instanceName: repo._instance_name ?? '',
  }))

  const allItems: TaggedItem[] = Object.entries(connectors).flatMap(([provider, providerItems]) =>
    providerItems.map((item) => ({ provider, item })),
  ) as TaggedItem[]

  return (
    <FeedClientLayout
      fluxes={fluxes}
      allItems={allItems}
      templates={templates}
      instances={instances.map((i) => ({ id: i.id, name: i.name }))}
      primaryInstanceId={instances[0]?.id ?? ''}
    >
      {children}
    </FeedClientLayout>
  )
}
