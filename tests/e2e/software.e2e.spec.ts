import { expect, test } from '@playwright/test'

const base = 'http://localhost:3000'
const products = [
  { slug: 'connected-websites', name: 'CX83 Connected Website Platform' },
  { slug: 'client-brand-studio', name: 'Client Brand Studio' },
]

test.describe('CX83 software catalog', () => {
  test('software navigation opens the real catalog and product details', async ({ page }) => {
    await page.goto(base + '/software')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tools you can make your own.')
    await expect(page.locator('.cx83-software-card')).toHaveCount(2)
    await expect(page.locator('.cx83-software-card .cx83-software-status')).toHaveText(['In development', 'In development'])
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Software' })).toHaveAttribute('aria-current', 'page')
    for (const { slug, name } of products) {
      await expect(page.locator('.cx83-software-card').filter({ hasText: name }).getByRole('link', { name: 'Explore the product', exact: false })).toHaveAttribute('href', '/software/' + slug)
      await page.goto(base + '/software/' + slug)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
      await expect(page.getByRole('heading', { name: 'Customer release not available yet.' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Ask about this software', exact: false })).toHaveAttribute('href', '/contact')
      await expect(page.getByRole('link', { name: 'All CX83 software', exact: false })).toHaveAttribute('href', '/software')
      await expect(page.getByRole('link', { name: /^(Buy|Download|Checkout|Purchase)/i })).toHaveCount(0)
      await page.goto(base + '/software')
    }
  })

  test('unknown software slug returns a 404', async ({ page }) => {
    const response = await page.goto(base + '/software/not-a-real-product')
    expect(response?.status()).toBe(404)
  })

  for (const width of [320, 390, 768, 1440]) {
    test('software pages fit ' + width + 'px without overflow', async ({ page }) => {
      test.setTimeout(120_000)
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/software', '/software/connected-websites', '/software/client-brand-studio']) {
        await page.goto(base + route)
        await page.evaluate(() => document.fonts.ready)
        expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBeLessThanOrEqual(width)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      }
    })
  }
})
