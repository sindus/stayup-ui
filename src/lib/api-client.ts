import type { ConnectorItem, ScrapRepository, ScrapRequest } from '@/types'
import { getApiUrl } from './apiUrl'

/** Erreur d'appel API porteuse du statut HTTP : brancher sur le texte du message
 *  rendait le code dépendant de la langue et du libellé exact renvoyés par l'API. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
  attempt = 0,
): Promise<T> {
  const isGet = !init?.method || init.method === 'GET'
  const baseUrl = await getApiUrl()

  // `cache` et `next.revalidate` s'excluent : les poser tous les deux (ce que faisait
  // le spread de `init` avant celui du cache) laissait une réponse `no-store` être
  // revalidée à 60 s — un feed figé après l'ajout d'un flux.
  const cacheOptions: RequestInit =
    init && ('cache' in init || 'next' in init)
      ? {}
      : isGet
        ? ({ next: { revalidate: 60 } } as RequestInit)
        : { cache: 'no-store' }

  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      ...cacheOptions,
    })
  } catch (err) {
    // Un POST/DELETE peut avoir été traité avant la coupure : le rejouer créerait
    // un doublon. Seules les lectures sont réessayées.
    if (isGet && attempt === 0) return apiFetch<T>(path, token, init, 1)
    throw err
  }

  if (!res.ok) {
    if (isGet && res.status >= 500 && attempt === 0) {
      return apiFetch<T>(path, token, init, 1)
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new ApiError(res.status, body.error ?? `StayUp API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

// ─── Connectors ────────────────────────────────────────────────────────────────

export interface ConnectorProvider {
  name: string
  displayName: string
}

export async function getConnectorProviders(token: string): Promise<ConnectorProvider[]> {
  const data = await apiFetch<{ providers: ConnectorProvider[] }>('/connectors/providers', token)
  return data.providers
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
  connectors: Record<string, ConnectorItem[]>
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

export async function adminRejectScrapRequest(requestId: string, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/scrap-requests/${requestId}/reject`, token, {
    method: 'POST',
  })
}

// ─── Scrap ─────────────────────────────────────────────────────────────────────

export async function getScrapRepos(token: string): Promise<ScrapRepository[]> {
  const data = await apiFetch<{ repos: ScrapRepository[] }>('/scrap', token, {
    cache: 'no-store',
  })
  return data.repos
}

export async function subscribeScrap(repoId: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/scrap/${repoId}/subscribe`, token, {
    method: 'POST',
  })
}

export async function unsubscribeScrap(repoId: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/scrap/${repoId}/subscribe`, token, {
    method: 'DELETE',
  })
}

export async function createScrapRequest(
  body: { url: string },
  token: string,
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/scrap/requests', token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function adminListScrapRequests(token: string): Promise<ScrapRequest[]> {
  const data = await apiFetch<{ requests: ScrapRequest[] }>('/ui/scrap-requests', token, {
    cache: 'no-store',
  })
  return data.requests
}

export async function adminApproveScrapRequest(
  requestId: string,
  body: { url: string; config: Record<string, unknown> },
  token: string,
): Promise<{ repository_id: number }> {
  return apiFetch<{ repository_id: number }>(`/ui/scrap-requests/${requestId}/approve`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function adminCreateRepository(
  body: { url: string; type: string; config: Record<string, unknown> },
  token: string,
): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/ui/repositories', token, {
    method: 'POST',
    body: JSON.stringify(body),
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

export type FluxValidationError =
  | 'githubRepoNotFound'
  | 'invalidRssUrl'
  | 'invalidScrapUrl'
  | 'invalidUrl'

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/** Renvoie une clé de `t.errors` plutôt qu'un message : la traduction se fait au
 *  point d'affichage, qui seul connaît la langue du visiteur. */
export async function validateFlux(
  provider: string,
  identifier: string,
): Promise<{ valid: boolean; reason?: FluxValidationError }> {
  if (provider === 'changelog') {
    const exists = await validateGithubRepo(identifier)
    return exists ? { valid: true } : { valid: false, reason: 'githubRepoNotFound' }
  }

  if (provider === 'youtube') {
    return { valid: true }
  }

  if (provider === 'rss') {
    return isValidUrl(identifier) ? { valid: true } : { valid: false, reason: 'invalidRssUrl' }
  }

  if (provider === 'scrap') {
    return isValidUrl(identifier) ? { valid: true } : { valid: false, reason: 'invalidScrapUrl' }
  }

  // Provider inconnu du client (ajouté côté base de données uniquement) : on ne
  // connaît pas sa forme d'identifiant, on exige une URL complète et valide.
  return isValidUrl(identifier) ? { valid: true } : { valid: false, reason: 'invalidUrl' }
}
