// Parties de la doc qui ne se traduisent pas : SQL, commandes, noms de colonnes,
// identifiants de providers. Les garder ici évite qu'une traduction ne dérive et
// ne publie une commande qui ne marche pas.

// Ancres de sommaire, par page.
export const HOME_ANCHORS = {
  concept: 'concept',
  vocabulary: 'vocabulary',
  paths: 'paths',
} as const

export const INSTALL_ANCHORS = {
  why: 'why',
  pieces: 'pieces',
  fastPath: 'fast-path',
  walkthrough: 'walkthrough',
  requirements: 'requirements',
  databases: 'databases',
  env: 'configuration',
  deploy: 'deploy',
  schema: 'schema',
  auth: 'authentication',
  pointing: 'pointing-a-client',
  troubleshooting: 'troubleshooting',
} as const

export const ADMIN_ANCHORS = {
  webUi: 'admin-web-ui',
  roles: 'roles',
  managingAdmins: 'managing-admins',
  fluxApproval: 'flux-approval',
  usersAndFluxes: 'users-and-fluxes',
  dataSources: 'secondary-databases',
  addingFlux: 'adding-a-flux-from-the-apps',
} as const

export const PROVIDER_ANCHORS = {
  what: 'what-is-a-provider',
  access: 'where-it-writes',
  existing: 'existing-providers',
  creating: 'writing-your-own',
  templates: 'display-templates',
  form: 'the-form-descriptor',
  fluxApproval: 'flux-approval',
  contract: 'technical-contract',
} as const

export const GENERATE_ANCHORS = {
  how: 'how-it-works',
  requirements: 'requirements',
  form: 'build-your-script',
  run: 'run-it',
  after: 'after-setup',
  production: 'going-to-production',
} as const

