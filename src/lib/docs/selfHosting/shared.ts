// Parties de la doc qui ne se traduisent pas : SQL, commandes, noms de colonnes,
// identifiants de providers. Les garder ici évite qu'une traduction ne dérive et
// ne publie une commande qui ne marche pas.

export const DOC_ANCHORS = {
  overview: 'overview',
  selfHosting: 'self-hosting',
  requirements: 'requirements',
  env: 'environment-variables',
  deploy: 'deployment',
  schema: 'schema',
  pointing: 'pointing-a-client',
  providers: 'providers',
  contract: 'contract',
  naming: 'naming',
  tables: 'tables',
  eachRun: 'each-run',
  checklist: 'checklist',
} as const

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

  schema: `psql "$DATABASE_URL" -f src/db/schema.sql`,

  createUser: `npm run create-user -- "Your Name" you@example.com yourpassword`,

  verify: `curl https://your-api.example.com/           # {"status":"ok"}
curl https://your-api.example.com/connectors/providers \\
  -H "Authorization: Bearer $TOKEN"                    # {"providers":[]}`,

  repositoryTable: `CREATE TABLE IF NOT EXISTS repository (
  id         SERIAL PRIMARY KEY,
  url        TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL,
  config     JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,

  connectorTable: `CREATE TABLE IF NOT EXISTS connector_<name> (
  id            SERIAL PRIMARY KEY,
  repository_id INTEGER NOT NULL REFERENCES repository(id),
  content       TEXT NOT NULL,
  executed_at   TIMESTAMPTZ NOT NULL,
  success       BOOLEAN NOT NULL
);`,

  registryTable: `CREATE TABLE IF NOT EXISTS provider_registry (
  name         TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 100,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO provider_registry (name, display_name, sort_order)
VALUES ('podcast', 'Podcasts', 50)
ON CONFLICT (name) DO UPDATE
  SET display_name = EXCLUDED.display_name, updated_at = NOW();`,

  logTable: `CREATE TABLE IF NOT EXISTS log (
  id            SERIAL PRIMARY KEY,
  repository_id INTEGER,
  error         TEXT NOT NULL,
  executed_at   TIMESTAMPTZ NOT NULL
);`,

  selectSources: `SELECT id, url, config FROM repository
WHERE type = '<name>' ORDER BY id`,

  addSource: `POST /ui/users/:userId/repositories
{ "provider": "<name>", "url": "...", "config": {} }`,
} as const

export const OPTIONAL_COLUMNS = [
  { name: 'datetime TIMESTAMPTZ' },
  { name: 'version TEXT' },
] as const

export const CHECKLIST_CODE = [
  'connector_<name>',
  'provider_registry',
  "repository … WHERE type = '<name>'",
  'config.retention_days',
  'log',
  'GET /connectors/providers',
  'GET /connectors/<name>',
] as const
