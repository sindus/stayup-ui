import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page shows email/password form and OAuth buttons', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Mot de passe')).toBeVisible()
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('login shows error on wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('wrong@example.com')
    await page.getByLabel('Mot de passe').fill('wrongpassword')
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page.getByText(/identifiants incorrects/i)).toBeVisible()
  })

  test('register page shows all fields', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByLabel('Nom')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirmer le mot de passe')).toBeVisible()
  })

  test('register validates password match', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nom').fill('Test User')
    await page.getByLabel('E-mail').fill('newuser@example.com')
    await page.getByLabel('Mot de passe', { exact: true }).fill('password123')
    await page.getByLabel('Confirmer le mot de passe').fill('different123')
    await page.getByRole('button', { name: /créer mon compte/i }).click()
    await expect(page.getByText(/ne correspondent pas/i)).toBeVisible()
  })

  test('unauthenticated access to /feed redirects to /login', async ({ page }) => {
    await page.goto('/feed')
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated access to /profile redirects to /login', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL('/login')
  })
})
