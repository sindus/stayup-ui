# StayUp UI

[![CI](https://github.com/stayup-app/stayup-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/stayup-app/stayup-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Live at:** https://stayup-ui.vercel.app

Next.js web interface for StayUp — a GitHub and YouTube changelog aggregator.

Follow the sources that matter to you (GitHub releases, YouTube channels, RSS
feeds, scraped web pages) and read every update in a single unified feed.

## Features

- **Unified feed** — all your sources merged into one chronological list, with
  read/unread tracking and keyboard navigation (`↑` / `↓`)
- **Multiple providers** — GitHub changelogs, YouTube channels, RSS feeds and
  web scraping
- **Scraping requests** — users can request a new page to scrape; admins review
  and approve it
- **Admin panel** — manage users, feeds and scraping requests
- **i18n** — French and English, switchable at runtime
- **Auth** — email/password plus Google and GitHub OAuth

## Requirements

- Node.js 22+
- A running [`stayup-api`](https://github.com/stayup-app/stayup-api) instance
- PostgreSQL (auth only) — provided by the bundled Docker Compose setup

## Getting started

```bash
git clone git@github.com:stayup-app/stayup-ui.git
cd stayup-ui
npm install
cp .env.example .env   # then fill in the values
```

Start the auth database, then the dev server:

```bash
docker compose up -d db
npm run dev
```

The app is available at [http://localhost:3001](http://localhost:3001).

## Environment variables

| Variable                      | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `BETTER_AUTH_SECRET`          | Random string, 32 characters minimum          |
| `BETTER_AUTH_URL`             | Public app URL (e.g. `http://localhost:3001`) |
| `DATABASE_URL`                | PostgreSQL connection string (auth only)      |
| `STAYUP_API_URL`              | Default `stayup-api` URL for this deployment  |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google OAuth credentials (optional)           |
| `GITHUB_CLIENT_ID` / `SECRET` | GitHub OAuth credentials (optional)           |

Each visitor can override `STAYUP_API_URL` for their own browser from `/profile` — the
override is stored in a cookie and takes priority over the env var (see
[`src/lib/apiUrl.ts`](src/lib/apiUrl.ts)).

See [`.env.example`](.env.example) for the full list.

## Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Dev server on port 3001          |
| `npm run build`        | Production build                 |
| `npm start`            | Serve the production build       |
| `npm run lint`         | ESLint                           |
| `npm run format`       | Format with Prettier             |
| `npm run format:check` | Check formatting without writing |
| `npm test`             | Run all Vitest tests             |
| `npm run test:watch`   | Vitest in watch mode             |
| `npm run test:unit`    | Unit tests only                  |
| `npm run test:e2e`     | Playwright end-to-end tests      |
| `npm run test:e2e:ui`  | Playwright in UI mode            |

## Testing

Unit and component tests use [Vitest](https://vitest.dev/) with Testing Library;
end-to-end tests use [Playwright](https://playwright.dev/).

```bash
npm run test:unit                  # unit + component tests
npm run test:unit -- --coverage     # with a coverage report
npm run test:e2e                   # end-to-end (needs the app and DB running)
```

## Docker

```bash
docker compose up -d               # production build + database
docker compose --profile dev up dev # dev server with hot reload
```

## Project structure

```
src/
├── app/              # Next.js App Router (routes, layouts, API routes)
│   ├── (auth)/       # login / register
│   ├── (protected)/  # feed, profile, scrap — auth required
│   ├── admin/        # admin panel
│   └── api/          # route handlers
├── components/       # React components, grouped by domain
├── context/          # React contexts (language, read state)
├── lib/              # API client, server actions, translations, helpers
├── types/            # shared TypeScript types
└── middleware.ts     # route protection
```

## CI

Every push and pull request runs [the CI pipeline](.github/workflows/ci.yml):
lint and format checks, unit tests, a production build, then Playwright E2E
tests.

## License

[MIT](LICENSE)
