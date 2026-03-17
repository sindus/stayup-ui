'use client'

import { Shimmer } from '@shimmer-from-structure/react'
import { FluxCard } from '@/components/feed/FluxCard'
import type { ChangelogItem, UserFlux } from '@/types'

const templateFlux: UserFlux = {
  id: 'skeleton',
  userId: 'skeleton',
  provider: 'changelog',
  identifier: 'owner/repository-name',
  label: 'Nom du flux en chargement...',
  createdAt: new Date().toISOString(),
}

const templateChangelogs: ChangelogItem[] = [
  {
    id: 1,
    provider_id: 0,
    content: 'Chargement du contenu de la release...',
    diff: null,
    datetime: new Date().toISOString(),
    executed_at: new Date().toISOString(),
    success: true,
    version: 'v1.0.0',
  },
  {
    id: 2,
    provider_id: 0,
    content: 'Chargement du contenu de la release...',
    diff: null,
    datetime: new Date().toISOString(),
    executed_at: new Date().toISOString(),
    success: true,
    version: 'v0.9.0',
  },
  {
    id: 3,
    provider_id: 0,
    content: 'Chargement du contenu de la release...',
    diff: null,
    datetime: new Date().toISOString(),
    executed_at: new Date().toISOString(),
    success: true,
    version: 'v0.8.0',
  },
]

export default function FeedLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mon flux</h1>
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <Shimmer key={i} loading={true}>
            <FluxCard
              flux={templateFlux}
              changelogItems={templateChangelogs}
              youtubeItems={[]}
            />
          </Shimmer>
        ))}
      </div>
    </div>
  )
}
