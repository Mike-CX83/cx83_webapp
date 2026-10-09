import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('Phase 2 CX83 real website demonstration', () => {
  test('the visitor can navigate to the real demo and distinguish the two AI roles', async ({ page }) => {
    await page.goto(host + '/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your AI.')
    await expect(page.locator('#website-demo video')).toHaveAttribute('controls', '')
    await expect(page.locator('#website-demo video')).toHaveAttribute('preload', 'none')
    await expect(page.locator('#website-demo video source')).toHaveAttribute('src', '/showcase/cx83-website-showcase-v2.mp4')
    await expect(page.locator('#website-demo video track[kind="captions"]')).toHaveAttribute('src', '/showcase/cx83-website-showcase-v2.en.vtt')

    const action = page.getByRole('link', { name: 'Watch a real website change', exact: false })
    await action.click()
    await expect(page).toHaveURL(/#website-demo$/)

    await expect(page.getByRole('heading', { name: 'An AI connected to your website.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'An AI that helps your customers.' })).toBeVisible()
  })

  test('real preview poster, video and captions are served as actual media files', async ({ request }) => {
    // This remains a deliberate release gate until Mike's exact v2 source assets
    // have been inspected and made available. No simulated or stock substitutions.
    for (const [asset, type] of [
      ['/showcase/cx83-website-showcase-poster-v2.jpg', 'image/'],
      ['/showcase/cx83-website-showcase-v2.mp4', 'video/'],
      ['/showcase/cx83-website-showcase-v2.en.vtt', 'text/'],
    ] as const) {
      const response = await request.head(host + asset)
      expect(response.ok(), 'Missing verified Phase 2 media: ' + asset).toBe(true)
      expect(response.headers()['content-type'] || '').toContain(type)
    }
  })

  test('phase 2 media can load video metadata in the browser', async ({ page }) => {
    await page.goto(host + '/')
    const video = page.locator('#website-demo video')
    await video.evaluate((element: HTMLVideoElement) => element.load())
    await expect.poll(
      () => video.evaluate((element: HTMLVideoElement) => element.readyState >= 1 && Number.isFinite(element.duration)),
      { timeout: 15_000 },
    ).toBe(true)
  })

  for (const width of [320, 390, 768, 1440]) {
    test('demo hero fits the ' + width + 'px viewport', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(host + '/')
      await expect(page.locator('#website-demo')).toBeVisible()
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(documentWidth).toBeLessThanOrEqual(width)
    })
  }
})
