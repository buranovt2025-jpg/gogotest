import { test, expect } from '@playwright/test'

test.describe('Home', () => {
  test('loads and shows app title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/GogoMarket/)
  })

  test('has main navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href="/buyer"]').first()).toBeVisible()
  })

  test('uses design system: hero and role cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('section.hero')).toBeVisible()
    await expect(page.locator('.role-card').first()).toBeVisible()
  })
})
