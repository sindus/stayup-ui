import { test, expect } from '@playwright/test'

// La configuration Playwright épingle le cookie de langue sur le français.

test.describe('Documentation index', () => {
  test('opens on the concept, not on implementation details', async ({ page }) => {
    await page.goto('/docs')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Le reproche fait à l'ancienne page : elle ouvrait sur du SQL.
    await expect(page.getByText('CREATE TABLE')).toHaveCount(0)
    await expect(page.getByText('connector_')).toHaveCount(0)
  })

  test('routes to each journey', async ({ page }) => {
    const journeys: [string, string][] = [
      ['Monter ta propre instance', '/docs/install'],
      ['Générer un script', '/docs/generate'],
      ['Exploiter ton instance', '/docs/admin'],
      ['Brancher une nouvelle source', '/docs/providers'],
    ]
    for (const [title, url] of journeys) {
      await page.goto('/docs')
      await page.locator('main').getByRole('link', { name: title }).first().click()
      await page.waitForURL(url)
    }
  })

  test('is what the header Docs link points at', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('banner').getByRole('link', { name: 'Docs' }).click()
    await expect(page).toHaveURL('/docs')
  })

  test('the old /docs/self-hosting URL redirects to /docs/install', async ({ page }) => {
    await page.goto('/docs/self-hosting')
    await expect(page).toHaveURL('/docs/install')
  })
})

test.describe('Install page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/install')
  })

  test('does not teach the provider contract', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('connector_')).toHaveCount(0)
  })

  test('walks the local install and shows create-admin', async ({ page }) => {
    await expect(page.locator('#walkthrough')).toBeVisible()
    await expect(page.getByText('npm run create-admin').first()).toBeVisible()
  })

  test('switches deployment tabs', async ({ page }) => {
    const deploy = page.locator('#deploy')
    await expect(deploy.getByText('docker compose up -d db api')).toBeVisible()

    await deploy.getByRole('tab', { name: 'Cloudflare Workers' }).click()

    await expect(deploy.getByText('npx wrangler secret put DATABASE_URL')).toBeVisible()
    await expect(deploy.getByText('docker compose up -d db api')).not.toBeVisible()
  })

  test('gives the schema command of the engine you pick', async ({ page }) => {
    const schema = page.locator('#schema')
    await expect(schema.getByText('src/db/schema.sql').first()).toBeVisible()

    await schema.getByRole('tab', { name: 'MongoDB' }).click()

    // MongoDB n'a pas de schéma à appliquer : la commande ne pose que les index.
    await expect(schema.getByText('createIndex')).toBeVisible()
    await expect(schema.getByText('src/db/schema.sql')).toHaveCount(0)
  })

  test('covers registration modes and OAuth in an authentication section', async ({ page }) => {
    const auth = page.locator('#authentication')
    await expect(auth).toBeVisible()
    await expect(auth.getByText('REGISTRATION_MODE')).toBeVisible()
    await expect(auth.getByText('/auth/oauth/<provider>/callback')).toBeVisible()
  })

  test('leads back to the documentation index', async ({ page }) => {
    await page.locator('main').getByRole('link', { name: /^←/ }).click()
    await expect(page).toHaveURL('/docs')
  })
})

test.describe('Administration page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/admin')
  })

  test('covers the admin web UI, roles and flux approval', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('#roles')).toBeVisible()
    await expect(page.locator('#flux-approval')).toBeVisible()
    const body = await page.locator('main').innerText()
    expect(body).toContain('/admin/flux-requests')
  })
})

test.describe('Providers page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/providers')
  })

  test('explains the idea before the SQL', async ({ page }) => {
    const body = await page.locator('main').innerText()
    const conceptAt = body.indexOf('PostgreSQL')
    const sqlAt = body.indexOf('CREATE TABLE')

    expect(conceptAt).toBeGreaterThan(-1)
    expect(sqlAt).toBeGreaterThan(-1)
    // Le contrat technique arrive après l'explication, jamais avant.
    expect(sqlAt).toBeGreaterThan(conceptAt)
  })

  test('keeps SQL untranslated and shows the template column', async ({ page }) => {
    await expect(
      page.getByText('CREATE TABLE IF NOT EXISTS provider_registry').first(),
    ).toBeVisible()
    await expect(page.locator('#display-templates')).toBeVisible()
  })

  test('ticks a checklist item', async ({ page }) => {
    const item = page.getByRole('button', { name: /connector_<name>/ })
    await expect(item).toHaveAttribute('aria-pressed', 'false')
    await item.click()
    await expect(item).toHaveAttribute('aria-pressed', 'true')
  })

  // La promesse de la doc : les mêmes noms d'un moteur à l'autre, seul le
  // dialecte change. Un onglet muet la trahirait sans que rien n'échoue ailleurs.
  test('shows the same tables in the dialect of each engine', async ({ page }) => {
    const contract = page.locator('#technical-contract')
    await expect(contract.getByText('SERIAL PRIMARY KEY').first()).toBeVisible()

    await contract.getByRole('tab', { name: 'MongoDB' }).first().click()

    await expect(contract.getByText("db.createCollection('connector_<name>')")).toBeVisible()
    await expect(contract.getByText('SERIAL PRIMARY KEY')).toHaveCount(0)

    await contract.getByRole('tab', { name: 'MySQL / MariaDB' }).first().click()

    await expect(contract.getByText('AUTO_INCREMENT').first()).toBeVisible()
    // Le nom de la table ne bouge pas d'un moteur à l'autre : c'est tout l'intérêt.
    await expect(contract.getByText('connector_<name>').first()).toBeVisible()
  })

  test('points at the install guide for where to write', async ({ page }) => {
    await page.locator('#where-it-writes').getByRole('link').click()
    await expect(page).toHaveURL('/docs/install')
  })
})

// Régression : l'en-tête est partagé avec les pages de doc, où #features et
// #download ne correspondent à aucune section. Les liens doivent donc ramener
// vers l'accueil, tout en continuant à défiler quand on y est déjà.
test.describe('Header anchors', () => {
  for (const [label, anchor] of [
    ['Fonctionnalités', 'features'],
    ['Télécharger', 'download'],
  ] as const) {
    test(`"${label}" leads back to the landing section from the docs`, async ({ page }) => {
      await page.goto('/docs/install')
      await page.getByRole('banner').getByRole('link', { name: label }).click()

      await expect(page).toHaveURL(`/#${anchor}`)
      await expect(page.locator(`#${anchor}`)).toBeInViewport()
    })

    test(`"${label}" still scrolls when already on the landing page`, async ({ page }) => {
      await page.goto('/')
      await page.getByRole('banner').getByRole('link', { name: label }).click()

      await expect(page).toHaveURL(`/#${anchor}`)
      await expect(page.locator(`#${anchor}`)).toBeInViewport()
    })
  }
})
