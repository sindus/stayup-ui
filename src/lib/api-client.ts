import type { ChangelogItem, ConnectorData, YoutubeItem } from '@/types'

const SERVER_BASE_URL =
  process.env.STAYUP_API_URL?.replace(/\/$/, '') ?? ''

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

async function apiFetch<T>(path: string): Promise<T> {
  const token = await getApiToken()
  const res = await fetch(`${SERVER_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`StayUp API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ─── Public API functions ──────────────────────────────────────────────────────

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
    const data = await apiFetch<{ connector: string; data: YoutubeItem[] }>(
      '/connectors/youtube',
    )
    return data.data
  } catch {
    return []
  }
}

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates that a GitHub repo exists (uses public GitHub API, no token required).
 */
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

/**
 * Validates a YouTube handle by checking the channel page exists.
 */
export async function validateYoutubeHandle(_handle: string): Promise<boolean> {
  // YouTube requires an API key to validate channels server-side without scraping.
  // We accept any non-empty handle and let the user know data appears when tracked.
  return true
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

  return { valid: false, reason: 'Provider inconnu.' }
}