// Un déploiement de prod, bout à bout : Neon (Postgres) + Cloudflare Workers
// (API) + GitHub Actions (planificateur des connecteurs). Commandes et YAML ici,
// prose dans chaque locale.
export const PROD_SNIPPETS = {
  neonBootstrap: `git clone https://github.com/stayup-app/stayup-api.git
cd stayup-api
npm ci

# the pooled Neon string — used by the API and by every connector
export DATABASE_URL="postgres://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# applies src/db/schema.sql, then inserts the first SUPER admin
npm run create-admin -- root@example.com "Root" 'a-strong-password'`,

  workersSecrets: `npx wrangler login
npx wrangler secret put DATABASE_URL   # paste the pooled Neon string
npx wrangler secret put JWT_SECRET     # e.g. the output of: openssl rand -hex 32

# only if you use OAuth:
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET`,

  workersVars: `# wrangler.toml — public, non-secret config
[vars]
UI_URL = "https://your-ui.example.com"
INSTANCE_NAME = "My StayUp"
REGISTRATION_MODE = "approval"   # or "open"`,

  workersDeploy: `npx wrangler deploy
# → deployed to https://stayup-api.<your-subdomain>.workers.dev

curl https://stayup-api.<your-subdomain>.workers.dev/           # {"status":"ok"}
curl https://stayup-api.<your-subdomain>.workers.dev/auth/config`,

  connectorWorkflow: `# .github/workflows/daily.yml — already in every stayup-cmd-* repo
name: Daily RSS fetch

on:
  schedule:
    - cron: "0 6 * * *"      # every day at 06:00 UTC — tune this
  workflow_dispatch: {}       # adds a "Run workflow" button in the Actions tab

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.13"
      - run: pip install -r requirements.txt
      - run: python fetch_rss.py
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}`,

  cronExamples: `"0 0 * * *"      every day at 00:00 UTC
"0 */6 * * *"    every 6 hours
"*/30 * * * *"   every 30 minutes
"0 8 * * 1"      Mondays at 08:00 UTC`,

  prodVerify: `# 1. API + database
curl https://stayup-api.<sub>.workers.dev/                     # {"status":"ok"}

# 2. every connector that has run at least once
curl https://stayup-api.<sub>.workers.dev/connectors/providers \\
  -H "Authorization: Bearer $TOKEN"`,
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
  name          TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 100,
  template      JSONB,              -- optional: the display manifest, see below
  flux_approval TEXT NOT NULL DEFAULT 'auto',  -- 'auto' | 'manual', an admin can flip it
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE provider_registry ADD COLUMN IF NOT EXISTS template JSONB;

INSERT INTO provider_registry (name, display_name, sort_order, template)
VALUES ('podcast', 'Podcasts', 50, '<the JSON manifest, or NULL>'::jsonb)
ON CONFLICT (name) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      template     = EXCLUDED.template,
      updated_at   = NOW();`,
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
  name          VARCHAR(64) PRIMARY KEY,
  display_name  VARCHAR(255) NOT NULL,
  sort_order    INT NOT NULL DEFAULT 100,
  template      JSON,
  flux_approval VARCHAR(16) NOT NULL DEFAULT 'auto',
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

INSERT INTO provider_registry (name, display_name, sort_order, template)
VALUES ('podcast', 'Podcasts', 50, '<the JSON manifest, or NULL>')
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  template     = VALUES(template),
  updated_at   = CURRENT_TIMESTAMP(3);`,
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
  name          TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 100,
  template      TEXT,             -- JSON kept as text
  flux_approval TEXT NOT NULL DEFAULT 'auto',
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO provider_registry (name, display_name, sort_order, template)
VALUES ('podcast', 'Podcasts', 50, '<the JSON manifest, or NULL>')
ON CONFLICT (name) DO UPDATE
  SET display_name = excluded.display_name,
      template     = excluded.template;`,
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
  { $set: {
      display_name: 'Podcasts',
      sort_order: 50,
      template: { /* the display manifest, or omit */ },
      updated_at: new Date(),
  } },
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
  { name: 'UI_URL', required: false },
  { name: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET', required: false },
  { name: 'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET', required: false },
] as const

export const NAMING_ROWS = [
  { example: 'connector_podcast' },
  { example: "repository.type = 'podcast'" },
  { example: "provider_registry.name = 'podcast'" },
  { example: 'POST /providers/podcast/fluxes' },
] as const

export const SNIPPETS = {
  docker: `git clone https://github.com/stayup-app/stayup-api.git
cd stayup-api
cp .env.example .env   # set DATABASE_URL and JWT_SECRET
docker compose up -d db api`,

  workers: `npm ci
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
# UI_URL and the OAuth vars can live in wrangler.toml`,

  node: `npm ci
npm run build
DATABASE_URL=... JWT_SECRET=... npm start`,

  createAdmin: `# bootstrap the first super admin (from source)
npm run create-admin -- root@example.com "Root" 'a-strong-password'

# or from a built image / container:
docker compose run --rm api node dist/scripts/create-admin.js \\
  root@example.com "Root" 'a-strong-password'`,

  createUser: `npm run create-user -- "Your Name" you@example.com yourpassword`,

  verify: `curl https://your-api.example.com/           # {"status":"ok"}
curl https://your-api.example.com/connectors/providers \\
  -H "Authorization: Bearer $TOKEN"                    # {"providers":[]}`,

  runConnector: `git clone https://github.com/stayup-app/stayup-cmd-rss.git
cd stayup-cmd-rss
# same database the API points at:
export DATABASE_URL=postgres://user:pass@localhost:5432/stayup
pip install -r requirements.txt
python fetch_rss.py --add https://blog.example.com/feed.xml
python fetch_rss.py            # first real run: creates its tables, registers itself`,

  addSource: `# the generic route every provider shares
POST /providers/<name>/fluxes
{ "url": "https://blog.example.com/feed.xml", "config": {} }
# → 201 subscribed, or 202 { "status": "pending" } if the provider needs approval`,
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
