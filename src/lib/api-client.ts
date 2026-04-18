import type { ChangelogItem, ConnectorData, RssItem, ScrapItem, YoutubeItem } from '@/types'

const SERVER_BASE_URL = process.env.STAYUP_API_URL?.replace(/\/$/, '') ?? ''

async function apiFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
  attempt = 0,
): Promise<T> {
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
    if (attempt === 0) return apiFetch<T>(path, token, init, 1)
    throw err
  }

  if (!res.ok) {
    if (res.status >= 500 && attempt === 0) return apiFetch<T>(path, token, init, 1)
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `StayUp API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

// ─── Connector data ────────────────────────────────────────────────────────────

export async function getAllConnectors(token: string): Promise<ConnectorData> {
  return apiFetch<ConnectorData>('/connectors', token)
}

export async function getChangelogItems(token: string): Promise<ChangelogItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: ChangelogItem[] }>(
      '/connectors/changelog',
      token,
    )
    return data.data
  } catch {
    return []
  }
}

export async function getYoutubeItems(token: string): Promise<YoutubeItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: YoutubeItem[] }>(
      '/connectors/youtube',
      token,
    )
    return data.data
  } catch {
    return []
  }
}

export async function getRssItems(token: string): Promise<RssItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: RssItem[] }>('/connectors/rss', token)
    return data.data
  } catch {
    return []
  }
}

export async function getScrapItems(token: string): Promise<ScrapItem[]> {
  try {
    const data = await apiFetch<{ connector: string; data: ScrapItem[] }>(
      '/connectors/scrap',
      token,
    )
    return data.data
  } catch {
    return []
  }
}

// ─── UI user feed ──────────────────────────────────────────────────────────────

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

export async function getUserFeed(userId: string, token: string): Promise<UserFeedResponse> {
  return apiFetch<UserFeedResponse>(`/ui/users/${userId}/feed`, token, {
    cache: 'no-store',
  })
}

export async function addUserRepository(
  userId: string,
  token: string,
  data: { provider: string; url: string; config: Record<string, unknown> },
): Promise<{ repository: UserRepositoryItem }> {
  return apiFetch<{ repository: UserRepositoryItem }>(`/ui/users/${userId}/repositories`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteUserRepository(
  userId: string,
  linkId: string,
  token: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/users/${userId}/repositories/${linkId}`, token, {
    method: 'DELETE',
  })
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  name: string
  email: string
  created_at: string
}

export interface AdminRepository {
  id: number
  url: string
  type: string
  config: Record<string, unknown>
  subscriber_count: string
}

export async function adminListUsers(token: string): Promise<AdminUser[]> {
  const data = await apiFetch<{ users: AdminUser[] }>('/ui/users', token, {
    cache: 'no-store',
  })
  return data.users
}

export async function adminGetUser(userId: string, token: string): Promise<AdminUser> {
  const data = await apiFetch<{ user: AdminUser }>(`/ui/users/${userId}`, token, {
    cache: 'no-store',
  })
  return data.user
}

export async function adminDeleteUser(userId: string, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/users/${userId}`, token, {
    method: 'DELETE',
  })
}

export async function adminListRepositories(token: string): Promise<AdminRepository[]> {
  const data = await apiFetch<{ repositories: AdminRepository[] }>('/ui/repositories', token, {
    cache: 'no-store',
  })
  return data.repositories
}

export async function adminDeleteRepository(repoId: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/repositories/${repoId}`, token, {
    method: 'DELETE',
  })
}

export async function adminClearRepositoryData(repoId: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/repositories/${repoId}/data`, token, {
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
