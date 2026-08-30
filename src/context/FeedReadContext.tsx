'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { TaggedItem } from '@/types'

const LS_KEY = 'STAYUP_READ_ITEMS'

/** Clé d'un item lu : `<instanceId>:<provider>:<id>`. Le segment instance lève
 *  l'ambiguïté quand deux instances d'API ont des id de ligne qui se chevauchent. */
export function taggedItemId(item: TaggedItem): string {
  const instanceId = typeof item.item._instance_id === 'string' ? item.item._instance_id : ''
  return `${instanceId}:${item.provider}:${item.item.id}`
}

/** Repréfixe les clés « pré-multi-instance » (`provider:id`) avec l'id de la
 *  primaire. Les clés déjà à 3 segments passent inchangées. */
export function migrateReadIds(stored: string[], primaryInstanceId: string): string[] {
  if (!primaryInstanceId) return stored
  return stored.map((id) => (id.split(':').length === 2 ? `${primaryInstanceId}:${id}` : id))
}

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

export function ReadProvider({
  children,
  primaryInstanceId = '',
}: {
  children: ReactNode
  primaryInstanceId?: string
}) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) {
        setReadIds(new Set(migrateReadIds(JSON.parse(stored) as string[], primaryInstanceId)))
      }
    } catch {
      /* ignore */
    }
  }, [primaryInstanceId])

  const markRead = useCallback((item: TaggedItem) => {
    const id = taggedItemId(item)
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
      items.forEach((item) => next.add(taggedItemId(item)))
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
