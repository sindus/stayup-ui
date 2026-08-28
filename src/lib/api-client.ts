import type { ConnectorItem, FluxRequest, ProviderFlux } from '@/types'
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
  /** `auto` : l'ajout d'un flux est immédiat ; `manual` : il passe par une demande. */
  fluxApproval?: 'auto' | 'manual'
  /** Manifeste d'affichage brut (provider_registry.template), relayé tel quel. */
  template?: unknown
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

/** L'API répond soit `{ repository }` (flux créé), soit `202 { status: 'pending' }`
 *  quand le provider est en mode `manual` : la demande part en file d'approbation. */
export type AddRepositoryResult =
  | { repository: UserRepositoryItem; status?: undefined }
  | { status: 'pending'; request: FluxRequest }

export async function addUserRepository(
  userId: string,
  token: string,
  data: { provider: string; url: string; config: Record<string, unknown> },
): Promise<AddRepositoryResult> {
  return apiFetch<AddRepositoryResult>(`/ui/users/${userId}/repositories`, token, {
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

// ─── Admin accounts (super-admin only) ─────────────────────────────────────────

export interface AdminAccount {
  id: string
  email: string
  name: string
  is_super: boolean
  created_at: string
}

export async function adminListAdmins(token: string): Promise<AdminAccount[]> {
  const data = await apiFetch<{ admins: AdminAccount[] }>('/ui/admins', token, {
    cache: 'no-store',
  })
  return data.admins
}

export async function adminCreateAdmin(
  body: { email: string; name: string; password: string },
  token: string,
): Promise<{ admin: AdminAccount }> {
  return apiFetch<{ admin: AdminAccount }>('/ui/admins', token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function adminUpdateAdmin(
  id: string,
  body: { name?: string; email?: string; password?: string },
  token: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/admins/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function adminDeleteAdmin(id: string, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/admins/${id}`, token, {
    method: 'DELETE',
  })
}

export async function adminChangeOwnPassword(
  body: { currentPassword: string; password: string },
  token: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>('/ui/admins/me', token, {
    method: 'PATCH',
    body: JSON.stringify(body),
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

// ─── Provider fluxes (liste des flux existants + abonnement) ───────────────────

export async function getProviderFluxes(provider: string, token: string): Promise<ProviderFlux[]> {
  const data = await apiFetch<{ fluxes: ProviderFlux[] }>(`/providers/${provider}/fluxes`, token, {
    cache: 'no-store',
  })
  return data.fluxes
}

export async function subscribeFlux(provider: string, id: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/providers/${provider}/fluxes/${id}/subscribe`, token, {
    method: 'POST',
  })
}

export async function unsubscribeFlux(provider: string, id: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/providers/${provider}/fluxes/${id}/subscribe`, token, {
    method: 'DELETE',
  })
}

// ─── Admin — providers & flux requests ────────────────────────────────────────

export async function adminListProviders(
  token: string,
): Promise<{ name: string; displayName: string; flux_approval: 'auto' | 'manual' }[]> {
  const data = await apiFetch<{
    providers: { name: string; displayName: string; flux_approval: 'auto' | 'manual' }[]
  }>('/ui/providers', token, { cache: 'no-store' })
  return data.providers
}

export async function adminSetProviderApproval(
  name: string,
  flux_approval: 'auto' | 'manual',
  token: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/providers/${name}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ flux_approval }),
  })
}

export async function adminListFluxRequests(token: string): Promise<FluxRequest[]> {
  const data = await apiFetch<{ requests: FluxRequest[] }>('/ui/flux-requests', token, {
    cache: 'no-store',
  })
  return data.requests
}

export async function adminApproveFluxRequest(
  requestId: string,
  body: { config?: Record<string, unknown> },
  token: string,
): Promise<{ repository_id: number }> {
  return apiFetch<{ repository_id: number }>(`/ui/flux-requests/${requestId}/approve`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function adminRejectFluxRequest(requestId: string, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/flux-requests/${requestId}/reject`, token, {
    method: 'POST',
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
