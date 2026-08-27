import { test, expect } from '@playwright/test'

// La configuration Playwright épingle le cookie de langue sur le français.
test.describe('Self-hosting documentation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/self-hosting')
  })

  test('renders the page in the visitor language', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: /auto-héberger stayup/i }),
    ).toBeVisible()
    await expect(page.getByText(/les instances ne se coordonnent pas/i)).toBeVisible()
  })

  test('shows SQL untranslated', async ({ page }) => {
    await expect(
      page.getByText('CREATE TABLE IF NOT EXISTS provider_registry').first(),
    ).toBeVisible()
  })

  test('switches deployment tabs', async ({ page }) => {
    await expect(page.getByText('docker compose up -d db api')).toBeVisible()

    await page.getByRole('tab', { name: 'Cloudflare Workers' }).click()

    await expect(page.getByText('npx wrangler secret put DATABASE_URL')).toBeVisible()
    await expect(page.getByText('docker compose up -d db api')).not.toBeVisible()
  })

  test('ticks a checklist item', async ({ page }) => {
    const item = page.getByRole('button', { name: /connector_<name>/ })
    await expect(item).toHaveAttribute('aria-pressed', 'false')
    await item.click()
    await expect(item).toHaveAttribute('aria-pressed', 'true')
  })

  test('is reachable from the landing header and the footer', async ({ page }) => {
    await page.goto('/')
    // Le lien existe aussi en pied de page : on vise celui de l'en-tête.
    await page.getByRole('banner').getByRole('link', { name: 'Docs' }).click()
    await expect(page).toHaveURL('/docs/self-hosting')

    await page.goto('/')
    await page.getByRole('contentinfo').getByRole('link', { name: 'Docs' }).click()
    await expect(page).toHaveURL('/docs/self-hosting')
  })

  test('follows the language switcher', async ({ page }) => {
    await page.getByLabel('Langue').selectOption('en')
    await expect(
      page.getByRole('heading', { level: 1, name: /self-hosting stayup/i }),
    ).toBeVisible()
  })
})
