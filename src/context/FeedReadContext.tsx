'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { TaggedItem } from '@/types'

const LS_KEY = 'STAYUP_READ_ITEMS'

interface ReadContextValue {
  readIds: Set<string>
  markRead: (item: TaggedItem) => void
  markAllRead: (items: TaggedItem[]) => void
}

const ReadContext = createContext<ReadContextValue>({
  readIds: new Set(),
  markRead: () => {},
  markAllRead: () => {},
})

export function useReadContext() {
  return useContext(ReadContext)
}

export function ReadProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) setReadIds(new Set(JSON.parse(stored) as string[]))
    } catch {
      /* ignore */
    }
  }, [])

  const markRead = useCallback((item: TaggedItem) => {
    const id = `${item.provider}:${item.item.id}`
    setReadIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const markAllRead = useCallback((items: TaggedItem[]) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      items.forEach((item) => next.add(`${item.provider}:${item.item.id}`))
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return (
    <ReadContext.Provider value={{ readIds, markRead, markAllRead }}>
      {children}
    </ReadContext.Provider>
  )
}
