'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FluxCard } from './FluxCard'
import { AddFluxDialog } from './AddFluxDialog'
import type { ChangelogItem, RssItem, ScrapItem, UserFlux, YoutubeItem } from '@/types'

interface FluxListProps {
  fluxes: UserFlux[]
  changelogByIdentifier: Record<string, ChangelogItem[]>
  youtubeByIdentifier: Record<string, YoutubeItem[]>
  rssByIdentifier: Record<string, RssItem[]>
  scrapByIdentifier: Record<string, ScrapItem[]>
}

export function FluxList({
  fluxes,
  changelogByIdentifier,
  youtubeByIdentifier,
  rssByIdentifier,
  scrapByIdentifier,
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
              flux.provider === 'changelog' ? (changelogByIdentifier[flux.identifier] ?? []) : []
            }
            youtubeItems={
              flux.provider === 'youtube' ? (youtubeByIdentifier[flux.identifier] ?? []) : []
            }
            rssItems={flux.provider === 'rss' ? (rssByIdentifier[flux.identifier] ?? []) : []}
            scrapItems={flux.provider === 'scrap' ? (scrapByIdentifier[flux.identifier] ?? []) : []}
          />
        ))}
      </div>

      <AddFluxDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
