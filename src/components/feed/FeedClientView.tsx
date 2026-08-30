'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { CheckCheck } from 'lucide-react'
import type { TaggedItem, FeedRepository } from '@/types'
import type { ProviderMeta } from '@/lib/providerTemplate'
import { UnifiedFeedList } from './UnifiedFeedList'
import { FeedContentViewer } from './FeedContentViewer'
import { useReadContext, taggedItemId } from '@/context/FeedReadContext'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

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

const getItemId = taggedItemId

interface FeedClientViewProps {
  items: TaggedItem[]
  repositories: FeedRepository[]
  templates: Record<string, ProviderMeta>
  instanceErrors?: { instanceId: string; instanceName: string }[]
}

type FilterMode = 'all' | 'unread'

export function FeedClientView({
  items,
  repositories,
  templates,
  instanceErrors = [],
}: FeedClientViewProps) {
  const { readIds, markRead, markAllRead } = useReadContext()
  const { t } = useLanguage()
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const { width: listWidth, handleMouseDown: handleListDrag } = useDragResize(380, 260, 600)
  // Track open item by ID so it stays stable when filteredItems changes
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  // In "unread" mode: show unread items + the currently open item so it doesn't
  // vanish while the user is reading it. It disappears only when another item is opened.
  const filteredItems = useMemo(() => {
    if (filterMode === 'unread') {
      return items.filter((item) => !readIds.has(getItemId(item)) || getItemId(item) === openItemId)
    }
    return items
  }, [items, readIds, filterMode, openItemId])

  // Refs so the keyboard handler always reads current values without re-registering
  const filteredItemsRef = useRef(filteredItems)
  filteredItemsRef.current = filteredItems
  const openItemIdRef = useRef(openItemId)
  openItemIdRef.current = openItemId

  // Derive selectedIndex from openItemId — stable even when list shrinks
  const selectedIndex = useMemo(() => {
    if (openItemId === null) return null
    const idx = filteredItems.findIndex((i) => getItemId(i) === openItemId)
    return idx === -1 ? null : idx
  }, [filteredItems, openItemId])

  const selected = useMemo(
    () =>
      openItemId !== null ? (filteredItems.find((i) => getItemId(i) === openItemId) ?? null) : null,
    [filteredItems, openItemId],
  )

  const handleSelect = useCallback(
    (index: number) => {
      const item = filteredItems[index]
      if (!item) return
      setOpenItemId(getItemId(item))
    },
    [filteredItems],
  )

  // Mark the open item as read after openItemId is committed, so the filter
  // keeps it visible during the same render cycle (readIds updates after).
  useEffect(() => {
    if (openItemId === null) return
    const item = items.find((i) => getItemId(i) === openItemId)
    if (item) markRead(item)
  }, [openItemId, items, markRead])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const current = filteredItemsRef.current
      const currentId = openItemIdRef.current
      const currentIdx =
        currentId !== null ? current.findIndex((i) => getItemId(i) === currentId) : -1

      let nextIdx: number | null = null
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        nextIdx = currentIdx === -1 ? 0 : Math.min(currentIdx + 1, current.length - 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        nextIdx = currentIdx === -1 ? 0 : Math.max(currentIdx - 1, 0)
      }

      if (nextIdx !== null) {
        const nextItem = current[nextIdx]
        if (nextItem) {
          setOpenItemId(getItemId(nextItem))
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const unreadCount = useMemo(
    () => items.filter((item) => !readIds.has(getItemId(item))).length,
    [items, readIds],
  )

  return (
    <div className="flex flex-1 min-h-0">
      <div className="shrink-0 flex flex-col" style={{ width: listWidth }}>
        {instanceErrors.length > 0 && (
          <div
            className="px-3 py-2 text-[13px] shrink-0"
            style={{ background: 'var(--rose-dim)', color: 'var(--rose)' }}
          >
            {t.feed.instanceUnreachable.replace(
              '{names}',
              instanceErrors.map((e) => e.instanceName).join(', '),
            )}
          </div>
        )}
        {/* Filter bar */}
        <div
          className="flex items-center gap-1 px-3 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={() => setFilterMode('all')}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded text-[15px] transition-colors',
              filterMode === 'all'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
            style={filterMode === 'all' ? { background: 'var(--surface-3)' } : undefined}
          >
            {t.feed.filterAll}
            <span
              className="text-[13px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-2)', color: 'var(--dim)' }}
            >
              {items.length}
            </span>
          </button>
          <button
            onClick={() => setFilterMode('unread')}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded text-[15px] transition-colors',
              filterMode === 'unread'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
            style={filterMode === 'unread' ? { background: 'var(--surface-3)' } : undefined}
          >
            {t.feed.filterUnread}
            {unreadCount > 0 && (
              <span
                className="text-[13px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          <div className="flex-1" />
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead(items)}
              title={t.feed.markAllRead}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <CheckCheck size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <UnifiedFeedList
            items={filteredItems}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            repositories={repositories}
            templates={templates}
            readIds={readIds}
          />
        </div>
      </div>
      <div
        className="w-[4px] shrink-0 cursor-col-resize hover:bg-accent transition-colors"
        style={{ borderRight: '1px solid hsl(var(--border))' }}
        onMouseDown={handleListDrag}
      />
      <div className="flex-1 overflow-y-auto">
        <FeedContentViewer item={selected} repositories={repositories} templates={templates} />
      </div>
    </div>
  )
}
