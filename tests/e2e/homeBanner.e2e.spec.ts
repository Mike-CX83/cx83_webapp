import { expect, test } from '@playwright/test'

test.describe('CX83 original homepage banner preservation', () => {
  for (const width of [320, 390, 768, 1440, 2560, 3440]) {
    test(`banner remains original at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('http://localhost:3000')

      const hero = page.locator('main .cx83-home > section').first()
      await expect(hero).toHaveClass(/cx83-home-hero/)
      await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Systems for work that should not stay manual.')

      const bannerWrapper = hero.locator('.cx83-home-banner')
      await expect(bannerWrapper).toBeVisible()
      const banner = bannerWrapper.getByTestId('homepage-banner')
      await expect(banner).toHaveAttribute('alt', 'CX83 Labs illuminated logo in electric blue, silver, and violet')
      await expect(banner).toHaveAttribute('width', '960')
      await expect(banner).toHaveAttribute('height', '319')
      await expect(banner).toHaveAttribute('sizes', '(min-width: 768px) 720px, 100vw')
      await expect(banner).toHaveAttribute('src', /cx83-labs-hero\.avif/)
      await expect.poll(() => banner.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)

      const band = await bannerWrapper.boundingBox()
      expect(band?.width).toBe(width)
      if (width >= 768) expect(band?.height).toBeLessThanOrEqual(260)
      const rect = await banner.boundingBox()
      expect(rect).not.toBeNull()
      if (!rect) throw new Error('Original CX83 banner did not render')
      expect(Math.abs(rect.width / rect.height - 960 / 319)).toBeLessThan(0.03)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)

      // Phase 2 content comes after, never in place of, the original full banner.
      await expect(page.getByRole('heading', { level: 2, name: /Your website.*Your AI.*Just ask/s })).toBeVisible()
      await expect(page.getByTestId('homepage-banner')).toHaveCount(1)

      if (width === 390 || width === 1440) {
        const screenshot = testInfo.outputPath(`homepage-banner-original-${width}.png`)
        await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
        await testInfo.attach(`banner-original-${width}`, { path: screenshot, contentType: 'image/png' })
      }
    })
  }
})
