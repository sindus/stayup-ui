import { getCachedUserFeed, getCachedTemplates } from './feed-cache'
import { readInstances, type Instance } from './instances'
import { decodeToken } from './session'
import type { ProviderMeta } from './providerTemplate'
import type { ConnectorItem, FeedRepository } from '@/types'
import type { UserRepositoryItem } from './api-client'

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
  instanceErrors: { instanceId: string; instanceName: string }[]
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
      const userId = userIdOf(inst.token)
      if (!userId) return { inst, failed: true as const }
      try {
        const [feed, templates] = await Promise.all([
          getCachedUserFeed(userId, inst.token, inst.url),
          getCachedTemplates(inst.token, inst.url),
        ])
        return { inst, failed: false as const, feed, templates }
      } catch {
        return { inst, failed: true as const }
      }
    }),
  )

  const repositories: TaggedRepository[] = []
  const connectors: Record<string, FanoutItem[]> = {}
  const templates: Record<string, ProviderMeta> = {}
  const instanceErrors: { instanceId: string; instanceName: string }[] = []
  const multi = instances.length > 1

  for (const r of results) {
    if (r.failed) {
      instanceErrors.push({ instanceId: r.inst.id, instanceName: r.inst.name })
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
