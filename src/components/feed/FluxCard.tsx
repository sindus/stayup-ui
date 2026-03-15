'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, Youtube, Trash2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { ChangelogItem, UserFlux, YoutubeItem, YoutubeItemContent } from '@/types'
import { formatDate } from '@/lib/utils'

interface FluxCardProps {
  flux: UserFlux
  changelogItems: ChangelogItem[]
  youtubeItems: YoutubeItem[]
}

export function FluxCard({ flux, changelogItems, youtubeItems }: FluxCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const Icon = flux.provider === 'changelog' ? GitBranch : Youtube

  async function handleDelete() {
    if (!confirm(`Supprimer le flux "${flux.label}" ?`)) return
    setDeleting(true)
    await fetch(`/api/fluxes/${flux.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <CardTitle className="text-base">{flux.label}</CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            {flux.identifier}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {flux.provider === 'changelog' ? 'Changelog' : 'YouTube'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Supprimer ce flux"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {flux.provider === 'changelog' ? (
          changelogItems.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Aucune release disponible.</p>
          ) : (
            <div className="space-y-3">
              {changelogItems.slice(0, 3).map((item) => (
                <ChangelogEntry key={item.id} item={item} />
              ))}
            </div>
          )
        ) : youtubeItems.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucune vidéo disponible.</p>
        ) : (
          <div className="space-y-3">
            {youtubeItems.slice(0, 3).map((item) => (
              <YoutubeEntry key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChangelogEntry({ item }: { item: ChangelogItem }) {
  return (
    <div className="space-y-1 border-l-2 border-muted pl-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">{item.version}</span>
        {item.datetime && (
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(item.datetime)}
          </span>
        )}
      </div>
      {item.content && (
        <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">
          {item.content
            .replace(/#{1,6}\s/g, '')
            .replace(/\r\n/g, ' ')
            .slice(0, 200)}
        </p>
      )}
    </div>
  )
}

function YoutubeEntry({ item }: { item: YoutubeItem }) {
  let parsed: YoutubeItemContent | null = null
  try {
    parsed = JSON.parse(item.content) as YoutubeItemContent
  } catch {
    // ignore parse error
  }

  return (
    <div className="flex gap-3">
      {parsed?.thumbnail && (
        <Image
          src={parsed.thumbnail}
          alt={parsed?.title ?? 'Thumbnail'}
          width={96}
          height={56}
          className="object-cover rounded shrink-0"
          unoptimized
        />
      )}
      <div className="space-y-1 min-w-0">
        <p className="font-medium text-sm line-clamp-2">{parsed?.title ?? 'Sans titre'}</p>
        {item.executed_at && (
          <p className="text-xs text-muted-foreground">{formatDate(item.executed_at)}</p>
        )}
        {parsed?.url && (
          <a
            href={parsed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Regarder <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}
