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
  baseUrlOverride?: string,
): Promise<T> {
  const isGet = !init?.method || init.method === 'GET'
  const baseUrl = baseUrlOverride ?? (await getApiUrl())

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
    if (isGet && attempt === 0) return apiFetch<T>(path, token, init, 1, baseUrlOverride)
    throw err
  }

  if (!res.ok) {
    if (isGet && res.status >= 500 && attempt === 0) {
      return apiFetch<T>(path, token, init, 1, baseUrlOverride)
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new ApiError(res.status, body.error ?? `StayUp API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

// ─── Auth config ──────────────────────────────────────────────────────────────

export interface AuthConfig {
  /** Nom d'affichage de l'instance (INSTANCE_NAME côté API), sinon `null`. */
  name?: string | null
  registrationMode: 'open' | 'approval'
  emailPassword: boolean
  oauth: { google: boolean; github: boolean }
}

/** Ce qu'un client doit savoir avant l'écran de connexion. `null` si l'API ne
 *  répond pas ou est trop ancienne pour exposer `/auth/config` — l'appelant
 *  retombe alors sur « tout est proposé ». Non authentifié. `baseUrl` cible une
 *  instance précise (ajout d'une instance secondaire). */
function isAuthConfig(v: unknown): v is AuthConfig {
  if (!v || typeof v !== 'object') return false
  const c = v as Record<string, unknown>
  const o = c.oauth as Record<string, unknown> | null | undefined
  return (
    typeof c.emailPassword === 'boolean' &&
    !!o &&
    typeof o === 'object' &&
    typeof o.github === 'boolean' &&
    typeof o.google === 'boolean'
  )
}

/** Résultat d'une sonde d'URL d'API : `unreachable` = rien ne répond ;
 *  `incompatible` = ça répond mais ce n'est pas une API StayUp. */
export type ApiProbe =
  | { ok: true; config: AuthConfig }
  | { ok: false; reason: 'unreachable' | 'incompatible' }

/** Vérifie qu'une URL pointe sur une API StayUp joignable : `GET /auth/config`
 *  doit répondre 2xx avec la forme attendue. */
export async function probeApiUrl(baseUrl?: string): Promise<ApiProbe> {
  const base = (baseUrl ?? (await getApiUrl())).replace(/\/$/, '')
  let res: Response
  try {
    res = await fetch(`${base}/auth/config`, { cache: 'no-store' })
  } catch {
    return { ok: false, reason: 'unreachable' }
  }
  if (!res.ok) return { ok: false, reason: 'incompatible' }
  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { ok: false, reason: 'incompatible' }
  }
  return isAuthConfig(body) ? { ok: true, config: body } : { ok: false, reason: 'incompatible' }
}

export async function fetchAuthConfig(baseUrl?: string): Promise<AuthConfig | null> {
  const probe = await probeApiUrl(baseUrl)
  return probe.ok ? probe.config : null
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

export async function getConnectorProviders(
  token: string,
  baseUrl?: string,
): Promise<ConnectorProvider[]> {
  const data = await apiFetch<{ providers: ConnectorProvider[] }>(
    '/connectors/providers',
    token,
    undefined,
    0,
    baseUrl,
  )
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

export async function getUserFeed(
  userId: string,
  token: string,
  baseUrl?: string,
): Promise<UserFeedResponse> {
  return apiFetch<UserFeedResponse>(
    `/ui/users/${userId}/feed`,
    token,
    { cache: 'no-store' },
    0,
    baseUrl,
  )
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
  baseUrl?: string,
): Promise<AddRepositoryResult> {
  return apiFetch<AddRepositoryResult>(
    `/ui/users/${userId}/repositories`,
    token,
    { method: 'POST', body: JSON.stringify(data) },
    0,
    baseUrl,
  )
}

export async function deleteUserRepository(
  userId: string,
  linkId: string,
  token: string,
  baseUrl?: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>(
    `/ui/users/${userId}/repositories/${linkId}`,
    token,
    { method: 'DELETE' },
    0,
    baseUrl,
  )
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

// ─── Pending sign-ups (REGISTRATION_MODE=approval) ────────────────────────────

export interface AdminPendingUser {
  id: string
  name: string
  email: string
  /** 'password' for an e-mail sign-up, otherwise the OAuth provider name. */
  method: string
  created_at: string
}

export async function adminListPendingUsers(token: string): Promise<AdminPendingUser[]> {
  const data = await apiFetch<{ users: AdminPendingUser[] }>('/ui/users/pending', token, {
    cache: 'no-store',
  })
  return data.users
}

export async function adminApprovePendingUser(id: string, token: string): Promise<void> {
  await apiFetch<{ user: AdminUser }>(`/ui/users/pending/${id}/approve`, token, {
    method: 'POST',
  })
}

export async function adminRejectPendingUser(id: string, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/users/pending/${id}/reject`, token, {
    method: 'POST',
  })
}

// ─── Secondary data sources ──────────────────────────────────────────────────

export interface DataSource {
  id: number
  name: string
  engine: string
  host: string
  created_at: string
}

export interface DataSourcesResponse {
  primary: { engine: string; host: string }
  sources: DataSource[]
}

export type DataSourceProbe =
  | { ok: true; engine: string; connectors: string[] }
  | { ok: false; error: string }

export async function adminListDataSources(token: string): Promise<DataSourcesResponse> {
  return apiFetch<DataSourcesResponse>('/ui/data-sources', token, { cache: 'no-store' })
}

export async function adminTestDataSource(url: string, token: string): Promise<DataSourceProbe> {
  return apiFetch<DataSourceProbe>('/ui/data-sources/test', token, {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export async function adminAddDataSource(
  input: { name: string; url: string },
  token: string,
): Promise<{ dataSource: DataSource & { connectors: string[] } }> {
  return apiFetch<{ dataSource: DataSource & { connectors: string[] } }>(
    '/ui/data-sources',
    token,
    { method: 'POST', body: JSON.stringify(input) },
  )
}

export async function adminDeleteDataSource(id: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/ui/data-sources/${id}`, token, {
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

export async function getProviderFluxes(
  provider: string,
  token: string,
  baseUrl?: string,
): Promise<ProviderFlux[]> {
  const data = await apiFetch<{ fluxes: ProviderFlux[] }>(
    `/providers/${provider}/fluxes`,
    token,
    { cache: 'no-store' },
    0,
    baseUrl,
  )
  return data.fluxes
}

export async function subscribeFlux(
  provider: string,
  id: number,
  token: string,
  dataSourceId?: number | null,
  baseUrl?: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>(
    `/providers/${provider}/fluxes/${id}/subscribe`,
    token,
    {
      method: 'POST',
      ...(dataSourceId != null ? { body: JSON.stringify({ dataSourceId }) } : {}),
    },
    0,
    baseUrl,
  )
}

export async function unsubscribeFlux(
  provider: string,
  id: number,
  token: string,
  dataSourceId?: number | null,
  baseUrl?: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>(
    `/providers/${provider}/fluxes/${id}/subscribe`,
    token,
    {
      method: 'DELETE',
      ...(dataSourceId != null ? { body: JSON.stringify({ dataSourceId }) } : {}),
    },
    0,
    baseUrl,
  )
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
