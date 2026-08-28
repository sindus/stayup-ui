'use client'

import { useState, useCallback, useRef, type ReactNode } from 'react'
import { ReadProvider, useReadContext } from '@/context/FeedReadContext'
import { FeedSidebar } from './FeedSidebar'
import type { UserRepository, TaggedItem } from '@/types'
import type { ProviderMeta } from '@/lib/providerTemplate'

function useDragResize(initial: number, min: number, max: number) {
  const [width, setWidth] = useState(initial)
  const widthRef = useRef(initial)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startW = widthRef.current
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      const onMove = (ev: MouseEvent) => {
        const next = Math.max(min, Math.min(max, startW + (ev.clientX - startX)))
        widthRef.current = next
        setWidth(next)
      }
      const onUp = () => {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [min, max],
  )
  return { width, handleMouseDown }
}

interface FeedClientLayoutProps {
  fluxes: UserRepository[]
  allItems: TaggedItem[]
  templates: Record<string, ProviderMeta>
  children: ReactNode
}

function FeedClientLayoutInner({ fluxes, allItems, templates, children }: FeedClientLayoutProps) {
  const { readIds } = useReadContext()
  const { width: sidebarWidth, handleMouseDown: handleSidebarDrag } = useDragResize(220, 150, 420)

  const unreadCountByRepoId: Record<number, number> = {}
  for (const tagged of allItems) {
    const id = `${tagged.provider}:${tagged.item.id}`
    if (!readIds.has(id)) {
      const repoId = tagged.item.repository_id
      unreadCountByRepoId[repoId] = (unreadCountByRepoId[repoId] ?? 0) + 1
    }
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <FeedSidebar
        fluxes={fluxes}
        templates={templates}
        unreadCountByRepoId={unreadCountByRepoId}
        width={sidebarWidth}
      />
      <div
        className="w-[4px] shrink-0 cursor-col-resize hover:bg-accent transition-colors"
        style={{ borderRight: '1px solid hsl(var(--border))' }}
        onMouseDown={handleSidebarDrag}
      />
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</div>
    </div>
  )
}

export function FeedClientLayout({ fluxes, allItems, templates, children }: FeedClientLayoutProps) {
  return (
    <ReadProvider>
      <FeedClientLayoutInner fluxes={fluxes} allItems={allItems} templates={templates}>
        {children}
      </FeedClientLayoutInner>
    </ReadProvider>
  )
}
