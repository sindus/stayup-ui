import { test, expect } from '@playwright/test'

test.describe('Admin login page', () => {
  test('shows the e-mail and password form', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Mot de passe')).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Mot de passe').fill('wrongpassword')
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page.getByText(/mot de passe incorrect/i)).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page.getByText(/email invalide/i)).toBeVisible()
    await expect(page.getByText(/mot de passe requis/i)).toBeVisible()
  })
})

test.describe('Admin routes (unauthenticated)', () => {
  test('/admin redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin/login')
  })

  test('/admin/users redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL('/admin/login')
  })

  test('/admin/repositories redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/repositories')
    await expect(page).toHaveURL('/admin/login')
  })
})

test.describe('Admin session is independent from the user session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nom').fill('Admin E2E Test')
    await page.getByLabel('E-mail').fill(`admin-e2e-${Date.now()}@example.com`)
    await page.getByLabel('Mot de passe', { exact: true }).fill('TestPassword123!')
    await page.getByLabel('Confirmer le mot de passe').fill('TestPassword123!')
    await page.getByRole('button', { name: /créer mon compte/i }).click()
    await expect(page).toHaveURL('/feed', { timeout: 15000 })
  })

  // Admin uses its own cookie (separate from the user session), so a regular
  // user has no admin session at all and is sent to the admin login — not to
  // /feed as if they'd been recognized and rejected.
  test('a plain user session does not grant /admin access', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin/login')
  })

  // The user session must survive visiting the admin login page: the two
  // cookies must not collide.
  test('visiting /admin/login does not sign the user out', async ({ page }) => {
    await page.goto('/admin/login')
    await page.goto('/feed')
    await expect(page).toHaveURL('/feed')
  })
})
