import { test, expect } from '@playwright/test'

/**
 * Feed e2e tests require an authenticated session.
 * Use the auth setup fixture for tests that need a logged-in state.
 *
 * To run these tests: npm run test:e2e
 * Ensure the app and DB are running (docker compose up -d db)
 */

test.describe('Feed page (unauthenticated)', () => {
  test('redirects to login', async ({ page }) => {
    await page.goto('/feed')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Feed page (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login a test user
    await page.goto('/register')
    await page.getByLabel('Nom').fill('E2E Test User')
    await page.getByLabel('E-mail').fill(`e2e-${Date.now()}@example.com`)
    await page.getByLabel('Mot de passe', { exact: true }).fill('TestPassword123!')
    await page.getByLabel('Confirmer le mot de passe').fill('TestPassword123!')
    await page.getByRole('button', { name: /créer mon compte/i }).click()
    await expect(page).toHaveURL('/feed', { timeout: 15000 })
  })

  test('shows empty state when no flux', async ({ page }) => {
    await expect(page.getByText(/votre flux est vide/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /ajouter mon premier flux/i })).toBeVisible()
  })

  test('opens add flux dialog on button click', async ({ page }) => {
    await page.getByRole('button', { name: /ajouter mon premier flux/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/choisissez un provider/i)).toBeVisible()
  })

  test('add flux dialog has provider selector and identifier input', async ({ page }) => {
    await page.getByRole('button', { name: /ajouter mon premier flux/i }).click()
    await expect(page.getByRole('combobox')).toBeVisible()
    await expect(page.getByLabel(/dépôt github/i)).toBeVisible()
    await expect(page.getByLabel(/nom affiché/i)).toBeVisible()
  })

  test('closes dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /ajouter mon premier flux/i }).click()
    await page.getByRole('button', { name: /annuler/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('user menu has sign out option', async ({ page }) => {
    await page
      .getByRole('button', { name: /[a-z]{1,2}/i })
      .first()
      .click()
    await expect(page.getByText(/se déconnecter/i)).toBeVisible()
  })
})
