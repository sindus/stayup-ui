import { GitBranch, Youtube, Rss, Globe } from 'lucide-react'
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

type TaggedItem =
  | { provider: 'changelog'; item: ChangelogItem }
  | { provider: 'youtube'; item: YoutubeItem }
  | { provider: 'rss'; item: RssItem }
  | { provider: 'scrap'; item: ScrapItem }

function getItemDate(tagged: TaggedItem): string {
  const item = tagged.item
  if ('datetime' in item && item.datetime) return item.datetime
  return item.executed_at
}

const PROVIDER_ICONS: Record<Provider, React.ComponentType<{ className?: string }>> = {
  changelog: GitBranch,
  youtube: Youtube,
  rss: Rss,
  scrap: Globe,
}

interface UnifiedFeedListProps {
  changelog: ChangelogItem[]
  youtube: YoutubeItem[]
  rss: RssItem[]
  scrap: ScrapItem[]
  repositories?: { repository_id: number; url: string }[]
}

export function UnifiedFeedList({
  changelog,
  youtube,
  rss,
  scrap,
  repositories = [],
}: UnifiedFeedListProps) {
  const all: TaggedItem[] = [
    ...changelog.map((item) => ({ provider: 'changelog' as const, item })),
    ...youtube.map((item) => ({ provider: 'youtube' as const, item })),
    ...rss.map((item) => ({ provider: 'rss' as const, item })),
    ...scrap.map((item) => ({ provider: 'scrap' as const, item })),
  ]

  if (all.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">
        Aucun contenu disponible.
      </p>
    )
  }

  const repoUrlMap = Object.fromEntries(repositories.map((r) => [r.repository_id, r.url]))

  const sorted = all.sort(
    (a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime(),
  )

  return (
    <div className="space-y-4">
      {sorted.map((tagged, i) => {
        const Icon = PROVIDER_ICONS[tagged.provider]
        return (
          <div key={i} className="flex gap-3">
            <div className="mt-1 shrink-0">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              {tagged.provider === 'changelog' && (
                <ChangelogEntry
                  item={tagged.item}
                  repoUrl={repoUrlMap[tagged.item.repository_id] ?? ''}
                />
              )}
              {tagged.provider === 'youtube' && <YoutubeEntry item={tagged.item} />}
              {tagged.provider === 'rss' && <RssEntry item={tagged.item} />}
              {tagged.provider === 'scrap' && <ScrapEntry item={tagged.item} />}
            </div>
          </div>
        )
      })}
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
        <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">
          {item.content
            .replace(/#{1,6}\s/g, '')
            .replace(/\r\n/g, ' ')
            .slice(0, 200)}
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
    /* ignore */
  }

  const inner = (
    <div className="flex gap-3">
      {parsed?.thumbnail && (
        <Image
          src={parsed.thumbnail}
          alt={parsed?.title ?? ''}
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

  const videoUrl = parsed?.link ?? parsed?.url
  if (!videoUrl) return inner

  return (
    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
      {inner}
    </a>
  )
}

function RssEntry({ item }: { item: RssItem }) {
  let parsed: RssItemContent | null = null
  try {
    parsed = JSON.parse(item.content) as RssItemContent
  } catch {
    /* ignore */
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
        <p className="text-sm text-muted-foreground line-clamp-2">{item.content.slice(0, 200)}</p>
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
