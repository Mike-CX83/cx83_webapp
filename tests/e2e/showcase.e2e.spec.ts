import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('CX83 real website demonstration', () => {
  test('shows a genuine website change and explains separate AI roles', async ({ page }) => {
    await page.goto(host + '/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Systems for work that should not stay manual.')
    await expect(page.getByRole('heading', { level: 2, name: /Your website.*Your AI.*Just ask/s })).toBeVisible()
    await expect(page.getByTestId('cx83-proof-panel')).toBeVisible()
    const action = page.getByRole('link', { name: 'See a real website change', exact: false })
    await expect(action).toHaveAttribute('href', '#website-proof')
    await action.click()
    await expect(page).toHaveURL(/#website-proof$/)
    await expect(page.getByRole('heading', { name: 'An AI connected to your website.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'An AI that helps your customers.' })).toBeVisible()
  })

  test('never shows a broken Play button while original source media is pending', async ({ page }) => {
    await page.goto(host + '/')
    await expect(page.getByTestId('cx83-proof-panel')).toBeVisible()
    await expect(page.locator('#website-demo video')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Explore the updated website', exact: false })).toHaveAttribute('href', '/services')
  })

  test('video only appears with legitimate working assets when enabled', async ({ page, request }) => {
    await page.goto(host + '/')
    const video = page.locator('#website-demo video')
    if (await video.count() === 0) {
      await expect(page.getByTestId('cx83-proof-panel')).toBeVisible()
      return
    }
    await expect(video).toHaveAttribute('controls', '')
    await expect(video).toHaveAttribute('preload', 'none')
    for (const [asset, type] of [
      ['/showcase/cx83-website-showcase-poster-v2.jpg', 'image/'],
      ['/showcase/cx83-website-showcase-v2.mp4', 'video/'],
      ['/showcase/cx83-website-showcase-v2.en.vtt', 'text/'],
    ] as const) {
      const response = await request.head(host + asset)
      expect(response.ok(), 'Missing approved video asset: ' + asset).toBe(true)
      expect(response.headers()['content-type'] || '').toContain(type)
    }
    await video.evaluate((element: HTMLVideoElement) => element.load())
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 1 && Number.isFinite(element.duration)), { timeout: 15000 }).toBe(true)
  })

  for (const width of [320, 390, 768, 1440]) {
    test('home demonstration fits ' + width + 'px viewport', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(host + '/')
      await expect(page.getByTestId('cx83-proof-panel')).toBeVisible()
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(documentWidth).toBeLessThanOrEqual(width)
    })
  }
})
