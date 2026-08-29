import { test, expect } from '@playwright/test'

// La configuration Playwright épingle le cookie de langue sur le français.

test.describe('Setup generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/generate')
  })

  test('renders a full bash script for the default selection', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const preview = page.getByTestId('script-preview')
    await expect(preview).toContainText('#!/usr/bin/env bash')
    await expect(preview).toContainText('connector-rss:')
    await expect(preview).toContainText('context: ./stayup-ui')
  })

  test('drops a connector from the script when unchecked', async ({ page }) => {
    const preview = page.getByTestId('script-preview')
    await expect(preview).toContainText('connector-youtube:')
    await page.getByRole('checkbox', { name: 'YouTube' }).uncheck()
    await expect(preview).not.toContainText('connector-youtube:')
    await expect(preview).toContainText('connector-rss:')
  })

  test('removes the admin UI when the toggle is off', async ({ page }) => {
    const preview = page.getByTestId('script-preview')
    await page.getByRole('checkbox', { name: /web d.admin/i }).uncheck()
    await expect(preview).not.toContainText('context: ./stayup-ui')
  })

  test('offers a download and only PostgreSQL is selectable', async ({ page }) => {
    await expect(page.getByRole('button', { name: /télécharger/i })).toBeEnabled()
    await expect(page.getByRole('radio', { name: 'PostgreSQL' })).toBeEnabled()
    await expect(page.getByRole('radio', { name: /MySQL/i })).toBeDisabled()
  })

  test('is reachable from the documentation index', async ({ page }) => {
    await page.goto('/docs')
    await page.locator('main').getByRole('link', { name: 'Générer un script' }).click()
    await page.waitForURL('/docs/generate')
  })
})
