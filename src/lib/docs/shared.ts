// Parties de la doc qui ne se traduisent pas : SQL, commandes, noms de colonnes,
// identifiants de providers. Les garder ici évite qu'une traduction ne dérive et
// ne publie une commande qui ne marche pas.

// Ancres de sommaire, par page.
export const HOME_ANCHORS = {
  concept: 'concept',
  paths: 'paths',
} as const

export const SELF_HOSTING_ANCHORS = {
  why: 'why',
  pieces: 'pieces',
  requirements: 'requirements',
  databases: 'databases',
  env: 'configuration',
  deploy: 'deploy',
  schema: 'schema',
  pointing: 'pointing-a-client',
  troubleshooting: 'troubleshooting',
} as const

export const PROVIDER_ANCHORS = {
  what: 'what-is-a-provider',
  access: 'where-it-writes',
  existing: 'existing-providers',
  creating: 'writing-your-own',
  contract: 'technical-contract',
} as const

export const GENERATE_ANCHORS = {
  how: 'how-it-works',
  requirements: 'requirements',
  form: 'build-your-script',
  run: 'run-it',
  after: 'after-setup',
} as const

// Les moteurs pris en charge par l'API. L'ordre est celui des onglets : le plus
// courant d'abord, le NoSQL en dernier parce qu'il est le plus dépaysant.
export const ENGINES = [
  {
    id: 'postgres',
    label: 'PostgreSQL',
    schemes: 'postgres:// · postgresql://',
    driver: '—',
    schemaFile: 'src/db/schema.sql',
  },
  {
    id: 'mysql',
    label: 'MySQL / MariaDB',
    schemes: 'mysql:// · mariadb://',
    driver: 'npm install mysql2',
    schemaFile: 'src/db/schema.mysql.sql',
  },
  {
    id: 'sqlite',
    label: 'SQLite',
    schemes: 'sqlite:// · file://',
    driver: 'npm install better-sqlite3',
    schemaFile: 'src/db/schema.sqlite.sql',
  },
  {
    id: 'mongodb',
    label: 'MongoDB',
    schemes: 'mongodb:// · mongodb+srv://',
    driver: 'npm install mongodb',
    schemaFile: '—',
  },
] as const

export type EngineId = (typeof ENGINES)[number]['id']

/** Application du schéma de base, une commande par moteur. */
export const SCHEMA_COMMANDS: Record<EngineId, string> = {
  postgres: `psql "$DATABASE_URL" -f src/db/schema.sql`,
  mysql: `mysql -h <host> -u <user> -p <database> < src/db/schema.mysql.sql`,
  sqlite: `sqlite3 stayup.db < src/db/schema.sqlite.sql`,
  mongodb: `mongosh "$DATABASE_URL" --eval '
  db.repository.createIndex({ url: 1 }, { unique: true })
  db.user_repository.createIndex({ user_id: 1, repository_id: 1 }, { unique: true })
'`,
}

// ─── Ce qu'un provider crée, moteur par moteur ────────────────────────────────
// Mêmes noms de tables et de colonnes partout : un provider se décrit une fois,
// et seul le dialecte change. C'est ce qui rend le choix du moteur réversible.

export const ENGINE_TABLES: Record<
  EngineId,
  {
    repository: string
    connector: string
    registry: string
    log: string
    selectSources: string
    optionalColumns: readonly string[]
  }
