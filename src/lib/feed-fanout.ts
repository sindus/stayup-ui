import { getCachedUserFeed, getCachedTemplates } from './feed-cache'
import { readInstances, type Instance } from './instances'
import { decodeToken, isTokenExpired } from './session'
import { ApiError } from './api-client'
import type { ProviderMeta } from './providerTemplate'
import type { ConnectorItem, FeedRepository } from '@/types'
import type { UserRepositoryItem } from './api-client'

/** Pourquoi une instance manque au feed :
 *  - `expired`     : le token porte un `exp` dépassé (constaté localement) ;
 *  - `auth`        : l'API a refusé le token (401/403) ou il est illisible ;
 *  - `unreachable` : réseau ou 5xx, probablement transitoire.
 *  `expired` et `auth` demandent une reconnexion ; `unreachable` un simple retry. */
export type InstanceErrorReason = 'expired' | 'auth' | 'unreachable'

export interface InstanceError {
  instanceId: string
  instanceName: string
  reason: InstanceErrorReason
}

/** Les instances dont la session est morte : reconnexion requise, un simple retry
 *  n'y changera rien. */
export function needsReconnect(errors: InstanceError[]): InstanceError[] {
  return errors.filter((e) => e.reason === 'expired' || e.reason === 'auth')
}

/** Une ligne de flux, taguée avec l'instance dont elle provient. `_instance_name`
 *  n'est posé qu'en multi-instance (il ne sert qu'à l'affichage d'un badge). */
export type TaggedRepository = UserRepositoryItem & {
  _instance_id: string
  _instance_name?: string
}

/** Un item de connecteur, tagué avec l'instance dont il provient (calque du
 *  pattern `_data_source_*` du multi-base). */
export type FanoutItem = ConnectorItem & {
  _instance_id: string
  _instance_name?: string
}

export interface FanoutFeed {
  /** Toutes les instances vivantes, dans l'ordre (la première est la primaire). */
  instances: Instance[]
  repositories: TaggedRepository[]
  /** Items fusionnés à plat, indexés par provider. */
  connectors: Record<string, FanoutItem[]>
  /** Templates fusionnés à plat (premier gagnant), indexés par provider. */
  templates: Record<string, ProviderMeta>
  /** Instances dont la récupération a échoué — le feed rend quand même les autres. */
  instanceErrors: InstanceError[]
}

function userIdOf(token: string): string | null {
  try {
    return decodeToken(token).userId
  } catch {
    return null
  }
}

/** Fusionne des maps de templates : le premier provider rencontré gagne, mais un
 *  template manquant est complété par une instance ultérieure. */
export function mergeTemplates(
  into: Record<string, ProviderMeta>,
  from: Record<string, ProviderMeta>,
): void {
  for (const [name, meta] of Object.entries(from)) {
    if (!into[name] || (!into[name].template && meta.template)) into[name] = meta
  }
}

/** Récupère le feed de chaque instance vivante en parallèle, tague chaque ligne
 *  avec son instance et fusionne le tout. L'échec d'une instance est doux : elle
 *  passe dans `instanceErrors`, les autres sont rendues. */
export async function fanoutFeed(): Promise<FanoutFeed> {
  const instances = await readInstances()

  const results = await Promise.all(
    instances.map(async (inst) => {
      if (isTokenExpired(inst.token)) {
        return { inst, failed: true as const, reason: 'expired' as const }
      }
      const userId = userIdOf(inst.token)
      if (!userId) return { inst, failed: true as const, reason: 'auth' as const }
      try {
        const [feed, templates] = await Promise.all([
          getCachedUserFeed(userId, inst.token, inst.url),
          getCachedTemplates(inst.token, inst.url),
        ])
        return { inst, failed: false as const, feed, templates }
      } catch (e) {
        // 401/403 = token rejeté (à reconnecter) ; le reste = injoignable (à réessayer).
        const reason: InstanceErrorReason =
          e instanceof ApiError && (e.status === 401 || e.status === 403) ? 'auth' : 'unreachable'
        return { inst, failed: true as const, reason }
      }
    }),
  )

  const repositories: TaggedRepository[] = []
  const connectors: Record<string, FanoutItem[]> = {}
  const templates: Record<string, ProviderMeta> = {}
  const instanceErrors: InstanceError[] = []
  const multi = instances.length > 1

  for (const r of results) {
    if (r.failed) {
      instanceErrors.push({
        instanceId: r.inst.id,
        instanceName: r.inst.name,
        reason: r.reason,
      })
      continue
    }
    const tag = {
      _instance_id: r.inst.id,
      ...(multi ? { _instance_name: r.inst.name } : {}),
    }
    for (const repo of r.feed.repositories) repositories.push({ ...repo, ...tag })
    for (const [provider, items] of Object.entries(r.feed.connectors ?? {})) {
      ;(connectors[provider] ??= []).push(...items.map((item) => ({ ...item, ...tag })))
    }
    mergeTemplates(templates, r.templates)
  }

  return { instances, repositories, connectors, templates, instanceErrors }
}

/** Réduit les lignes taguées à la forme `FeedRepository` attendue par les vues,
 *  en conservant l'instance d'origine. */
export function toFeedRepositories(repositories: TaggedRepository[]): FeedRepository[] {
  return repositories.map((r) => ({
    repository_id: r.repository_id,
    url: r.url,
    provider: r.provider,
    config: r.config ?? {},
    instanceId: r._instance_id,
  }))
}
