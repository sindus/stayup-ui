import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays the hero heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/restez|stayup/i)
  })

  test('shows changelog and youtube features', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'GitHub Changelog' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Chaînes YouTube' })).toBeVisible()
  })

  test('has login and register buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /se connecter/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /inscrire|commencer/i }).first()).toBeVisible()
  })

  test('login button navigates to /login', async ({ page }) => {
    await page
      .getByRole('link', { name: /se connecter/i })
      .first()
      .click()
    await expect(page).toHaveURL('/login')
  })

  test('register button navigates to /register', async ({ page }) => {
    await page
      .getByRole('link', { name: /inscrire|commencer/i })
      .first()
      .click()
    await expect(page).toHaveURL('/register')
  })
})
