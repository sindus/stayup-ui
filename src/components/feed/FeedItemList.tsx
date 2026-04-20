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
  repositories?: { repository_id: number; url: string }[]
}

export function FeedItemList({ items, provider, repositories = [] }: FeedItemListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">
        Aucun contenu disponible.
      </p>
    )
  }

  const repoUrlMap = Object.fromEntries(repositories.map((r) => [r.repository_id, r.url]))

  const sorted = [...items].sort(
    (a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime(),
  )

  return (
    <div className="space-y-4">
      {provider === 'changelog' &&
        (sorted as ChangelogItem[]).map((item) => (
          <ChangelogEntry
            key={item.id}
            item={item}
            repoUrl={repoUrlMap[item.repository_id] ?? ''}
          />
        ))}
      {provider === 'youtube' &&
        (sorted as YoutubeItem[]).map((item) => <YoutubeEntry key={item.id} item={item} />)}
      {provider === 'rss' &&
        (sorted as RssItem[]).map((item) => <RssEntry key={item.id} item={item} />)}
      {provider === 'scrap' &&
        (sorted as ScrapItem[]).map((item) => <ScrapEntry key={item.id} item={item} />)}
    </div>
  )
}

function ChangelogEntry({ item, repoUrl }: { item: ChangelogItem; repoUrl: string }) {
  const href = repoUrl ? `${repoUrl}/releases/tag/${item.version}` : undefined

  const content = (
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

  if (!href) return content

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
      {content}
    </a>
  )
}

function YoutubeEntry({ item }: { item: YoutubeItem }) {
  let parsed: YoutubeItemContent | null = null
  try {
    parsed = JSON.parse(item.content) as YoutubeItemContent
  } catch {
    // ignore
  }

  const inner = (
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
      </div>
    </div>
  )

  if (!parsed?.url) return inner

  return (
    <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
      {inner}
    </a>
  )
}

function RssEntry({ item }: { item: RssItem }) {
  let parsed: RssItemContent | null = null
  try {
    parsed = JSON.parse(item.content) as RssItemContent
  } catch {
    // ignore
  }

  const inner = (
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
    </div>
  )

  if (!parsed?.link) return inner

  return (
    <a
      href={parsed.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block cursor-pointer"
    >
      {inner}
    </a>
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

  const inner = (
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
    </div>
  )

  if (!params?.url) return inner

  return (
    <a href={params.url} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
      {inner}
    </a>
  )
}
