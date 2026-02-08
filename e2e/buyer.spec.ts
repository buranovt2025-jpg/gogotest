import { test, expect } from '@playwright/test'

test.describe('Buyer page', () => {
  test('loads and shows catalog or orders section', async ({ page }) => {
    await page.goto('/buyer')
    await expect(
      page.getByRole('heading', { name: /Покупатель|Xaridor|Buyer/ })
    ).toBeVisible()
  })

  test('has catalog or reels tab', async ({ page }) => {
    await page.goto('/buyer')
    await expect(
      page.getByRole('button', { name: /Каталог|Katalog|Catalog/ })
    ).toBeVisible()
  })
})
