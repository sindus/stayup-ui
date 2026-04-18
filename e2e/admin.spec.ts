import { test, expect } from '@playwright/test'

test.describe('Admin login page', () => {
  test('shows username and password form', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByLabel('Identifiant')).toBeVisible()
    await expect(page.getByLabel('Mot de passe')).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Identifiant').fill('wrongadmin')
    await page.getByLabel('Mot de passe').fill('wrongpassword')
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page.getByText(/identifiants incorrects/i)).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page.getByText(/identifiant requis/i)).toBeVisible()
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

test.describe('Admin login page (already authenticated as user)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nom').fill('Admin E2E Test')
    await page.getByLabel('E-mail').fill(`admin-e2e-${Date.now()}@example.com`)
    await page.getByLabel('Mot de passe', { exact: true }).fill('TestPassword123!')
    await page.getByLabel('Confirmer le mot de passe').fill('TestPassword123!')
    await page.getByRole('button', { name: /créer mon compte/i }).click()
    await expect(page).toHaveURL('/feed', { timeout: 15000 })
  })

  test('user accessing /admin is redirected to /feed', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/feed')
  })
})
