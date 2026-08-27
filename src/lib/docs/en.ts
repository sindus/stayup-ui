// Prose de la documentation. Le code, le SQL et les noms de colonnes vivent dans
// docs/shared.ts : rien ici ne doit être exécutable.
//
// Trois parcours, trois pages, un seul dictionnaire : /docs pose le modèle mental,
// /docs/self-hosting s'adresse à qui veut sa propre instance, /docs/providers à qui
// veut brancher une source. Les deux publics ne se recouvrent pas, et l'ancienne
// page unique obligeait chacun à lire l'autre moitié — en commençant par le SQL.
export const en = {
  common: {
    onThisPage: 'On this page',
    backToDocs: 'Back to the documentation',
    docsHome: 'Documentation',
  },

  // ── /docs ────────────────────────────────────────────────────────────────
  home: {
    meta: {
      title: 'StayUp — Documentation',
      description:
        'How StayUp works, how to run your own instance, and how to plug a new source into it.',
    },
    eyebrow: 'Documentation',
    title: 'How StayUp works',
    lede: 'Start here. Two minutes of concepts, then pick the path you actually need.',

    concept: {
      heading: 'The idea, in four sentences',
      points: [
        'StayUp shows you new content from the sources you follow. What counts as a source is not fixed — it is whatever some provider knows how to fetch.',
        'A provider is a small program that fetches one kind of source and writes what it finds into the instance’s database. Covering a new kind of source means writing a provider; nothing else in StayUp changes.',
        'The StayUp API reads that database and serves it to the apps. It hardcodes no kind of source: on each request it asks the database which providers exist right now.',
        'The apps read the API. Each can be pointed at any instance, so at any database — and each can display a provider it has never heard of.',
      ],
      note: 'The set of sources is open by construction. An instance shows exactly the providers that run against its database — no built-in list, nothing to register.',
      diagram: {
        title: 'From a source to your screen',
        sources: 'External sources',
        sourcesItems:
          'a podcast feed · a forum thread · a status page · anything a program can read',
        providers: 'Providers',
        providersSub: 'one small program per kind of source',
        database: 'The database',
        databaseSub: 'PostgreSQL, MySQL, SQLite or MongoDB — everything collected, in one place',
        api: 'StayUp API',
        apiSub: 'reads the database, serves the apps',
        apps: 'Web · Desktop · Mobile',
        appsSub: 'each one configurable to another instance',
      },
    },

    paths: {
      heading: 'Which path do you need?',
      selfHostingTitle: 'Run your own instance',
      selfHostingBody:
        'Your own API and your own database, so your data stays yours and you choose what runs against it.',
      selfHostingCta: 'Self-hosting guide',
      providersTitle: 'Plug in a new source',
      providersBody:
        'Write a provider — a program that fetches a source StayUp does not cover yet, and stores what it finds.',
      providersCta: 'Provider guide',
      relation:
        'The two are related but separate. A provider never talks to the API, only to the database — so you can write one without reading a line of the self-hosting guide. Running it is another matter: it needs write access to the database it feeds, and on the public instance you do not have that. In practice, your own provider goes with your own instance.',
    },
  },

  // ── /docs/self-hosting ───────────────────────────────────────────────────
  selfHosting: {
    meta: {
      title: 'StayUp — Self-hosting',
      description: 'Run your own StayUp API and database, and point the apps at it.',
    },
    eyebrow: 'Self-hosting',
    title: 'Run your own instance',
    lede: 'An instance is three pieces: a database, the API in front of it, and whichever providers you choose to feed it.',

    why: {
      heading: 'Why bother',
      intro:
        'The public instance has its own providers and its own data. Running your own lets you:',
      items: [
        'keep everything in a database you control;',
        'pick which providers run, and how often;',
        'follow sources the public instance does not cover;',
        'point the web, desktop and mobile apps at it — one setting, no code change.',
      ],
      note: 'Instances do not talk to each other. You start with an empty database and no providers, until you run one against it.',
    },

    pieces: {
      heading: 'The three pieces',
      database: 'A database',
      databaseBody:
        'Holds everything: the sources being tracked, the content collected, the accounts. PostgreSQL, MySQL/MariaDB, SQLite or MongoDB — the API adapts to whichever you point it at.',
      api: 'StayUp API',
      apiBody:
        'A thin, stateless layer over that database. It hardcodes no provider name — on each request it asks Postgres what is there.',
      providers: 'Providers',
      providersBody:
        'The programs that actually fill the database. Without at least one, your instance works but shows nothing.',
    },

    requirements: {
      heading: 'What you need',
      items: [
        'A database from the list below, reachable from wherever the API runs.',
        'Node.js 22 or later, if you are not using Docker.',
        'Optionally a Cloudflare account, to deploy on Workers like the reference instance.',
      ],
    },

    databases: {
      heading: 'Which database',
      intro:
        'The API does not speak SQL directly. It calls a storage contract that one adapter per engine fulfils, and the scheme of your DATABASE_URL picks the adapter. Four engines ship with it:',
      columnEngine: 'Engine',
      columnScheme: 'URL scheme',
      columnDriver: 'Driver to install',
      note: 'Every engine passes the same conformance suite — the same twenty-four behaviours, checked in CI against a real PostgreSQL, MySQL, SQLite and MongoDB. That is what makes the choice reversible: the tables, the collections and the columns carry the same names everywhere, so a provider is described once and only its dialect changes.',
      workersNote:
        'One exception, and it is not ours: Cloudflare Workers only opens the kind of connection PostgreSQL uses. The MySQL, SQLite and MongoDB drivers need Node — Docker or plain Node.js, not Workers.',
    },

    env: {
      heading: 'Configuration',
      columnVariable: 'Variable',
      columnRequired: 'Required',
      columnDescription: 'Description',
      yes: 'yes',
      no: 'no',
      descriptions: [
        'The scheme picks the engine: postgres://, mysql://, sqlite:// or mongodb://. Node and Docker builds also accept DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD separately, for PostgreSQL.',
        'Random secret used to sign auth tokens. Generate one with openssl rand -hex 32.',
        'The single admin service account. There is no admin row in the database: whoever signs in with these credentials gets the admin role. Regular users register through the apps.',
        'Public URL of your web deployment. Used as the OAuth redirect target.',
        'Enables “Sign in with Google”. Leave empty to disable it.',
        'Enables “Sign in with GitHub”. Leave empty to disable it.',
      ],
      note: 'E-mail and password sign-in always works, whatever you do with the OAuth variables.',
    },

    deploy: {
      heading: 'Deploy the API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Plain Node.js'],
      dockerIntro: 'The shortest path: clone, fill in .env, run.',
      dockerNote:
        'The compose file mounts the schema into Postgres’ init directory, so the core tables are created the first time the volume is initialized. The API then listens on port 3000.',
      workersIntro: 'What the reference instance runs.',
      workersNote:
        'Your database has to be reachable from Cloudflare’s network — a managed provider with a pooled public connection string is the usual answer. Workers cannot reach a database on your home network.',
      nodeIntro: 'No orchestration, just the built server.',
      nodeNote:
        'Or build the provided Dockerfile yourself, if you would rather run a container without Compose.',
    },

    schema: {
      heading: 'Create the tables, and your first account',
      applyIntro:
        'If you are not relying on Compose’s auto-init, apply the schema once yourself. One file per engine, same table and column names in all of them:',
      applyNote:
        'The SQL files only ever add — CREATE TABLE IF NOT EXISTS — so they are safe to re-run at any time, including against a database that already holds data.',
      engineNotes: [
        'The reference schema. Version 14 or later.',
        'MySQL 8 or MariaDB 10.2 and later: the API ranks content with a window function.',
        'Nothing to host — a file next to the API. Good for a personal instance, not for one the apps hit from several places at once.',
        'No schema to apply: MongoDB creates a collection on first write. Only the indexes matter, and the API creates them itself when it connects — the command above just does it ahead of time.',
      ],
      userIntro:
        'Admin access is the username and password pair above: there is nothing to create. For a regular account, without going through a sign-up form:',
      verifyIntro: 'Then check it answers:',
      verifyNote:
        'An empty provider list is the expected answer here: nothing has collected anything yet. That is the provider guide.',
    },

    pointing: {
      heading: 'Point an app at your instance',
      items: [
        'Web: set the API URL on your deployment — or leave it and let each visitor override it from their profile, where it is stored per browser.',
        'Desktop and mobile: Profile, then “API URL”, paste yours, save. “Reset to default” goes back to the built-in one at any time.',
      ],
      note: 'Nothing else changes. The provider list, the data and the rendering all follow whichever instance is configured — including the plain fallback for providers the app does not know by name.',
    },

    troubleshooting: {
      heading: 'When something is off',
      items: [
        {
          symptom: 'The provider list comes back empty.',
          cause:
            'Expected on a fresh database: no provider has run against it yet. Run one and check again.',
        },
        {
          symptom: 'The apps show no content, but the provider list is populated.',
          cause:
            'The providers are running but nobody follows anything yet, or the sources they track carry no new content. Add a source from the app.',
        },
        {
          symptom: 'Everything answers 500 shortly after a provider was added.',
          cause:
            'Usually the database: check the API can still reach it, and that the collector did not fail halfway through creating its tables.',
        },
        {
          symptom: 'Sign-in works but every other call is rejected.',
          cause:
            'The signing secret differs between the instance that issued your token and the one answering. Tokens do not carry across instances.',
        },
      ],
    },
  },

  // ── /docs/providers ──────────────────────────────────────────────────────
  providers: {
    meta: {
      title: 'StayUp — Providers',
      description: 'Write a program that turns any external source into StayUp content.',
    },
    eyebrow: 'Providers',
    title: 'Plug in a new source',
    lede: 'A provider is a program that fetches one kind of source and stores what it finds. It is the only thing you write to extend StayUp — the API and the three apps pick it up on their own.',

    what: {
      heading: 'What a provider actually is',
      body: 'Not a plugin, not a module to register: an ordinary program, in any language, run on a schedule. It reads the list of sources meant for it, fetches each one, keeps what is new, and writes it to the database. The API picks it up on its own, and the three apps display it — without a line of code changing anywhere.',
      note: 'A provider never calls the StayUp API. It talks to the database, and only to the database.',
      diagram: {
        title: 'A provider, step by step',
        sources: 'Its sources, read from the database',
        sourcesItems: 'the podcast feeds this provider was told to track',
        fetch: 'Fetch each feed',
        compare: 'Keep only what was not there before',
        store: 'Write to the database',
        exposed: 'The API exposes it, the apps display it',
      },
      steps: {
        heading: 'On every run',
        items: [
          'Read the sources meant for you.',
          'Fetch each one from the outside world.',
          'Compare against what you stored last time, and keep only what is new.',
          'Write the new items to the database.',
          'Drop what has aged out, and log a failure instead of crashing on it.',
        ],
      },
    },

    access: {
      heading: 'Before you start: where will it write?',
      body: 'A provider needs write access to the database of the instance it feeds. On the public instance you do not have that, so in practice a provider of your own goes with an instance of your own. Writing one requires nothing from the self-hosting guide; running one requires a database you can write to.',
      cta: 'Self-hosting guide',
    },

    existing: {
      heading: 'Worked examples to read',
      body: 'A handful of providers already exist as standalone repositories. They are what the reference instance happens to run — not a definition of what StayUp covers. Read one as a working example of the contract below, and point it at your own database if it happens to suit you. The RSS one is the shortest.',
    },

    creating: {
      heading: 'Writing your own',
      naming: {
        heading: 'Pick a name',
        intro:
          'Something short and lowercase, usable as an identifier — podcast, hackernews, reddit_thread. That one string is used verbatim in three places:',
        columnWhere: 'Where',
        columnExample: 'For “podcast”',
        rows: ['Your data table', 'The sources that belong to you', 'Your display name'],
        note: 'There is nothing to reserve in advance: the name simply is whatever you create the table as. Two providers only collide by picking the same one.',
      },
      shape: {
        heading: 'What you store',
        body: 'One row per item you found. The content itself can be plain text or JSON — your call. The apps have no dedicated renderer for a brand-new provider, so they show it as a plain card: the beginning of the content, the date, your display name. That works, it is just visually sober. A richer rendering is optional, separate, and nothing in the contract requires it.',
      },
      schedule: {
        heading: 'Running it on a schedule',
        body: 'Copy any existing collector: a Dockerfile and a daily job that runs the script with the database URL as a secret. Nothing requires a particular CI — a systemd timer or plain cron does the same.',
      },
    },

    contract: {
      heading: 'Technical contract',
      lede: 'Reference material. You need this to write a provider, not to understand StayUp.',
      diagramTitle: 'What your script may touch',
      yourScript: 'Your provider',
      readOnly: 'read only',
      readWrite: 'read and write — entirely yours',
      upsertOne: 'one row: yours',
      writeOnError: 'write on error',
      repositoryDesc: 'the sources to track',
      connectorDesc: 'the content you collect',
      registryDesc: 'your display name',
      logDesc: 'failures, instead of crashing',
      warning:
        'Never write into another provider’s table, nor into the user, session, account or subscription tables: those belong to the API and the web app.',
      tablesHeading: 'The four tables',
      tablesIntro:
        'Your init step, run at the start of every execution, must make sure these exist. Every statement is idempotent — safe to run every time, and safe if another provider created the shared ones first.',
      engineIntro:
        'Pick the engine your instance runs. The names never change from one tab to the next — only the dialect and the types do, which is why a provider written against one engine reads the same against another.',
      engineNotes: [
        'The reference dialect, and what the public instance runs.',
        'Same tables, MySQL types. A URL has to fit in an indexable VARCHAR, hence the explicit length.',
        'No server: your provider and the API open the same file. Dates and JSON are stored as text, which the API parses back on read.',
        'A collection instead of a table, and no schema to declare — but two rules. A repository document carries a numeric _id, drawn from the counters collection, because the contract designates a source by a number. And nothing cascades: what you write, you clean up.',
      ],
      repositoryTitle: 'repository — shared, you mostly read from it',
      repositoryBody:
        'One row is one thing to track: a podcast feed, a subreddit, whatever your provider calls a source. The type column must equal your provider name. The config column is free-form JSON that only your script defines and interprets.',
      connectorTitle: 'connector_<name> — yours, entirely',
      connectorBody: 'Optional columns, used when present but never required:',
      optionalDescriptions: [
        'the content’s own timestamp, preferred over the execution time when sorting by what is newest.',
        'a short label shown next to rich renders — a release tag, a video id, and so on.',
      ],
      registryTitle: 'provider_registry — shared, one row for you',
      registryBody:
        'The sort order only affects the order providers appear in across the apps; any integer will do. Skip this table entirely and your provider still works: the API falls back to a capitalized version of your name.',
      logTitle: 'log — shared, optional but recommended',
      logBody:
        'Write here instead of crashing when one source fails, and carry on with the others.',
      addingSources: {
        heading: 'Getting sources in',
        body: 'Two ways. Support an --add flag that inserts a row and exits — handy to seed directly against the database. The other way, the one end users actually take, is adding a source from the app, where the provider field must equal your table suffix.',
      },
      checklist: {
        heading: 'Before you call it done',
        items: [
          'created with at least an id, a source reference, the content, a timestamp and a success flag.',
          'row upserted on every run.',
          'sources read with your provider name.',
          'old entries pruned — or the absence of retention documented.',
          'per-source failures written here instead of crashing the run.',
          'lists your provider after one run.',
          'returns your data.',
        ],
      },
    },
  },
}

export type DocContent = typeof en
