'use client'

import { useState } from 'react'
import { Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddFluxDialog } from './AddFluxDialog'

export function EmptyFeed() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Rss className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Votre flux est vide</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Ajoutez votre premier flux pour commencer à suivre les mises à jour de vos projets préférés.
      </p>
      <Button onClick={() => setOpen(true)}>Ajouter mon premier flux</Button>
      <AddFluxDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
