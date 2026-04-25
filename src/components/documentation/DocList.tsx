import type { DocRegistry } from '@/types'
import { DocCard } from './DocCard'

interface DocListProps {
  docs: DocRegistry[]
  emptyMessage?: string
}

export function DocList({ docs, emptyMessage = 'Aucune documentation disponible.' }: DocListProps) {
  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground italic py-12 text-center">{emptyMessage}</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <DocCard key={doc.id} doc={doc} />
      ))}
    </div>
  )
}
