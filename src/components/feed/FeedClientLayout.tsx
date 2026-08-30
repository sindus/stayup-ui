'use client'

import { useState, useCallback, useRef, type ReactNode } from 'react'
import { ReadProvider, useReadContext, taggedItemId } from '@/context/FeedReadContext'
import { FeedSidebar } from './FeedSidebar'
import type { UserRepository, TaggedItem } from '@/types'
import type { ProviderMeta } from '@/lib/providerTemplate'

export interface InstanceRef {
  id: string
  name: string
}

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
  instances: InstanceRef[]
  primaryInstanceId: string
  children: ReactNode
}

/** Clé de comptage non-lus par flux : `<instanceId>:<repository_id>`.
 *  `repository_id` n'est unique qu'au sein d'une instance. */
export function unreadKey(instanceId: string | undefined, repositoryId: number | string): string {
  return `${instanceId ?? ''}:${repositoryId}`
}

function FeedClientLayoutInner({
  fluxes,
  allItems,
  templates,
  instances,
  children,
}: Omit<FeedClientLayoutProps, 'primaryInstanceId'>) {
  const { readIds } = useReadContext()
  const { width: sidebarWidth, handleMouseDown: handleSidebarDrag } = useDragResize(220, 150, 420)

  const unreadCountByRepoId: Record<string, number> = {}
  for (const tagged of allItems) {
    if (!readIds.has(taggedItemId(tagged))) {
      const key = unreadKey(
        typeof tagged.item._instance_id === 'string' ? tagged.item._instance_id : '',
        tagged.item.repository_id,
      )
      unreadCountByRepoId[key] = (unreadCountByRepoId[key] ?? 0) + 1
    }
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <FeedSidebar
        fluxes={fluxes}
        templates={templates}
        instances={instances}
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

export function FeedClientLayout({
  fluxes,
  allItems,
  templates,
  instances,
  primaryInstanceId,
  children,
}: FeedClientLayoutProps) {
  return (
    <ReadProvider primaryInstanceId={primaryInstanceId}>
      <FeedClientLayoutInner
        fluxes={fluxes}
        allItems={allItems}
        templates={templates}
        instances={instances}
      >
        {children}
      </FeedClientLayoutInner>
    </ReadProvider>
  )
}
