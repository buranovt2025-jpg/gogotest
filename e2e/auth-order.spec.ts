import { test, expect } from '@playwright/test'

test.describe('Auth and create order (requires API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const apiHint = await page.getByText(/Вход доступен только при подключённом API|VITE_API_URL/).isVisible()
    if (apiHint) {
      test.skip()
    }
  })

  test('register, add to cart, checkout, order appears in list', async ({ page }) => {
    const email = `e2e-${Date.now()}@test.local`
    const password = 'e2e-pass-1234'

    await page.getByRole('button', { name: /Регистрация|Register/ }).click()
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { type: 'submit' }).click()

    await expect(page).toHaveURL(/\//)
    await page.goto('/buyer')
    await page.getByRole('button', { name: /Каталог|Catalog/ }).click()

    await expect(page.getByText(/Смартфон|Наушники|Зарядка/).first()).toBeVisible({ timeout: 10000 })
    const addBtn = page.getByRole('button', { name: /В корзину|Add to cart|Savatga/ }).first()
    await addBtn.click()

    await expect(page.getByText(/Корзина|Cart|Savat/)).toBeVisible()
    await page.getByRole('button', { name: /Оформить заказ|Checkout|Buyurtma/ }).click()

    await expect(page.getByText(/Новый|New|Yangi/).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('29')).toBeVisible()
  })
})
