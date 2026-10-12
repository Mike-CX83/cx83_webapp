import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'
const routes = [
  '/software', '/software/connected-websites', '/software/client-brand-studio',
  '/services', '/how-it-works', '/work', '/contact', '/posts', '/search',
]

for (const width of [390, 1440]) {
  test('interior banners and compact footer at ' + width + 'px', async ({ page }, testInfo) => {
    test.setTimeout(180_000)
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const route of routes) {
      const response = await page.goto(host + route)
      expect(response?.status(), route).toBe(200)
      await page.evaluate(() => document.fonts.ready)
      const hero = page.locator('.cx83-interior-hero')
      await expect(hero).toBeVisible()
      await expect(page.locator('main h1')).toHaveCount(1)
      const bounds = await hero.boundingBox()
      const heading = await hero.locator('h1').boundingBox()
      expect(heading!.y).toBeGreaterThanOrEqual(bounds!.y)
      expect(heading!.y + heading!.height).toBeLessThan(bounds!.y + bounds!.height)
      if (width === 1440) {
        // Common desktop height and title position across index and nested detail pages.
        expect(bounds!.height, route).toBeCloseTo(337, 0)
        expect(heading!.y - bounds!.y, route).toBeCloseTo(84, 0)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      if (route === '/software/client-brand-studio' || route === '/services') {
        await page.screenshot({ path: testInfo.outputPath('interior-banner-' + route.replaceAll('/', '_') + '-' + width + '.png'), animations: 'disabled' })
      }
    }

    const footer = page.locator('footer.cx83-footer-refined')
    await footer.scrollIntoViewIfNeeded()
    const nav = footer.getByRole('navigation', { name: 'Footer navigation' })
    await expect(nav.getByRole('link')).toHaveCount(7)
    await expect(footer.locator('.cx83-footer-email')).toHaveAttribute('href', /^mailto:/)
    const services = nav.getByRole('link', { name: 'Services', exact: true })
    await services.focus()
    await expect(services).toBeFocused()
    await expect(services).toHaveCSS('outline-style', 'solid')
    expect((await services.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    const email = await footer.locator('.cx83-footer-email').boundingBox()
    expect(email!.x).toBeGreaterThanOrEqual(0)
    expect(email!.x + email!.width).toBeLessThanOrEqual(width)
    await page.screenshot({ path: testInfo.outputPath('interior-footer-' + width + '.png'), animations: 'disabled' })
    await services.click()
    await expect(page).toHaveURL(host + '/services')
  })
}
