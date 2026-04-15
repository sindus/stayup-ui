export type Provider = 'changelog' | 'youtube' | 'rss' | 'scrap'

export interface UserFlux {
  id: string
  userId: string
  provider: Provider
  identifier: string
  label: string
  params: string | null
  createdAt: string
}

// ─── API raw types ─────────────────────────────────────────────────────────────

export interface ChangelogItem {
  id: number
  repository_id: number
  content: string
  diff: string | null
  datetime: string | null
  executed_at: string
  success: boolean
  version: string
}

export interface YoutubeItemContent {
  title: string
  thumbnail: string
  url: string
}

export interface YoutubeItem {
  id: number
  repository_id: number
  version: string // video ID
  content: string // JSON string of YoutubeItemContent
  diff: string | null
  datetime: string | null
  executed_at: string
  success: boolean
}

export interface RssItemContent {
  version: string // entry id used as unique identifier
  title: string
  link: string
  summary: string
}

export interface RssItem {
  id: number
  repository_id: number
  content: string // JSON string of RssItemContent
  datetime: string | null
  executed_at: string
  success: boolean
}

export interface ScrapItemParams {
  url: string
  articles_selector: string
  content_selector: string
  [key: string]: string
}

export interface ScrapItem {
  id: number
  repository_id: number
  content: string // scraped text
  params: ScrapItemParams | string // JSONB from DB
  executed_at: string
  success: boolean
}

export type ConnectorItem = ChangelogItem | YoutubeItem | RssItem | ScrapItem

export interface ConnectorData {
  connectors: {
    changelog?: ChangelogItem[]
    youtube?: YoutubeItem[]
    rss?: RssItem[]
    scrap?: ScrapItem[]
  }
}
