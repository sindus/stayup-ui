// Prose de la doc « self-hosting & providers ». Le code, le SQL et les noms de
// colonnes vivent dans shared.ts : rien ici ne doit être exécutable.
export const en = {
  meta: {
    title: 'StayUp — Self-hosting & building providers',
    description:
      'Run your own stayup-api instance, and write a provider that plugs into StayUp without touching any app code.',
  },
  nav: {
    onThisPage: 'On this page',
    backToSite: 'Back to the site',
  },
  eyebrow: 'Documentation',
  title: 'Self-hosting StayUp & building new providers',
  lede: 'Two audiences, one page: running your own stayup-api instance on your own data, and writing a new provider that plugs into StayUp without touching a line of the four apps.',

  overview: {
    heading: 'How the pieces fit together',
    points: [
      'stayup-api is a thin, stateless HTTP layer over a single PostgreSQL database. It never hardcodes a provider name. On every request it asks Postgres which connector_* tables exist right now and what display name each one registered — that answer is the list of providers.',
      'A provider is an independent script (Python today, anything tomorrow) that owns exactly one table and writes rows into it on a schedule. It never talks to stayup-api: it talks to the same Postgres database.',
      'The three client apps never hardcode an API URL either. Each ships a default, and every user can point it at any other stayup-api instance from their profile — another database, other providers, other data.',
    ],
    note: 'Instances do not coordinate. Self-host and you start with an empty database and zero providers, until you run at least one collector against it. Nothing is shared with the reference instance.',
    diagram: {
      title: 'Overall architecture',
      providers: 'Providers — independent scripts, one per source type',
      yourProvider: 'your new provider…',
      writesCron: 'writes, on a schedule',
      database: 'PostgreSQL',
      dbShared: 'shared',
      dbPerProvider: 'one per provider',
      readsWrites: 'reads and writes, over SQL',
      api: 'stayup-api',
      apiSubtitle: 'stateless — discovers providers from Postgres at request time',
      http: 'HTTP, on a configurable URL',
      clients: 'Client apps',
      endUser: 'end user',
      note: 'Any client can point at any instance, and therefore at any database. There is one reference instance; self-hosting is a parallel stack of the same shape, disconnected from it.',
    },
  },

  part1: {
    eyebrow: 'Part 1',
    heading: 'Self-hosting stayup-api',
    requirements: {
      heading: 'Requirements',
      items: [
        'A PostgreSQL database (14 or later) reachable from wherever the API runs.',
        'Node.js 22 or later, if you are not using Docker.',
        'Optionally a Cloudflare account, if you want to deploy to Workers like the reference instance.',
      ],
    },
    env: {
      heading: 'Environment variables',
      columnVariable: 'Variable',
      columnRequired: 'Required',
      columnDescription: 'Description',
      yes: 'yes',
      no: 'no',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Node and Docker builds also accept DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD separately.',
        'Random secret used to sign auth tokens. Generate one with openssl rand -hex 32.',
        'The single admin service account. There is no admin row in the database: whoever signs in with these credentials gets the admin role. Regular users register through the apps.',
        'Public URL of your stayup-ui deployment. Used as the OAuth redirect target.',
        'Enables “Sign in with Google”. Leave empty to disable it.',
        'Enables “Sign in with GitHub”. Leave empty to disable it.',
      ],
      note: 'E-mail and password sign-in always works, whatever you do with the OAuth variables.',
    },
    deploy: {
      heading: 'Deployment options',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Plain Node.js'],
      dockerIntro: 'The fastest path: clone, fill in .env, run.',
      dockerNote:
        'docker-compose.yml mounts the schema into Postgres’ init directory, so the core tables are created the first time the volume is initialized. The API then listens on port 3000.',
      workersIntro: 'Matches the reference deployment.',
      workersNote:
        'Your Postgres has to be reachable from Cloudflare’s network — a managed provider with a pooled public connection string is the usual answer. Workers cannot reach a database on your home network.',
      nodeIntro: 'No orchestration, just the built server.',
      nodeNote:
        'Or build the provided Dockerfile yourself, if you would rather run a container without Compose.',
    },
    schema: {
      heading: 'Applying the schema, and your first user',
      applyIntro: 'If you are not relying on Compose’s auto-init, apply it once yourself:',
      applyNote:
        'It is purely additive — CREATE TABLE IF NOT EXISTS only — so it is safe to re-run at any time, including against a database that already holds data.',
      userIntro:
        'Admin access is the API_USERNAME and API_PASSWORD pair above: there is nothing to create. For a regular account, without going through a sign-up form:',
      verifyIntro: 'Then check it is alive:',
      verifyNote:
        'An empty provider list is the expected answer at this point: no provider has run against this database yet. That is Part 2.',
    },
    pointing: {
      heading: 'Pointing a client app at your instance',
      items: [
        'stayup-ui: set STAYUP_API_URL on your deployment — or leave it alone and let each visitor override it from their profile, where it is stored per browser.',
        'stayup-desktop and stayup-mobile: Profile, then “API URL”, paste your instance’s URL, save. “Reset to default” goes back to the built-in one at any time.',
      ],
      diagram: {
        title: 'Switching instances',
        instanceA: 'stayup-api — reference instance',
        instanceB: 'stayup-api — your instance',
        providersA: 'providers: changelog, youtube, rss, scrap',
        providersB: 'providers: podcast, hackernews',
        client: 'Same app, one setting',
        connected: 'currently connected',
        switch: 'switch to this one instead',
        note: 'Zero code change. The provider list, the data and the rendering all follow whichever instance is configured — including the generic fallback for providers the app does not know by name.',
      },
    },
  },

  part2: {
    eyebrow: 'Part 2',
    heading: 'Building a new provider',
    intro:
      'A provider is any script that periodically writes rows describing new content into its own Postgres table. stayup-api and the three apps pick it up on their own — no code change anywhere else — as long as it follows the contract below. The four existing collectors are full reference implementations; the RSS one is the shortest, read it alongside this page.',
    contract: {
      heading: 'The provider contract',
      diagramTitle: 'What your script may touch',
      yourScript: 'Your provider script',
      readOnly: 'read only',
      readWrite: 'read and write — full ownership',
      upsertOne: 'upsert exactly one row: yours',
      writeOnError: 'write on error',
      repositoryDesc: 'shared — the sources to track',
      connectorDesc: 'yours — created and owned entirely by you',
      registryDesc: 'shared — your display name',
      logDesc: 'shared, optional — write on error rather than crashing',
      warning:
        'Never write into another provider’s table, nor into the user, session, account or user_repository tables: those belong to stayup-api and stayup-ui.',
    },
    naming: {
      heading: 'Naming convention',
      intro:
        'Pick a short lowercase name, safe as a snake_case identifier — podcast, hackernews, reddit_thread. That one string is used verbatim in three places:',
      columnWhere: 'Where',
      columnExample: 'Example, for “podcast”',
      rows: ['Your data table', 'repository.type — which sources are yours', 'Your display name'],
      note: 'There is no registry of names to reserve in advance: the name simply is whatever you create the table as. Two providers can only collide by picking the same table name.',
    },
    tables: {
      heading: 'The four tables involved',
      intro:
        'Your init step, run at the start of every execution, must make sure these exist. Every statement is idempotent — safe to run every single time, and safe even if another provider created the shared ones first.',
      repositoryTitle: 'repository — shared, you mostly read from it',
      repositoryDesc:
        'One row is one thing to track: a podcast feed, a subreddit, whatever your provider calls a source. type must equal your provider name. config is free-form JSON that your script alone defines and interprets.',
      connectorTitle: 'connector_<name> — yours, entirely',
      connectorDesc: 'Optional columns, used when present but never required:',
      optionalDescriptions: [
        'the content’s own timestamp, preferred over executed_at when sorting by what is newest.',
        'a short label shown next to rich renders — a release tag, a video id, and so on.',
      ],
      registryTitle: 'provider_registry — shared, one row for you',
      registryDesc:
        'sort_order only affects the order providers appear in across the apps; any integer will do (the existing four use 10, 20, 30, 40). Skip this table entirely and your provider still works: the API falls back to a capitalized version of your name.',
      logTitle: 'log — shared, optional but recommended',
      logDesc:
        'Write here instead of crashing when one source fails, and carry on with the others.',
    },
    eachRun: {
      heading: 'What your script does on each run',
      steps: [
        'Connect, and run the idempotent schema step above.',
        'Read your list of sources from repository, filtered on your provider name.',
        'For each source: fetch from the external service, compare against what is already stored — typically the most recent successful row for that source — and insert only what is new.',
        'Prune old rows according to config.retention_days, or whatever config keys you define.',
        'On a per-source failure, write to log and move on to the next one rather than aborting the whole run.',
      ],
      addFlag:
        'Support an --add <url> flag that upserts a repository row and exits: that is how sources get seeded directly against the database. The other way — the one end users actually take — is adding a source through the API, where provider must equal your table suffix.',
    },
    conventions: {
      heading: 'Content conventions, and the generic-render caveat',
      body: 'content can be plain text or a JSON string, as you prefer. The existing providers use small JSON payloads for YouTube and RSS so the apps can render a title and a thumbnail. A brand-new provider has no renderer for its own shape, so the three apps show it as a generic card: the first characters of content, the date, your display name. That is fully functional, just visually plain. A rich render is a separate, optional follow-up — someone adds a component keyed off your provider name in each app. Nothing in the backend contract requires it.',
    },
    schedule: {
      heading: 'Running it on a schedule',
      body: 'Copy the pattern from any existing collector: a Dockerfile, and a daily workflow that runs the script with the database URL as a secret, pointed at the same Postgres your API uses. Nothing here requires GitHub Actions specifically — a systemd timer, plain cron or another CI works identically.',
    },
    checklist: {
      heading: 'Before you call it done',
      items: [
        'created with at least id, repository_id, content, executed_at and success.',
        'row upserted on every run.',
        'sources read with your provider name.',
        'old entries pruned — or the absence of retention documented.',
        'per-source errors written here instead of crashing the run.',
        'lists your provider after one run.',
        'returns your data.',
      ],
    },
  },
}

export type DocContent = typeof en
