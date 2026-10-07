import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/CX83 Labs/)
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Systems for work that should not stay manual.')
  })
})
