import Link from 'next/link'
import type { DocVersion } from '@/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface HistoryListProps {
  versions: DocVersion[]
  docId: number
}

export function HistoryList({ versions, docId }: HistoryListProps) {
  if (versions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">
        Aucun historique disponible.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <div
          key={v.id}
          className="flex items-center justify-between border rounded-lg px-4 py-3 bg-card gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-sm font-semibold shrink-0">v{v.version}</span>
            <div className="text-xs text-muted-foreground min-w-0">
              <p>Scrappé le {formatDate(v.scraped_at)}</p>
              {v.archived_at && <p>Archivé le {formatDate(v.archived_at)}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {v.is_current && (
              <Badge variant="secondary" className="text-xs">
                Actuel
              </Badge>
            )}
            {v.has_diff && !v.is_current && (
              <Link
                href={`/documentation/${docId}/diff/${v.id}`}
                className="text-xs text-primary hover:underline"
              >
                Voir les modifications
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
