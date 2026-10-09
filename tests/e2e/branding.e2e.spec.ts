import { expect, test } from '@playwright/test'

const base = 'http://localhost:3000'

test.describe('CX83 shared brand system', () => {
  test('keeps linked original logos and common navigation across public pages', async ({ page }) => {
    test.setTimeout(120_000)
    for (const route of ['/', '/about', '/services', '/work', '/contact', '/posts', '/search']) {
      await page.goto(base + route)

      const header = page.locator('header.cx83-site-header')
      const footer = page.locator('footer.cx83-site-footer')

      await expect(header).toBeVisible()
      await expect(header.getByRole('link', { name: 'CX83 Labs, Home' })).toHaveAttribute('href', '/')
      await expect(header.locator('img[src="/brand/logo-light.svg"]')).toHaveCount(1)
      await expect(footer.getByRole('link', { name: 'CX83 Labs, Home' })).toHaveAttribute('href', '/')
      await expect(footer.locator('img[src="/brand/logo-dark.svg"]')).toHaveCount(1)
      await footer.scrollIntoViewIfNeeded()
      await expect.poll(async () => footer.locator('img[src="/brand/logo-dark.svg"]').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
      await expect(page.locator('main h1')).toHaveCount(1)
    }
  })

  test('shows active page and keyboard focus on desktop navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(base + '/services')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    const services = nav.getByRole('link', { name: 'Services' })
    await expect(services).toHaveAttribute('aria-current', 'page')
    await services.focus()
    await expect(services).toBeFocused()
  })

  test('mobile menu opens, closes with Escape, and navigates', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(base)
    const menu = page.getByRole('button', { name: 'Menu', exact: true })
    await menu.click()
    const nav = page.getByRole('navigation', { name: 'Mobile' })
    await expect(nav).toBeVisible()
    await nav.getByRole('link', { name: 'About' }).focus()
    await page.keyboard.press('Escape')
    await expect(nav).toBeHidden()
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await nav.getByRole('link', { name: 'Services' }).click()
    await expect(page).toHaveURL(/\/services$/)
    await expect(nav).toBeHidden()
  })

  for (const width of [320, 390, 768, 1440]) {
    test(`primary routes fit ${width}px viewport without horizontal overflow`, async ({ page }) => {
      test.setTimeout(120_000)
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/', '/about', '/services', '/work', '/contact']) {
        await page.goto(base + route)
        await page.evaluate(() => document.fonts.ready)
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        expect(documentWidth, `${route} at ${width}px`).toBeLessThanOrEqual(width)
      }
    })
  }
})
