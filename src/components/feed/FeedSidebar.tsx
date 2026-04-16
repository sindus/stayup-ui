'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  GitBranch,
  Youtube,
  Rss,
  Globe,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddFluxDialog } from './AddFluxDialog'
import { cn } from '@/lib/utils'
import type { Provider, UserRepository } from '@/types'

const PROVIDER_CONFIG: Record<
  Provider,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  changelog: { label: 'GitHub Changelog', icon: GitBranch },
  youtube: { label: 'YouTube', icon: Youtube },
  rss: { label: 'RSS', icon: Rss },
  scrap: { label: 'Scraping web', icon: Globe },
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

  return (
    <aside className="w-56 shrink-0 border-r pr-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Mes flux
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setAddOpen(true)}
          aria-label="Ajouter un flux"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Aucun flux</p>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Ajouter
          </Button>
        </div>
      ) : (
        <nav className="space-y-0.5">
          {providers.map((provider) => {
            const { label, icon: Icon } = PROVIDER_CONFIG[provider]
            const categoryHref = `/feed/category/${provider}`
            const isCategoryActive = pathname === categoryHref
            const open = isExpanded(provider)

            return (
              <div key={provider}>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => toggleExpanded(provider)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded"
                  >
                    {open ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  <Link
                    href={categoryHref}
                    className={cn(
                      'flex flex-1 items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors',
                      isCategoryActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
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
                            isActive ? 'bg-accent' : 'hover:bg-muted',
                          )}
                        >
                          <Link
                            href={fluxHref}
                            className={cn(
                              'flex-1 truncate px-2 py-1 text-sm',
                              isActive
                                ? 'text-accent-foreground font-medium'
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

      <AddFluxDialog open={addOpen} onOpenChange={setAddOpen} />
    </aside>
  )
}
