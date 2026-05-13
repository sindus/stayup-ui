'use client'

import type { DocRegistry } from '@/types'
import { DocCard } from './DocCard'
import { useLanguage } from '@/context/LanguageContext'

interface DocListProps {
  docs: DocRegistry[]
  emptyMessage?: string
}

export function DocList({ docs, emptyMessage }: DocListProps) {
  const { t } = useLanguage()
  const message = emptyMessage ?? t.documentation.noContent

  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground italic py-12 text-center">{message}</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <DocCard key={doc.id} doc={doc} />
      ))}
    </div>
  )
}
