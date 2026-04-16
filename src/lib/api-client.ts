import type { ChangelogItem, ConnectorData, RssItem, ScrapItem, YoutubeItem } from '@/types'

const SERVER_BASE_URL = process.env.STAYUP_API_URL?.replace(/\/$/, '') ?? ''

// ─── JWT token cache (server-side only) ───────────────────────────────────────

let _cachedToken: { token: string; exp: number } | null = null

async function getApiToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (_cachedToken && _cachedToken.exp > now + 60) {
    return _cachedToken.token
  }

  const res = await fetch(`${SERVER_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.STAYUP_API_USERNAME,
      password: process.env.STAYUP_API_PASSWORD,
    }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('Failed to authenticate with StayUp API')

  const { token } = (await res.json()) as { token: string }
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  _cachedToken = { token, exp: payload.exp as number }
  return token
}

async function apiFetch<T>(path: string, init?: RequestInit, attempt = 0): Promise<T> {
  const token = await getApiToken()
  const isGet = !init?.method || init.method === 'GET'
  let res: Response
  try {
    res = await fetch(`${SERVER_BASE_URL}${path}`, {
      method: 'GET',
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      ...(isGet ? { next: { revalidate: 60 } } : { cache: 'no-store' }),
    })
  } catch (err) {
    // Network error (cold start, timeout…): retry once
    if (attempt === 0) return apiFetch<T>(path, init, 1)
    throw err
  }

  if (!res.ok) {
    // 5xx: retry once in case of transient server error
    if (res.status >= 500 && attempt === 0) return apiFetch<T>(path, init, 1)
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `StayUp API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

// ─── Connector data ────────────────────────────────────────────────────────────

export async function getAllConnectors(): Promise<ConnectorData> {
  return apiFetch<ConnectorData>('/connectors')
}

export async function getChangelogItems(): Promise<ChangelogItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: ChangelogItem[] }>(
      '/connectors/changelog',
    )
    return data.data
  } catch {
    return []
  }
}

export async function getYoutubeItems(): Promise<YoutubeItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: YoutubeItem[] }>('/connectors/youtube')
    return data.data
  } catch {
    return []
  }
}

export async function getRssItems(): Promise<RssItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: RssItem[] }>('/connectors/rss')
    return data.data
  } catch {
    return []
  }
}

export async function getScrapItems(): Promise<ScrapItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: ScrapItem[] }>('/connectors/scrap')
    return data.data
  } catch {
    return []
  }
}

// ─── UI user feed (admin service account) ─────────────────────────────────────

export interface UserRepositoryItem {
  id: string
  repository_id: number
  created_at: string
  url: string
  provider: string
  config: Record<string, unknown>
}

export interface UserFeedResponse {
  repositories: UserRepositoryItem[]
  connectors: {
    changelog: ChangelogItem[]
    youtube: YoutubeItem[]
    rss: RssItem[]
    scrap: ScrapItem[]
  }
}

export async function getUserFeed(userId: string): Promise<UserFeedResponse> {
  return apiFetch<UserFeedResponse>(`/ui/users/${userId}/feed`, { cache: 'no-store' })
}

export async function addUserRepository(
  userId: string,
  data: { provider: string; url: string; config: Record<string, unknown> },
): Promise<{ repository: UserRepositoryItem }> {
  return apiFetch<{ repository: UserRepositoryItem }>(`/ui/users/${userId}/repositories`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteUserRepository(userId: string, linkId: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/users/${userId}/repositories/${linkId}`, {
    method: 'DELETE',
  })
}

// ─── Validation ────────────────────────────────────────────────────────────────

export async function validateGithubRepo(identifier: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${identifier}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 300 },
    })
    return res.status === 200
  } catch {
    return false
  }
}

export async function validateFlux(
  provider: string,
  identifier: string,
): Promise<{ valid: boolean; reason?: string }> {
  if (provider === 'changelog') {
    const exists = await validateGithubRepo(identifier)
    if (!exists) {
      return { valid: false, reason: "Ce dépôt GitHub n'existe pas ou est privé." }
    }
    return { valid: true }
  }

  if (provider === 'youtube') {
    return { valid: true }
  }

  if (provider === 'rss') {
    try {
      new URL(identifier)
      return { valid: true }
    } catch {
      return { valid: false, reason: "L'URL du flux RSS n'est pas valide." }
    }
  }

  if (provider === 'scrap') {
    try {
      new URL(identifier)
      return { valid: true }
    } catch {
      return { valid: false, reason: "L'URL de la page à scraper n'est pas valide." }
    }
  }

  return { valid: false, reason: 'Provider inconnu.' }
}
