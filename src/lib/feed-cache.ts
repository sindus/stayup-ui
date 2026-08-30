import { cache } from 'react'
import { getUserFeed, getConnectorProviders } from './api-client'
import { buildTemplateMap, type ProviderMeta } from './providerTemplate'

export const getCachedUserFeed = cache(getUserFeed)

/**
 * Providers + templates d'affichage, indexés par nom, mémoïsés par requête.
 * Un échec ne casse pas le feed : on renvoie une map vide (rendu générique).
 */
export const getCachedTemplates = cache(
  async (token: string, baseUrl?: string): Promise<Record<string, ProviderMeta>> => {
    try {
      return buildTemplateMap(await getConnectorProviders(token, baseUrl))
    } catch {
      return {}
    }
  },
)
