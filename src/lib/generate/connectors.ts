/**
 * Catalogue des connecteurs officiels et repos utilisés par le générateur de
 * projet self-hosted (voir `buildScript.ts`). Aucune traduction ici : ce sont
 * des identifiants et des URLs.
 */

export type ConnectorId = 'changelog' | 'youtube' | 'rss' | 'scrap' | 'github-trending'

export interface OfficialConnector {
  id: ConnectorId
  /** Repo GitHub `owner/name`. */
  repo: string
  /** Planification Ofelia par défaut, proposée dans le prompt du script. */
  defaultCron: string
}

/** Crons repris des workflows `daily.yml` de chaque `stayup-cmd-*`. */
export const OFFICIAL_CONNECTORS: readonly OfficialConnector[] = [
  { id: 'changelog', repo: 'stayup-app/stayup-cmd-changelog', defaultCron: '0 0 * * *' },
  { id: 'youtube', repo: 'stayup-app/stayup-cmd-youtube', defaultCron: '0 20 * * *' },
  { id: 'rss', repo: 'stayup-app/stayup-cmd-rss', defaultCron: '0 0 * * *' },
  { id: 'scrap', repo: 'stayup-app/stayup-cmd-scrap', defaultCron: '0 0 * * *' },
  {
    id: 'github-trending',
    repo: 'stayup-app/stayup-cmd-github-trending',
    defaultCron: '0 0 * * *',
  },
] as const

export const API_REPO = 'stayup-app/stayup-api'
export const UI_REPO = 'stayup-app/stayup-ui'

export const CONNECTOR_IDS = OFFICIAL_CONNECTORS.map((c) => c.id)

export type DbEngine = 'postgres' | 'mysql' | 'sqlite' | 'mongodb'

/** Seul Postgres est branché en v1 : les 5 connecteurs sont psycopg2 + SQL PG. */
export const SUPPORTED_DB_ENGINES: readonly DbEngine[] = ['postgres'] as const
