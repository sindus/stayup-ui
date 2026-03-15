'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FluxCard } from './FluxCard'
import { AddFluxDialog } from './AddFluxDialog'
import type { ChangelogItem, UserFlux, YoutubeItem } from '@/types'

interface FluxListProps {
  fluxes: UserFlux[]
  changelogItems: ChangelogItem[]
  youtubeItems: YoutubeItem[]
}

export function FluxList({ fluxes, changelogItems, youtubeItems }: FluxListProps) {
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
            changelogItems={flux.provider === 'changelog' ? changelogItems : []}
            youtubeItems={flux.provider === 'youtube' ? youtubeItems : []}
          />
        ))}
      </div>

      <AddFluxDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
