import Link from 'next/link'
import type { DocRegistry } from '@/types'
import { formatDate } from '@/lib/utils'
import { SubscribeButton } from './SubscribeButton'

interface DocCardProps {
  doc: DocRegistry
}

export function DocCard({ doc }: DocCardProps) {
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-base truncate">{doc.name}</h2>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground truncate block"
          >
            {doc.url}
          </a>
        </div>
        <SubscribeButton docId={doc.id} isSubscribed={doc.is_subscribed} />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        {doc.current_version !== null ? (
          <p>
            v{doc.current_version}
            {doc.last_scraped_at && <span> · {formatDate(doc.last_scraped_at)}</span>}
          </p>
        ) : (
          <p className="italic">Pas encore scrappé</p>
        )}
      </div>

      {doc.current_version !== null && (
        <Link
          href={`/documentation/${doc.id}`}
          className="text-sm text-primary hover:underline self-start"
        >
          Voir le contenu →
        </Link>
      )}
    </div>
  )
}
