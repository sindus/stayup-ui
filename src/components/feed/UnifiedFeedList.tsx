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

const PROVIDER_COLORS: Record<Provider, string> = {
  changelog: 'var(--teal)',
  youtube: 'var(--rose)',
  rss: 'var(--amber)',
  scrap: 'var(--green)',
}

const PROVIDER_DIM: Record<Provider, string> = {
  changelog: 'var(--teal-dim)',
  youtube: 'var(--rose-dim)',
  rss: 'var(--amber-dim)',
  scrap: 'var(--green-dim)',
}

const PROVIDER_ICONS: Record<Provider, React.ReactNode> = {
  changelog: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L9.5 4H11.5L7 1ZM7 1L4.5 4H2.5L7 1Z" fill="currentColor" opacity="0.8" />
      <rect x="2" y="4" width="10" height="1" rx="0.5" fill="currentColor" />
      <rect x="3" y="6.5" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="3" y="8.5" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" rx="2" fill="currentColor" />
      <path d="M5.5 5.5L9 7L5.5 8.5V5.5Z" fill="white" />
    </svg>
  ),
  rss: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
  scrap: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <ellipse cx="7" cy="7" rx="2" ry="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
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
    <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
      {sorted.map((tagged, i) => {
        const color = PROVIDER_COLORS[tagged.provider]
        const icon = PROVIDER_ICONS[tagged.provider]
        return (
          <div
            key={i}
            className="flex gap-3 px-1 py-3 transition-colors"
            style={{ '--hover-bg': 'var(--surface-2)' } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ''
            }}
          >
            <div className="mt-1 shrink-0" style={{ color }}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              {tagged.provider === 'changelog' && (
                <ChangelogEntry
                  item={tagged.item}
                  repoUrl={repoUrlMap[tagged.item.repository_id] ?? ''}
                  color={color}
                  dimColor={PROVIDER_DIM[tagged.provider]}
                />
              )}
              {tagged.provider === 'youtube' && <YoutubeEntry item={tagged.item} color={color} />}
              {tagged.provider === 'rss' && <RssEntry item={tagged.item} />}
              {tagged.provider === 'scrap' && <ScrapEntry item={tagged.item} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ChangelogEntry({
  item,
  repoUrl,
  color,
  dimColor,
}: {
  item: ChangelogItem
  repoUrl: string
  color: string
  dimColor: string
}) {
  const href = repoUrl ? `${repoUrl}/releases/tag/${item.version}` : undefined

  const content = (
    <div className="pl-3 py-1" style={{ borderLeft: '2px solid hsl(var(--border))' }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-muted-foreground truncate">
            {repoUrl?.replace('https://github.com/', '') ?? 'repository'}
          </span>
          <span
            className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded"
            style={{ background: dimColor, color }}
          >
            {item.version}
          </span>
        </div>
        {item.datetime && (
          <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--dim)' }}>
            {formatDate(item.datetime)}
          </span>
        )}
      </div>
      {item.content && (
        <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">
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

function YoutubeEntry({ item, color }: { item: YoutubeItem; color: string }) {
  let parsed: YoutubeItemContent | null = null
  try {
    parsed = JSON.parse(item.content) as YoutubeItemContent
  } catch {
    /* ignore */
  }

  const inner = (
    <div className="flex gap-3">
      <div
        className="w-24 h-[54px] rounded shrink-0 flex items-center justify-center"
        style={{ background: 'var(--surface-2)' }}
      >
        {parsed?.thumbnail ? (
          <Image
            src={parsed.thumbnail}
            alt={parsed?.title ?? ''}
            width={96}
            height={54}
            className="object-cover rounded w-full h-full"
            unoptimized
          />
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color }}>
            <circle
              cx="10"
              cy="10"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
            <path d="M8 7L14 10L8 13V7Z" fill="currentColor" />
          </svg>
        )}
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-[13.5px] font-medium line-clamp-2 leading-snug">
          {parsed?.title ?? 'Sans titre'}
        </p>
        <p className="text-[11px] font-mono text-muted-foreground">
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
    <div className="pl-3 py-1" style={{ borderLeft: '2px solid hsl(var(--border))' }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[13.5px] font-medium line-clamp-1">
          {parsed?.title ?? 'Sans titre'}
        </span>
        {item.datetime && (
          <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--dim)' }}>
            {formatDate(item.datetime)}
          </span>
        )}
      </div>
      {parsed?.summary && (
        <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">
          {parsed.summary}
        </p>
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
    <div className="pl-3 py-1" style={{ borderLeft: '2px solid hsl(var(--border))' }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        {params?.url && (
          <span className="text-[12px] font-mono text-muted-foreground line-clamp-1 truncate">
            {params.url}
          </span>
        )}
        <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--dim)' }}>
          {formatDate(item.executed_at)}
        </span>
      </div>
      {item.content && (
        <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">
          {item.content.slice(0, 200)}
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
