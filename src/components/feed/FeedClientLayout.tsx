'use client'

import { useMemo, type ReactNode } from 'react'
import { ReadProvider, useReadContext } from '@/context/FeedReadContext'
import { FeedSidebar } from './FeedSidebar'
import type { UserRepository, TaggedItem } from '@/types'

interface FeedClientLayoutProps {
  fluxes: UserRepository[]
  allItems: TaggedItem[]
  children: ReactNode
}

function FeedClientLayoutInner({ fluxes, allItems, children }: FeedClientLayoutProps) {
  const { readIds } = useReadContext()

  const unreadCountByRepoId = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const tagged of allItems) {
      const id = `${tagged.provider}:${tagged.item.id}`
      if (!readIds.has(id)) {
        const repoId = tagged.item.repository_id
        counts[repoId] = (counts[repoId] ?? 0) + 1
      }
    }
    return counts
  }, [allItems, readIds])

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <FeedSidebar fluxes={fluxes} unreadCountByRepoId={unreadCountByRepoId} />
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</div>
    </div>
  )
}

export function FeedClientLayout({ fluxes, allItems, children }: FeedClientLayoutProps) {
  return (
    <ReadProvider>
      <FeedClientLayoutInner fluxes={fluxes} allItems={allItems}>
        {children}
      </FeedClientLayoutInner>
    </ReadProvider>
  )
}
