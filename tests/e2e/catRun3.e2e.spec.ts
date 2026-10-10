import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('Run 3 CX83 launch consistency gate', () => {
  test('desktop page families and fallback routes are reachable, not empty', async ({ page }) => {
    for (const route of ['/', '/about', '/services', '/software', '/software/connected-websites', '/software/client-brand-studio', '/how-it-works', '/work', '/contact']) {
      const response = await page.goto(host + route)
      expect(response?.status(), route).toBe(200)
      await expect(page.locator('main h1').first(), 'heading for ' + route).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'desktop overflow ' + route).toBeLessThanOrEqual(1440)
    }
    await page.screenshot({ path: 'test-results/homepage-run3-desktop.png', fullPage: true, animations: 'disabled' })
  })

  test('FAQ is keyboard accessible and separates visitor and owner AI', async ({ page }) => {
    await page.goto(host + '/how-it-works#questions')
    await expect(page.getByRole('heading', { name: 'Good questions before you start.' })).toBeVisible()
    const disclosure = page.getByText('Can an AI actually update my website?')
    await disclosure.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByText(/CAT, the visitor assistant on this website, cannot edit or deploy code/)).toBeVisible()
    await expect(page.getByText(/There is no customer installer available yet/)).toHaveCount(1)
  })

  test('visitor cannot reach owner dispatch endpoint', async ({ request }) => {
    const response = await request.post(host + '/api/inquiries/dispatch', { data: { submissionId: 1 } })
    expect(response.status()).toBe(404)
  })

  test('unknown routes show branded 404 and actual recovery links', async ({ page }) => {
    const response = await page.goto(host + '/cx83-definitely-not-a-route')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'That page is not here.' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Return home/ })).toHaveAttribute('href', '/')
    await expect(page.getByRole('link', { name: 'Contact CX83' })).toHaveAttribute('href', '/contact')
  })

  test('protected development site does not claim an approved search listing', async ({ page }) => {
    await page.goto(host + '/software')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    const result = await page.request.get(host + '/robots.txt')
    expect(result.status()).toBe(200)
    expect(await result.text()).toMatch(/Disallow:\s*\/\s*$/m)
  })

  test('mobile nav routes to the FAQ without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(host + '/')
    const menu = page.getByRole('button', { name: 'Menu' })
    await menu.click()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'How it works' }).click()
    await expect(page.getByRole('heading', { name: 'Your work. Connected tools. Clear control.' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.screenshot({ path: 'test-results/homepage-run3-howitworks-mobile.png', fullPage: true, animations: 'disabled' })
  })
})
