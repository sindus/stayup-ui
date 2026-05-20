'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { TaggedItem } from '@/types'
import { UnifiedFeedList } from './UnifiedFeedList'
import { FeedContentViewer } from './FeedContentViewer'
import { useReadContext } from '@/context/FeedReadContext'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

interface FeedClientViewProps {
  items: TaggedItem[]
  repositories: { repository_id: number; url: string }[]
}

type FilterMode = 'all' | 'unread'

export function FeedClientView({ items, repositories }: FeedClientViewProps) {
  const { readIds, markRead, markAllRead } = useReadContext()
  const { t } = useLanguage()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')

  const filteredItems = useMemo(() => {
    if (filterMode === 'unread') {
      return items.filter((item) => !readIds.has(`${item.provider}:${item.item.id}`))
    }
    return items
  }, [items, readIds, filterMode])

  useEffect(() => {
    setSelectedIndex(null)
  }, [filterMode])

  const handleSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index)
      const item = filteredItems[index]
      if (item) markRead(item)
    },
    [filteredItems, markRead],
  )

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          if (prev === null) return 0
          return Math.min(prev + 1, filteredItems.length - 1)
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          if (prev === null) return 0
          return Math.max(prev - 1, 0)
        })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [filteredItems.length])

  // Mark selected item as read
  useEffect(() => {
    if (selectedIndex === null) return
    const item = filteredItems[selectedIndex]
    if (item) markRead(item)
  }, [selectedIndex, filteredItems, markRead])

  const unreadCount = useMemo(
    () => items.filter((item) => !readIds.has(`${item.provider}:${item.item.id}`)).length,
    [items, readIds],
  )

  const selected = selectedIndex !== null ? (filteredItems[selectedIndex] ?? null) : null

  return (
    <div className="flex flex-1 min-h-0">
      <div
        className="w-[380px] shrink-0 flex flex-col"
        style={{ borderRight: '1px solid hsl(var(--border))' }}
      >
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
              className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
            >
              {t.feed.markAllRead}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <UnifiedFeedList
            items={filteredItems}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            repositories={repositories}
            readIds={readIds}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <FeedContentViewer item={selected} repositories={repositories} />
      </div>
    </div>
  )
}
