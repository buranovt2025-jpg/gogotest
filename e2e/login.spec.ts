import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('loads and shows back link', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /←|Back/ })).toBeVisible()
  })

  test('shows either API hint or login form', async ({ page }) => {
    await page.goto('/login')
    const hasApiHint = await page.getByText(/API|VITE_API_URL/).isVisible()
    const hasEmailInput = await page.locator('input[type="email"]').isVisible()
    expect(hasApiHint || hasEmailInput).toBeTruthy()
  })
})
