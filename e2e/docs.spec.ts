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

  test('routes to each of the two journeys', async ({ page }) => {
    await page.goto('/docs')
    await page
      .locator('main')
      .getByRole('link', { name: /self-hosting|héberg/i })
      .first()
      .click()
    await expect(page).toHaveURL('/docs/self-hosting')

    await page.goto('/docs')
    await page
      .locator('main')
      .getByRole('link', { name: /provider/i })
      .first()
      .click()
    await expect(page).toHaveURL('/docs/providers')
  })

  test('is what the header Docs link points at', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('banner').getByRole('link', { name: 'Docs' }).click()
    await expect(page).toHaveURL('/docs')
  })
})

test.describe('Self-hosting page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/self-hosting')
  })

  test('stays clear of the provider contract', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('connector_')).toHaveCount(0)
    await expect(page.getByText('provider_registry')).toHaveCount(0)
  })

  test('switches deployment tabs', async ({ page }) => {
    await expect(page.getByText('docker compose up -d db api')).toBeVisible()

    await page.getByRole('tab', { name: 'Cloudflare Workers' }).click()

    await expect(page.getByText('npx wrangler secret put DATABASE_URL')).toBeVisible()
    await expect(page.getByText('docker compose up -d db api')).not.toBeVisible()
  })

  test('leads back to the documentation index', async ({ page }) => {
    await page.locator('main').getByRole('link', { name: /^←/ }).click()
    await expect(page).toHaveURL('/docs')
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

  test('keeps SQL untranslated', async ({ page }) => {
    await expect(
      page.getByText('CREATE TABLE IF NOT EXISTS provider_registry').first(),
    ).toBeVisible()
  })

  test('ticks a checklist item', async ({ page }) => {
    const item = page.getByRole('button', { name: /connector_<name>/ })
    await expect(item).toHaveAttribute('aria-pressed', 'false')
    await item.click()
    await expect(item).toHaveAttribute('aria-pressed', 'true')
  })

  test('points at the self-hosting guide for where to write', async ({ page }) => {
    await page.locator('#where-it-writes').getByRole('link').click()
    await expect(page).toHaveURL('/docs/self-hosting')
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
      await page.goto('/docs/self-hosting')
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
