export type Provider = 'changelog' | 'youtube'

export interface UserFlux {
  id: string
  userId: string
  provider: Provider
  identifier: string
  label: string
  createdAt: string
}

// ─── API raw types ─────────────────────────────────────────────────────────────

export interface ChangelogItem {
  id: number
  provider_id: number
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
  provider_id: number
  version: string // video ID
  content: string // JSON string of YoutubeItemContent
  diff: string | null
  datetime: string | null
  executed_at: string
  success: boolean
}

export type ConnectorItem = ChangelogItem | YoutubeItem

export interface ConnectorData {
  connectors: {
    changelog?: ChangelogItem[]
    youtube?: YoutubeItem[]
  }
}
