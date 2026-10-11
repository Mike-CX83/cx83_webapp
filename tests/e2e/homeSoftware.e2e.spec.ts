import { expect, test } from '@playwright/test'

test.describe('Software discovery on its dedicated page', () => {
  test('homepage is concise and catalog remains available', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('main #software')).toHaveCount(0)
    await page.locator('header').getByRole('link', { name: 'Software', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Software that puts you in control.' })).toBeVisible()
    const cards = page.locator('.cx83-software-card')
    await expect(cards).toHaveCount(2)
    await expect(cards.locator('.cx83-software-status')).toHaveText([
      'In development',
      'In development',
    ])
    await expect(cards.locator('a').first()).toHaveAttribute('href', '/software/connected-websites')
    await expect(cards.locator('a').last()).toHaveAttribute('href', '/software/client-brand-studio')
  })
  for (const width of [320, 390, 768, 1440]) {
    test('catalog fits ' + width + 'px', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('http://localhost:3000/software')
      await expect(page.locator('.cx83-software-grid')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      )
    })
  }
})
