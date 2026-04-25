'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Plus, Trash2, LayoutGrid } from 'lucide-react'
import { AddFluxDialog } from './AddFluxDialog'
import { cn } from '@/lib/utils'
import type { Provider, UserRepository } from '@/types'

const PROVIDER_META: Record<
  Provider,
  { label: string; color: string; dimColor: string; icon: React.ReactNode }
> = {
  changelog: {
    label: 'GitHub Changelog',
    color: 'var(--teal)',
    dimColor: 'var(--teal-dim)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L9.5 4H11.5L7 1ZM7 1L4.5 4H2.5L7 1Z" fill="currentColor" opacity="0.8" />
        <rect x="2" y="4" width="10" height="1" rx="0.5" fill="currentColor" />
        <rect x="3" y="6.5" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="3" y="8.5" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  youtube: {
    label: 'YouTube',
    color: 'var(--rose)',
    dimColor: 'var(--rose-dim)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="3" width="12" height="8" rx="2" fill="currentColor" />
        <path d="M5.5 5.5L9 7L5.5 8.5V5.5Z" fill="white" />
      </svg>
    ),
  },
  rss: {
    label: 'RSS',
    color: 'var(--amber)',
    dimColor: 'var(--amber-dim)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <circle cx="3" cy="11" r="1.5" fill="currentColor" />
        <path
          d="M2 7.5C5 7.5 6.5 9 6.5 11.5"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M2 4C7 4 10 7 10 12"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  scrap: {
    label: 'Scraping web',
    color: 'var(--green)',
    dimColor: 'var(--green-dim)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <ellipse cx="7" cy="7" rx="2" ry="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
}

interface FeedSidebarProps {
  fluxes: UserRepository[]
}

export function FeedSidebar({ fluxes }: FeedSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<string | null>(null)

  const byProvider = fluxes.reduce<Partial<Record<Provider, UserRepository[]>>>((acc, flux) => {
    ;(acc[flux.provider] ??= []).push(flux)
    return acc
  }, {})

  const providers = Object.keys(byProvider) as Provider[]

  function isExpanded(provider: Provider) {
    return expanded[provider] !== false
  }

  function toggleExpanded(provider: Provider) {
    setExpanded((prev) => ({ ...prev, [provider]: !isExpanded(provider) }))
  }

  async function handleDelete(flux: UserRepository, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Supprimer "${flux.identifier}" ?`)) return
    setDeleting(flux.id)
    await fetch(`/api/fluxes/${flux.id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  const isAllActive = pathname === '/feed'

  return (
    <aside
      className="w-[220px] shrink-0 overflow-y-auto"
      style={{ borderRight: '1px solid hsl(var(--border))' }}
    >
      <div className="pr-3 pt-1">
        {/* All feed link */}
        <Link
          href="/feed"
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors mb-3',
            isAllActive
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground',
          )}
          style={isAllActive ? { background: 'var(--surface-3)' } : undefined}
        >
          <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
          <span>Tout le feed</span>
        </Link>

        {/* My feeds section */}
        <div className="flex items-center justify-between mb-2 px-2">
          <span
            className="text-[10px] font-mono font-semibold uppercase tracking-widest"
            style={{ color: 'var(--dim)' }}
          >
            Mes flux
          </span>
          <button
            onClick={() => setAddOpen(true)}
            className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
            style={{ border: '1px solid hsl(var(--border))' }}
            aria-label="Ajouter un flux"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {providers.length === 0 ? (
          <div className="py-6 text-center px-2">
            <p className="text-[12px] text-muted-foreground mb-3">Aucun flux</p>
            <button
              onClick={() => setAddOpen(true)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
            >
              + Ajouter
            </button>
          </div>
        ) : (
          <nav className="space-y-0.5">
            {providers.map((provider) => {
              const meta = PROVIDER_META[provider]
              const categoryHref = `/feed/category/${provider}`
              const isCategoryActive = pathname === categoryHref
              const open = isExpanded(provider)
              const count = byProvider[provider]?.length ?? 0

              return (
                <div key={provider}>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => toggleExpanded(provider)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                      {open ? (
                        <ChevronDown className="h-3 w-3 transition-transform" />
                      ) : (
                        <ChevronRight className="h-3 w-3 transition-transform" />
                      )}
                    </button>
                    <Link
                      href={categoryHref}
                      className={cn(
                        'flex flex-1 items-center gap-2 px-2 py-1.5 text-[13px] rounded-md transition-colors',
                        isCategoryActive
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      style={isCategoryActive ? { background: 'var(--surface-3)' } : undefined}
                    >
                      <span style={{ color: meta.color }}>{meta.icon}</span>
                      <span className="truncate flex-1">{meta.label}</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: meta.dimColor, color: meta.color }}
                      >
                        {count}
                      </span>
                    </Link>
                  </div>

                  {open && (
                    <div className="ml-7 mt-0.5 space-y-0.5 mb-1">
                      {(byProvider[provider] ?? []).map((flux) => {
                        const fluxHref = `/feed/flux/${flux.id}`
                        const isActive = pathname === fluxHref

                        return (
                          <div
                            key={flux.id}
                            className={cn(
                              'group flex items-center rounded-md transition-colors',
                              isActive ? '' : 'hover:bg-accent',
                            )}
                            style={isActive ? { background: 'var(--surface-3)' } : undefined}
                          >
                            {isActive && (
                              <div
                                className="w-0.5 h-4 rounded-full mr-1 shrink-0"
                                style={{ background: meta.color }}
                              />
                            )}
                            <Link
                              href={fluxHref}
                              className={cn(
                                'flex-1 truncate px-2 py-1 text-[12px] font-mono',
                                isActive
                                  ? 'text-foreground font-medium'
                                  : 'text-muted-foreground hover:text-foreground',
                              )}
                            >
                              {flux.identifier}
                            </Link>
                            <button
                              onClick={(e) => handleDelete(flux, e)}
                              disabled={deleting === flux.id}
                              className="shrink-0 p-1 mr-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity disabled:opacity-50"
                              aria-label="Supprimer ce flux"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        )}
      </div>

      <AddFluxDialog open={addOpen} onOpenChange={setAddOpen} />
    </aside>
  )
}
