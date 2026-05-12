'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TaggedItem } from '@/types'
import { UnifiedFeedList } from './UnifiedFeedList'
import { FeedContentViewer } from './FeedContentViewer'

interface FeedClientViewProps {
  items: TaggedItem[]
  repositories: { repository_id: number; url: string }[]
}

export function FeedClientView({ items, repositories }: FeedClientViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          if (prev === null) return 0
          return Math.min(prev + 1, items.length - 1)
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
  }, [items.length])

  const selected = selectedIndex !== null ? (items[selectedIndex] ?? null) : null

  return (
    <div className="flex flex-1 min-h-0">
      <div
        className="w-[380px] shrink-0 overflow-y-auto border-r"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <UnifiedFeedList
          items={items}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          repositories={repositories}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <FeedContentViewer item={selected} repositories={repositories} />
      </div>
    </div>
  )
}
