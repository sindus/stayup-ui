import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import type {
  ChangelogItem,
  YoutubeItem,
  YoutubeItemContent,
  RssItem,
  RssItemContent,
  ScrapItem,
  ScrapItemParams,
  Provider,
} from '@/types'
import { formatDate } from '@/lib/utils'

type AnyItem = ChangelogItem | YoutubeItem | RssItem | ScrapItem

function getItemDate(item: AnyItem): string {
  if ('datetime' in item && item.datetime) return item.datetime
  return item.executed_at
}

interface FeedItemListProps {
  items: AnyItem[]
  provider: Provider
}

export function FeedItemList({ items, provider }: FeedItemListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">
        Aucun contenu disponible.
      </p>
    )
  }

  const sorted = [...items].sort(
    (a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime(),
  )

  return (
    <div className="space-y-4">
      {provider === 'changelog' &&
        (sorted as ChangelogItem[]).map((item) => <ChangelogEntry key={item.id} item={item} />)}
      {provider === 'youtube' &&
        (sorted as YoutubeItem[]).map((item) => <YoutubeEntry key={item.id} item={item} />)}
      {provider === 'rss' &&
        (sorted as RssItem[]).map((item) => <RssEntry key={item.id} item={item} />)}
      {provider === 'scrap' &&
        (sorted as ScrapItem[]).map((item) => <ScrapEntry key={item.id} item={item} />)}
    </div>
  )
}

function ChangelogEntry({ item }: { item: ChangelogItem }) {
  return (
    <div className="space-y-1 border-l-2 border-muted pl-3 py-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">{item.version}</span>
        {item.datetime && (
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(item.datetime)}
          </span>
        )}
      </div>
      {item.content && (
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
          {item.content
            .replace(/#{1,6}\s/g, '')
            .replace(/\r\n/g, ' ')
            .slice(0, 300)}
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
    // ignore
  }

  return (
    <div className="flex gap-3">
      {parsed?.thumbnail && (
        <Image
          src={parsed.thumbnail}
          alt={parsed?.title ?? 'Thumbnail'}
          width={120}
          height={68}
          className="object-cover rounded shrink-0"
          unoptimized
        />
      )}
      <div className="space-y-1 min-w-0">
        <p className="font-medium text-sm line-clamp-2">{parsed?.title ?? 'Sans titre'}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(item.datetime ?? item.executed_at)}
        </p>
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

function RssEntry({ item }: { item: RssItem }) {
  let parsed: RssItemContent | null = null
  try {
    parsed = JSON.parse(item.content) as RssItemContent
  } catch {
    // ignore
  }

  return (
    <div className="space-y-1 border-l-2 border-muted pl-3 py-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm line-clamp-1">{parsed?.title ?? 'Sans titre'}</span>
        {item.datetime && (
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(item.datetime)}
          </span>
        )}
      </div>
      {parsed?.summary && (
        <p className="text-sm text-muted-foreground line-clamp-2">{parsed.summary}</p>
      )}
      {parsed?.link && (
        <a
          href={parsed.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Lire <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

function ScrapEntry({ item }: { item: ScrapItem }) {
  const params: ScrapItemParams | null =
    typeof item.params === 'string'
      ? (() => {
          try {
            return JSON.parse(item.params) as ScrapItemParams
          } catch {
            return null
          }
        })()
      : (item.params as ScrapItemParams | null)

  return (
    <div className="space-y-1 border-l-2 border-muted pl-3 py-1">
      <div className="flex items-center justify-between gap-2">
        {params?.url && (
          <span className="font-mono text-xs text-muted-foreground line-clamp-1">{params.url}</span>
        )}
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(item.executed_at)}
        </span>
      </div>
      {item.content && (
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
          {item.content.slice(0, 400)}
        </p>
      )}
      {params?.url && (
        <a
          href={params.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Voir l'article <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}
