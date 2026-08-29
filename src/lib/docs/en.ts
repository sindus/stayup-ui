// Documentation prose. Code, SQL and column names live in docs/shared.ts:
// nothing here is executable.
//
// Four pages, one dictionary. /docs is the mental model + the vocabulary;
// /docs/install stands up an instance; /docs/admin runs it day to day;
// /docs/providers plugs in a new source. /docs/generate is the guided path
// through /docs/install and has its own `generate` section.
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
        'What StayUp is, how the pieces fit together, and where to go next: run your own instance, run it, or write a provider.',
    },
    eyebrow: 'Documentation',
    title: 'How StayUp works',
    lede: 'StayUp turns many kinds of external source — release notes, videos, feeds, scraped pages, anything a program can read — into one feed per person. This page is the mental model and the vocabulary; then pick the path you need.',

    concept: {
      heading: 'The idea, in four sentences',
      points: [
        'StayUp shows you new content from the sources you follow. What counts as a source is not fixed — it is whatever some provider knows how to fetch.',
        'A provider is a small program that fetches one kind of source and writes what it finds into the instance’s database. Covering a new kind of source means writing a provider; nothing else in StayUp changes.',
        'The StayUp API reads that database and serves it to the apps. It hardcodes no kind of source: on each request it asks the database which providers exist right now, and hands back their display manifest untouched.',
        'The apps — web, desktop, mobile — read the API. Each can be pointed at any instance, so at any database, and each can display a provider it has never heard of.',
      ],
      note: 'The set of sources is open by construction. An instance shows exactly the providers that run against its database — no built-in list, nothing to register with a central authority.',
      diagram: {
        title: 'From a source to your screen',
        sources: 'External sources',
        sourcesItems:
          'a podcast feed · a forum thread · a status page · anything a program can read',
        providers: 'Providers',
        providersSub: 'one small program per kind of source, on a schedule',
        database: 'The database',
        databaseSub: 'PostgreSQL, MySQL, SQLite or MongoDB — everything collected, in one place',
        api: 'StayUp API',
        apiSub: 'reads the database, serves the apps, hardcodes nothing',
        apps: 'Web · Desktop · Mobile · Admin',
        appsSub: 'each one configurable to another instance',
      },
    },

    vocabulary: {
      heading: 'The words, pinned down',
      intro:
        'These terms come up everywhere and are easy to mix up. Here is what each one means in StayUp.',
      columnTerm: 'Term',
      columnMeaning: 'What it means',
      terms: [
        {
          term: 'Instance',
          meaning:
            'One database + one API in front of it + the providers that feed it. The public instance is one; yours would be another. Instances never talk to each other.',
        },
        {
          term: 'Provider (a.k.a. connector)',
          meaning:
            'A standalone program that fetches one kind of source and writes rows into the database. “Connector” and “provider” are the same thing; the repos are named stayup-cmd-*.',
        },
        {
          term: 'Source (a.k.a. flux) — a repository row',
          meaning:
            'One thing being tracked: a specific feed URL, a channel, a page. Stored as a row in the shared repository table, with type set to the provider’s name.',
        },
        {
          term: 'Subscription',
          meaning:
            'A link between a user and a source: “this person follows this flux”. Adding a flux in an app creates a subscription (and the source itself, if it did not exist).',
        },
        {
          term: 'Display template',
          meaning:
            'An optional JSON manifest a provider stores in provider_registry.template. It tells the apps how to render that provider’s rows. No template → a plain generic card.',
        },
        {
          term: 'Admin',
          meaning:
            'An operator of an instance. The first one (a super admin) is created from the command line; the rest are managed from the admin web UI. Separate from user accounts.',
        },
      ],
    },

    paths: {
      heading: 'Which path do you need?',
      installTitle: 'Run your own instance',
      installBody:
        'Your own API and your own database, so your data stays yours and you choose what runs against it. Includes a full local walkthrough.',
      installCta: 'Install guide',
      generateTitle: 'Generate a setup script',
      generateBody:
        'The guided path: pick a database and the connectors you want, and get a one-shot bash script that stands up the whole stack.',
      generateCta: 'Setup generator',
      adminTitle: 'Run your instance',
      adminBody:
        'The admin web UI: manage admins, decide which providers accept new fluxes freely, work the approval queue, curate users and fluxes.',
      adminCta: 'Administration guide',
      providersTitle: 'Plug in a new source',
      providersBody:
        'Write a provider — a program that fetches a source StayUp does not cover yet, and stores what it finds. Includes display templates.',
      providersCta: 'Provider guide',
      relation:
        'Running an instance and writing a provider are related but separate. A provider never talks to the API, only to the database — so you can write one without reading the install guide. Running it is another matter: it needs write access to the database it feeds, and on the public instance you do not have that. In practice, your own provider goes with your own instance.',
    },
  },

  // ── /docs/install ────────────────────────────────────────────────────────
  install: {
    meta: {
      title: 'StayUp — Install',
      description:
        'Stand up your own StayUp instance: the pieces, a full local walkthrough, the four databases, configuration, and how to point the apps at it.',
    },
    eyebrow: 'Install',
    title: 'Run your own instance',
    lede: 'An instance is a database, the API in front of it, the providers you choose to feed it, and — if you want to operate it from a browser — the admin web UI. This page walks the whole thing, locally, end to end.',

    why: {
      heading: 'Why bother',
      intro:
        'The public instance has its own providers and its own data. Running your own lets you:',
      items: [
        'keep everything in a database you control;',
        'pick which providers run, and how often;',
        'follow sources the public instance does not cover;',
        'decide who can add what, through per-provider approval;',
        'point the web, desktop and mobile apps at it — one setting, no code change.',
      ],
      note: 'Instances do not talk to each other. You start with an empty database and no providers, until you run one against it.',
    },

    pieces: {
      heading: 'The four pieces',
      database: 'A database',
      databaseBody:
        'Holds everything: the sources being tracked, the content collected, the accounts, the admins. PostgreSQL, MySQL/MariaDB, SQLite or MongoDB — the API adapts to whichever you point it at.',
      api: 'StayUp API',
      apiBody:
        'A thin, stateless layer over that database. It hardcodes no provider name — on each request it asks the database what is there. Runs on Node, in Docker, or on Cloudflare Workers.',
      providers: 'Providers',
      providersBody:
        'The programs that actually fill the database. Standalone repos, run on a schedule, talking only to the database. Without at least one, your instance works but shows nothing.',
      adminUi: 'The admin web UI (optional)',
      adminUiBody:
        'A deployment of the web app opened at /admin. Lets you manage admins, set each provider’s approval mode, work the flux-request queue, and curate users and fluxes. Skip it and the API still works — you just lose the browser console.',
    },

    fastPath: {
      heading: 'The fast path',
      body: 'If you just want it running, the setup generator asks a few questions and hands you a single stayup-setup.sh that does everything below for you — clone, compose, schema, super admin, first connector run, scheduler.',
      cta: 'Open the setup generator',
    },

    walkthrough: {
      heading: 'Full local walkthrough',
      intro:
        'Done by hand, so you can see every moving part. PostgreSQL and Docker here; the same steps work with any supported engine.',
      steps: [
        'Clone the API: git clone https://github.com/stayup-app/stayup-api.git && cd stayup-api',
        'Copy .env.example to .env and set DATABASE_URL and JWT_SECRET (openssl rand -hex 32). There is no admin username or password to set — admins live in the database.',
        'Start the database and the API: docker compose up -d db api. The compose file seeds the schema into Postgres on first init; the API listens on port 3000.',
        'If you did not rely on that auto-init, apply the schema once: psql "$DATABASE_URL" -f src/db/schema.sql. It only ever adds, so it is safe to re-run.',
        'Create the first super admin: npm run create-admin -- root@example.com "Root" \'a-strong-password\'. This is the account that manages the admin web UI.',
        'Add a provider. Clone one — git clone https://github.com/stayup-app/stayup-cmd-rss.git — point its DATABASE_URL at the same database, install its deps, then: python fetch_rss.py --add https://blog.example.com/feed.xml and python fetch_rss.py. The first real run creates its tables and registers itself.',
        'Check the API sees it: curl localhost:3000/connectors/providers should now list rss with its display manifest.',
        'Open the desktop app, go to Profile → API URL, paste http://localhost:3000, save. Register an account, then add a flux — the rss entry appears once the connector has run.',
        'Schedule the connector so it keeps running: a cron entry, a systemd timer, a GitHub Actions schedule, or the Ofelia container the generator sets up.',
      ],
      note: 'The API never runs the connectors. They are separate programs on their own schedule; the only thing they share with the API is the database.',
    },

    requirements: {
      heading: 'What you need',
      items: [
        'A database from the list below, reachable from wherever the API runs.',
        'Docker, or Node.js 22 or later if you run it without containers.',
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
      note: 'Every engine passes the same conformance suite — the same behaviours, checked in CI against a real PostgreSQL, MySQL, SQLite and MongoDB. That is what makes the choice reversible: the tables, the collections and the columns carry the same names everywhere, so a provider is described once and only its dialect changes.',
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
        'Random secret used to sign auth tokens. Generate one with openssl rand -hex 32. It must stay the same for the life of the instance — change it and every existing token stops working.',
        'Public URL of your web deployment. Only used as the OAuth redirect target; leave it out if you are not enabling Google or GitHub sign-in.',
        'Enables “Sign in with Google”. Leave empty to disable it.',
        'Enables “Sign in with GitHub”. Leave empty to disable it.',
      ],
      note: 'There is no admin username or password variable. The old API_USERNAME / API_PASSWORD pair is gone: admins are rows in the database, and the first one is created with npm run create-admin. E-mail and password sign-in for regular users always works, whatever you do with the OAuth variables.',
    },

    deploy: {
      heading: 'Deploy the API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Plain Node.js'],
      dockerIntro: 'The shortest path: clone, fill in .env, run.',
      dockerNote:
        'The compose file mounts the schema into Postgres’ init directory, so the core tables are created the first time the volume is initialized. The API then listens on port 3000. Bootstrap the super admin next — see below.',
      workersIntro: 'What the reference instance runs.',
      workersNote:
        'Your database has to be reachable from Cloudflare’s network — a managed provider with a pooled public connection string is the usual answer. Workers cannot reach a database on your home network, and cannot run the create-admin script: bootstrap the super admin against the database from your own machine.',
      nodeIntro: 'No orchestration, just the built server.',
      nodeNote:
        'Or build the provided Dockerfile yourself, if you would rather run a container without Compose. The built image ships the create-admin script too.',
    },

    schema: {
      heading: 'Create the tables, and the first admin',
      applyIntro:
        'If you are not relying on Compose’s auto-init, apply the schema once yourself. One file per engine, same table and column names in all of them:',
      applyNote:
        'The SQL files only ever add — CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS — so they are safe to re-run at any time, including against a database that already holds data.',
      engineNotes: [
        'The reference schema. Version 14 or later.',
        'MySQL 8 or MariaDB 10.2 and later: the API ranks content with a window function.',
        'Nothing to host — a file next to the API. Good for a personal instance, not for one the apps hit from several places at once.',
        'No schema to apply: MongoDB creates a collection on first write. Only the indexes matter, and the API creates them itself when it connects — the command above just does it ahead of time.',
      ],
      adminIntro:
        'Admins are rows in the admin table; there is no default account. Create the first one — always a super admin — from the command line. It applies the schema first, then inserts the row:',
      userIntro:
        'Regular user accounts are created from the apps’ sign-up form. To make one without a form, for testing:',
      verifyIntro: 'Then check the API answers:',
      verifyNote:
        'An empty provider list is the expected answer here: nothing has collected anything yet. That is the provider guide.',
    },

    pointing: {
      heading: 'Point an app at your instance',
      items: [
        'Web: set STAYUP_API_URL on your deployment — or leave it and let each visitor override it from their profile, where it is stored per browser.',
        'Desktop and mobile: Profile, then “API URL”, paste yours, save. “Reset to default” goes back to the built-in one at any time.',
        'The admin web UI is the same web app: point its STAYUP_API_URL at your API and open /admin.',
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
          symptom: 'A provider shows up as a plain text card, sometimes raw JSON.',
          cause:
            'No usable display template. The provider has not written provider_registry.template, or its content column is a JSON string with no template to interpret it. See the provider guide.',
        },
        {
          symptom: 'Adding a flux says “request sent” instead of subscribing.',
          cause:
            'That provider is in manual approval mode. An admin approves or rejects it from /admin/flux-requests. Flip the mode on /admin/providers if that is not what you want.',
        },
        {
          symptom: 'create-admin says the e-mail is already in use.',
          cause:
            'A super admin already exists. Further admins are created from the admin web UI, not the command line.',
        },
        {
          symptom: 'Sign-in works but every other call is rejected.',
          cause:
            'The signing secret differs between the instance that issued your token and the one answering. Tokens do not carry across instances.',
        },
      ],
    },
  },

  // ── /docs/admin ─────────────────────────────────────────────────────────
  admin: {
    meta: {
      title: 'StayUp — Administration',
      description:
        'Run a StayUp instance from the browser: admins, per-provider flux approval, the request queue, users and fluxes.',
    },
    eyebrow: 'Administration',
    title: 'Run your instance',
    lede: 'Once the API is up, the admin web UI is where you operate the instance from a browser: who can add what, which requests are pending, which users follow which fluxes.',

    webUi: {
      heading: 'The admin web UI',
      body: 'It is the same web app as the public site, opened at /admin, pointed at your API. It is optional — everything it does has an API route behind it — but it is the practical way to operate an instance. Deploy it like any other copy of the web app, set STAYUP_API_URL to your API, and sign in at /admin/login.',
      note: 'The admin session is a separate cookie from a user session. The same browser can hold both at once without one signing the other out.',
    },

    roles: {
      heading: 'Super admin and admin',
      intro:
        'Two levels. The first admin is always a super admin, created from the command line (npm run create-admin). Every admin after that is created from the UI and is a regular admin.',
      columnRole: 'Role',
      columnCan: 'Can do',
      rows: [
        {
          role: 'Super admin',
          can: 'Everything a regular admin can, plus: create, edit and delete other admins. Cannot be deleted from the UI, and cannot delete itself.',
        },
        {
          role: 'Admin',
          can: 'Operational work: users, fluxes, provider approval modes, the request queue. Cannot see or touch the admin list. Can change its own password.',
        },
      ],
      note: 'Admins are not user accounts. They have their own table, their own login, and no feed of their own.',
    },

    managingAdmins: {
      heading: 'Managing admins',
      body: 'Super admin only, at /admin/admins:',
      steps: [
        'Create an admin with an e-mail, a name and a password. It is a regular admin — it cannot manage other admins.',
        'Edit an admin’s name, e-mail or password.',
        'Delete an admin. The super admin rows and your own row are locked.',
      ],
      note: 'A regular admin who needs to change its own password does it from /admin/settings, with its current password.',
    },

    fluxApproval: {
      heading: 'Per-provider flux approval',
      intro:
        'When a user adds a flux that does not exist yet, what happens depends on the provider’s approval mode. Set it per provider at /admin/providers.',
      autoBody:
        'auto — the default. The source is created and the user is subscribed immediately. Good for providers where any URL is fine (RSS, a changelog).',
      manualBody:
        'manual — adding an unknown flux creates a request instead (the app shows “request sent”). Nothing is created until an admin approves it. Good for providers where a source costs something to run, like scraping.',
      note: 'Subscribing to a flux that already exists is never gated — approval only concerns bringing a brand-new source into the instance.',
    },

    usersAndFluxes: {
      heading: 'Users and fluxes',
      body: 'The rest of the console is browsing and curation:',
      items: [
        '/admin/users — every account, with the fluxes it follows. Add or remove a subscription on someone’s behalf.',
        '/admin/repositories — every source across all providers, with its config. Create one directly (useful to seed a manual provider), or retire one.',
        '/admin/flux-requests — the pending queue. Approve creates or reuses the source and subscribes the requester; reject marks it rejected. Both are final.',
      ],
    },

    addingFlux: {
      heading: 'How a user adds a flux, from any app',
      intro:
        'The same flow for every provider — there is no per-provider special case in the apps anymore:',
      steps: [
        'Pick a provider.',
        'The app shows the fluxes that provider already tracks and you do not follow yet. One tap subscribes — no approval, ever.',
        'Or switch to “add a new one”. The input is driven by the provider’s form descriptor: its label, its placeholder, and the shape it expects.',
        'Submit. If the provider is auto, you are subscribed. If it is manual, the app shows “request sent” and an admin takes it from there.',
      ],
      note: 'This is why a provider should ship a form descriptor in its template — it is what turns a bare text box into “paste a YouTube handle” or “paste a feed URL”.',
    },
  },

  // ── /docs/generate ──────────────────────────────────────────────────────
  generate: {
    meta: {
      title: 'StayUp — Generate a self-hosted setup',
      description:
        'Pick a database and the connectors you want, and download a one-shot bash script that stands up your own StayUp instance.',
    },
    eyebrow: 'Install',
    title: 'Generate your setup script',
    lede: 'Choose a database and the connectors you want. You get a single bash script that clones the repos, writes the Docker setup, creates your super admin and starts everything.',

    how: {
      heading: 'What the script does',
      items: [
        'Clones the API, the connectors you picked, and — if you keep it — the admin web UI.',
        'Writes a docker-compose.yml with PostgreSQL, the API, one container per connector, and an Ofelia scheduler.',
        'Prompts you for the super admin account and for each connector’s schedule.',
        'Applies the database schema, creates the super admin, and runs every connector once so it registers itself.',
        'Starts the API, the UI and the scheduler.',
      ],
      note: 'Everything runs on your machine in Docker. Nothing is sent anywhere — the page builds the script in your browser.',
    },

    requirements: {
      heading: 'Before you run it',
      items: [
        'Docker and Docker Compose v2 (`docker compose`).',
        'git.',
        'Linux or macOS. On Windows, run the script inside WSL.',
      ],
    },

    form: {
      database: 'Database',
      comingSoon: 'soon',
      connectors: 'Official connectors',
      customConnectors: 'Your own connectors',
      customHint:
        'Any git repo with a root Dockerfile whose ENTRYPOINT runs the collector once, reads DATABASE_URL, and registers itself in provider_registry. See the provider guide.',
      customConnectorAdd: 'Add a connector',
      customUrlPlaceholder: 'https://github.com/you/your-connector.git',
      customNamePlaceholder: 'name (optional)',
      remove: 'Remove',
      adminUi: 'Include the admin web UI',
      adminUiHint: 'Manage providers, approve flux requests, add admins.',
      registration: 'Registration',
      registrationOpen: 'Open',
      registrationOpenHint: 'Anyone who can reach the API can create an account right away.',
      registrationApproval: 'On approval',
      registrationApprovalHint: 'New accounts wait in a queue until an admin activates them.',
      signInMethods: 'Sign-in methods',
      emailPassword: 'Email + password',
      oauthHint:
        'The script will ask for your OAuth client ID and secret when you run it — they never end up in the script.',
      advanced: 'Advanced',
      projectDir: 'Project folder',
      apiPort: 'API port',
      uiPort: 'UI port',
      dbPort: 'Database port',
      preview: 'stayup-setup.sh',
      download: 'Download',
      copy: 'Copy',
      copied: 'Copied',
      invalid: 'Cannot generate',
    },

    run: {
      heading: 'Run it',
      intro: 'Save the file, then:',
      note: 'The first run builds every image and can take a few minutes.',
    },

    after: {
      heading: 'After setup',
      items: [
        'API docs: http://localhost:3000/docs — Admin UI: http://localhost:3001/admin.',
        'In the desktop or mobile app, set the API URL to http://localhost:3000, then create an account.',
        'Add feeds from the app — every provider offers an existing-flux list and an add-a-new-one form.',
        'Remove everything with: docker compose --profile connectors down -v (this deletes the database).',
      ],
      note: 'The scheduler mounts the Docker socket to launch connectors on schedule — root-equivalent on the host, fine for a local dev instance.',
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
          'Re-declare your display name and template, so a fresh database learns about you on the first run.',
        ],
      },
    },

    access: {
      heading: 'Before you start: where will it write?',
      body: 'A provider needs write access to the database of the instance it feeds. On the public instance you do not have that, so in practice a provider of your own goes with an instance of your own. Writing one requires nothing from the install guide; running one requires a database you can write to.',
      cta: 'Install guide',
    },

    existing: {
      heading: 'Worked examples to read',
      body: 'Start from stayup-cmd-template: a bare skeleton built to be copied, with the three spots you change marked out. Then read the real ones — changelog, youtube, rss, scrap, github-trending — which are what the reference instance happens to run, not a definition of what StayUp covers. The rss one is the shortest real example of the contract below; github-trending is the reference for a rich display template. Point any of them at your own database if it suits you.',
      cta: 'Open stayup-cmd-template',
    },

    creating: {
      heading: 'Writing your own',
      naming: {
        heading: 'Pick a name',
        intro:
          'Something short and lowercase, usable as an identifier — podcast, hackernews, reddit_thread. That one string is used verbatim in several places:',
        columnWhere: 'Where',
        columnExample: 'For “podcast”',
        rows: [
          'Your data table',
          'The sources that belong to you',
          'Your row in the registry',
          'The provider field the apps send when adding a flux',
        ],
        note: 'There is nothing to reserve in advance: the name simply is whatever you create the table as. Two providers only collide by picking the same one.',
      },
      shape: {
        heading: 'What you store',
        body: 'One row per item you found. The content itself can be plain text or JSON — your call. With no display template the apps show a plain card: the beginning of the content, the date, your display name. That works, it is just visually sober, and it shows raw JSON if that is what your content column holds. A template fixes that, and it is the next section.',
      },
      schedule: {
        heading: 'Running it on a schedule',
        body: 'Copy any existing collector: a root Dockerfile whose ENTRYPOINT runs the script once, and a job that runs it with the database URL in the environment. Nothing requires a particular CI — a systemd timer, plain cron, or the Ofelia container the generator sets up all do the same.',
      },
    },

    templates: {
      heading: 'Display templates',
      body: 'A template is a JSON manifest your provider stores in provider_registry.template, in the same upsert as its display name. The API relays it untouched through GET /connectors/providers; each app has an engine that reads it and renders your rows — a list layout, and a reading pane in one of seven modes: text, html, media, audio, gallery, table, link-list. No code in the apps knows your provider’s name.',
      fallbackNote:
        'A provider with no template (column NULL, unreadable JSON, or an unrecognised version) still works — the apps fall back to the plain card. A template is strongly recommended the moment your content is anything but a short line of text.',
      cta: 'Full template reference',
    },

    form: {
      heading: 'The form descriptor',
      body: 'Inside the template, a small form block tells the apps what the “add a new flux” input should look like for your provider. Without it the user gets a bare text box; with it, a labelled field that validates and builds the source URL for them.',
      fields: [
        { field: 'label · placeholder', meaning: 'what the field says and shows as a hint.' },
        {
          field: 'urlTemplate',
          meaning:
            'e.g. https://www.youtube.com/@{value} — {value} is what the user typed. Skipped if the value is already an http(s) URL.',
        },
        {
          field: 'pattern',
          meaning: 'a regex the transformed input must match, checked client-side before submit.',
        },
        {
          field: 'transform',
          meaning:
            'trim, strip a known prefix/suffix, or extract a capture group — so a pasted full URL and a bare handle end up the same.',
        },
      ],
      note: 'The apps store the built URL as the source; your collector reads it back from the repository row like any other.',
    },

    fluxApproval: {
      heading: 'Approval mode',
      body: 'Every provider has a flux_approval column in the registry: auto (default) or manual. auto subscribes a user immediately when they add a new flux; manual turns it into a request an admin must approve. A provider can seed its own default in the upsert; an admin overrides it per instance from /admin/providers. Scraping ships as manual for a reason — running a source costs something there.',
      note: 'This only gates bringing a brand-new source in. Subscribing to a source that already exists is never gated.',
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
      registryDesc: 'your display name + template',
      logDesc: 'failures, instead of crashing',
      warning:
        'Never write into another provider’s table, nor into the user, session, account, admin, subscription or flux_request tables: those belong to the API and the web app.',
      tablesHeading: 'The four tables',
      tablesIntro:
        'Your init step, run at the start of every execution, must make sure these exist. Every statement is idempotent — safe to run every time, and safe if another provider or the API created the shared ones first.',
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
        'The sort order only affects the order providers appear in across the apps; any integer will do. The template column is your display manifest (previous sections); leave it NULL and your provider still works, just with the plain card. flux_approval is an operator setting — do not fight an admin over it, but you may seed a sensible default. Skip the row entirely and the API falls back to a capitalized version of your name.',
      logTitle: 'log — shared, optional but recommended',
      logBody:
        'Write here instead of crashing when one source fails, and carry on with the others.',
      addingSources: {
        heading: 'Getting sources in',
        body: 'Two ways. Support an --add flag that inserts a row and exits — handy to seed directly against the database. The other way, the one end users actually take, is adding a source from an app, which posts to POST /providers/<name>/fluxes; the provider field must equal your table suffix.',
      },
      checklist: {
        heading: 'Before you call it done',
        items: [
          'created with at least an id, a source reference, the content, a timestamp and a success flag.',
          'row upserted on every run, with your display name and (recommended) your template.',
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
