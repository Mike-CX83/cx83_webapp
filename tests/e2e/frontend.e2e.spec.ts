import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/CX83 Labs/)
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Systems for work that should not stay manual.')
    await expect(page.locator('.cx83-home-hero').getByRole('link', { name: 'Start a conversation', exact: false })).toHaveAttribute('href', '/contact')
    await expect(page.getByRole('link', { name: 'See a real website change', exact: false })).toHaveAttribute('href', '#website-proof')
    await expect(page.getByRole('link', { name: 'Explore services', exact: true })).toHaveAttribute('href', '/services')
    await expect(page.getByText('Published projects will appear here. None are published yet.')).toHaveCount(0)
  })

  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    test(`homepage fits ${viewport.width}px and keeps the banner intact`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      await page.goto('http://localhost:3000')
      const banner = page.getByTestId('homepage-banner')
      await expect(banner).toBeVisible()
      await expect.poll(() => banner.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0), { timeout: 15000 }).toBe(true)
      const box = await banner.boundingBox()
      expect(box).not.toBeNull()
      if (!box) throw new Error('Banner has no rendered dimensions')
      expect(Math.abs(box.width / box.height - 960 / 319)).toBeLessThan(0.03)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
      await page.evaluate(() => document.fonts.ready)
      const screenshot = testInfo.outputPath(`homepage-${viewport.width}.png`)
      await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
      await testInfo.attach(`homepage-${viewport.width}`, { path: screenshot, contentType: 'image/png' })
      if (viewport.width === 390) {
        const menu = page.getByRole('button', { name: 'Menu', exact: true })
        await menu.click()
        const mobileNavigation = page.getByRole('navigation', { name: 'Mobile', exact: true })
        await expect(mobileNavigation).toBeVisible()
        await mobileNavigation.getByRole('link', { name: 'Services', exact: true }).click()
        await expect(page).toHaveURL(/\/services$/)
      }
    })
  }
})
