'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FluxCard } from './FluxCard'
import { AddFluxDialog } from './AddFluxDialog'
import type { ChangelogItem, RssItem, ScrapItem, UserRepository, YoutubeItem } from '@/types'

interface FluxListProps {
  fluxes: UserRepository[]
  changelogByRepoId: Record<number, ChangelogItem[]>
  youtubeByRepoId: Record<number, YoutubeItem[]>
  rssByRepoId: Record<number, RssItem[]>
  scrapByRepoId: Record<number, ScrapItem[]>
}

export function FluxList({
  fluxes,
  changelogByRepoId,
  youtubeByRepoId,
  rssByRepoId,
  scrapByRepoId,
}: FluxListProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un flux
        </Button>
      </div>

      <div className="space-y-4">
        {fluxes.map((flux) => (
          <FluxCard
            key={flux.id}
            flux={flux}
            changelogItems={
              flux.provider === 'changelog' ? (changelogByRepoId[flux.repositoryId] ?? []) : []
            }
            youtubeItems={
              flux.provider === 'youtube' ? (youtubeByRepoId[flux.repositoryId] ?? []) : []
            }
            rssItems={flux.provider === 'rss' ? (rssByRepoId[flux.repositoryId] ?? []) : []}
            scrapItems={flux.provider === 'scrap' ? (scrapByRepoId[flux.repositoryId] ?? []) : []}
          />
        ))}
      </div>

      <AddFluxDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