> = {
  postgres: {
    repository: `CREATE TABLE IF NOT EXISTS repository (
  id         SERIAL PRIMARY KEY,
  url        TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL,
  config     JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
    connector: `CREATE TABLE IF NOT EXISTS connector_<name> (
  id            SERIAL PRIMARY KEY,
  repository_id INTEGER NOT NULL REFERENCES repository(id),
  content       TEXT NOT NULL,
  executed_at   TIMESTAMPTZ NOT NULL,
  success       BOOLEAN NOT NULL
);`,
    registry: `CREATE TABLE IF NOT EXISTS provider_registry (
  name         TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 100,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO provider_registry (name, display_name, sort_order)
VALUES ('podcast', 'Podcasts', 50)
ON CONFLICT (name) DO UPDATE
  SET display_name = EXCLUDED.display_name, updated_at = NOW();`,
    log: `CREATE TABLE IF NOT EXISTS log (
  id            SERIAL PRIMARY KEY,
  repository_id INTEGER,
  error         TEXT NOT NULL,
  executed_at   TIMESTAMPTZ NOT NULL
);`,
    selectSources: `SELECT id, url, config FROM repository
WHERE type = '<name>' ORDER BY id`,
    optionalColumns: ['datetime TIMESTAMPTZ', 'version TEXT'],
  },

  mysql: {
    repository: `CREATE TABLE IF NOT EXISTS repository (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  url        VARCHAR(512) NOT NULL UNIQUE,
  type       VARCHAR(64) NOT NULL,
  config     JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);`,
    connector: `CREATE TABLE IF NOT EXISTS connector_<name> (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  repository_id INT NOT NULL,
  content       TEXT NOT NULL,
  executed_at   DATETIME(3) NOT NULL,
  success       TINYINT(1) NOT NULL,
  FOREIGN KEY (repository_id) REFERENCES repository(id)
);`,
    registry: `CREATE TABLE IF NOT EXISTS provider_registry (
  name         VARCHAR(64) PRIMARY KEY,
  display_name VARCHAR(255) NOT NULL,
  sort_order   INT NOT NULL DEFAULT 100,
  updated_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

INSERT INTO provider_registry (name, display_name, sort_order)
VALUES ('podcast', 'Podcasts', 50)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name), updated_at = CURRENT_TIMESTAMP(3);`,
    log: `CREATE TABLE IF NOT EXISTS log (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  repository_id INT,
  error         TEXT NOT NULL,
  executed_at   DATETIME(3) NOT NULL
);`,
    selectSources: `SELECT id, url, config FROM repository
WHERE type = '<name>' ORDER BY id`,
    optionalColumns: ['datetime DATETIME(3)', 'version VARCHAR(64)'],
  },

  sqlite: {
    repository: `CREATE TABLE IF NOT EXISTS repository (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  url        TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL,
  config     TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);`,
    connector: `CREATE TABLE IF NOT EXISTS connector_<name> (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id INTEGER NOT NULL REFERENCES repository(id),
  content       TEXT NOT NULL,
  executed_at   TEXT NOT NULL,
  success       INTEGER NOT NULL
);`,
    registry: `CREATE TABLE IF NOT EXISTS provider_registry (
  name         TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 100,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO provider_registry (name, display_name, sort_order)
VALUES ('podcast', 'Podcasts', 50)
ON CONFLICT (name) DO UPDATE
  SET display_name = excluded.display_name;`,
    log: `CREATE TABLE IF NOT EXISTS log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id INTEGER,
  error         TEXT NOT NULL,
  executed_at   TEXT NOT NULL
);`,
    selectSources: `SELECT id, url, config FROM repository
WHERE type = '<name>' ORDER BY id`,
    optionalColumns: ['datetime TEXT', 'version TEXT'],
  },

  mongodb: {
    repository: `const seq = db.counters.findOneAndUpdate(
  { _id: 'repository' },
  { $inc: { seq: 1 } },
  { upsert: true, returnDocument: 'after' },
).seq

db.repository.insertOne({
  _id: seq,
  url: 'https://example.com/feed.xml',
  type: '<name>',
  config: {},
  created_at: new Date().toISOString(),
})`,
    connector: `db.createCollection('connector_<name>')

db['connector_<name>'].insertOne({
  repository_id: 12,
  content: '…',
  executed_at: new Date(),
  success: true,
})`,
    registry: `db.provider_registry.updateOne(
  { _id: 'podcast' },
  { $set: { display_name: 'Podcasts', sort_order: 50, updated_at: new Date() } },
  { upsert: true },
)`,
    log: `db.log.insertOne({
  repository_id: 12,
  error: '…',
  executed_at: new Date(),
})`,
    selectSources: `db.repository.find({ type: '<name>' }).sort({ _id: 1 })`,
    optionalColumns: ['datetime: Date', 'version: string'],
  },
}

export const ENV_VARS = [
  { name: 'DATABASE_URL', required: true },
  { name: 'JWT_SECRET', required: true },
  { name: 'API_USERNAME / API_PASSWORD', required: true },
  { name: 'UI_URL', required: true },
  { name: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET', required: false },
  { name: 'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET', required: false },
] as const

export const NAMING_ROWS = [
  { example: 'connector_podcast' },
  { example: "'podcast'" },
  { example: "'podcast' → 'Podcasts'" },
] as const

export const SNIPPETS = {
  docker: `git clone https://github.com/stayup-app/stayup-api.git
cd stayup-api
cp .env.example .env   # JWT_SECRET, API_USERNAME, API_PASSWORD, UI_URL
docker compose up -d db api`,

  workers: `npm ci
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
npx wrangler secret put API_USERNAME
npx wrangler secret put API_PASSWORD
# UI_URL and the OAuth vars can live in wrangler.toml`,

  node: `npm ci
npm run build
DATABASE_URL=... JWT_SECRET=... API_USERNAME=... API_PASSWORD=... UI_URL=... npm start`,

  createUser: `npm run create-user -- "Your Name" you@example.com yourpassword`,

  verify: `curl https://your-api.example.com/           # {"status":"ok"}
curl https://your-api.example.com/connectors/providers \\
  -H "Authorization: Bearer $TOKEN"                    # {"providers":[]}`,

  addSource: `POST /ui/users/:userId/repositories
{ "provider": "<name>", "url": "...", "config": {} }`,
} as const

export const CHECKLIST_CODE = [
  'connector_<name>',
  'provider_registry',
  "repository … WHERE type = '<name>'",
  'config.retention_days',
  'log',
  'GET /connectors/providers',
  'GET /connectors/<name>',
] as const
