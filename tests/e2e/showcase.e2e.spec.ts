import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('CX83 genuine website demonstration media', () => {
  test('features the recovered v2 video without changing original hero or separate AI roles', async ({ page }) => {
    await page.goto(host + '/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Systems for work that should not stay manual.')
    await expect(page.getByRole('heading', { level: 2, name: /Your website.*Your AI.*Just ask/s })).toBeVisible()
    await expect(page.getByTestId('homepage-banner')).toHaveAttribute('src', /cx83-labs-hero\.avif/)
    await expect(page.getByRole('link', { name: /Watch a real website change/ })).toHaveAttribute('href', '#website-demo')
    await expect(page.getByTestId('cx83-proof-panel')).toHaveCount(0)
    await expect(page.locator('#website-demo video')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'An AI connected to your website.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'An AI that helps your customers.' })).toBeVisible()
  })

  test('serves verified real MP4, original poster, timed captions and text proof', async ({ page, request }) => {
    await page.goto(host + '/')
    const video = page.locator('#website-demo video')
    await expect(video).toHaveAttribute('controls', '')
    await expect(video).toHaveAttribute('preload', 'none')
    await expect(video).toHaveAttribute('poster', '/showcase/cx83-website-showcase-poster-v2.jpg')
    await expect(video.locator('source')).toHaveAttribute('src', '/showcase/cx83-website-showcase-v2.mp4')
    await expect(video.locator('track')).toHaveAttribute('src', '/showcase/cx83-website-showcase-v2.en.vtt')

    for (const [asset, type] of [
      ['/showcase/cx83-website-showcase-poster-v2.jpg', 'image/'],
      ['/showcase/cx83-website-showcase-v2.mp4', 'video/'],
      ['/showcase/cx83-website-showcase-v2.en.vtt', 'text/'],
    ] as const) {
      const response = await request.head(host + asset)
      expect(response.ok(), 'Missing verified media asset ' + asset).toBe(true)
      expect(response.headers()['content-type'] || '').toContain(type)
    }

    const posterSize = await page.evaluate(async () => {
      const image = new Image()
      image.src = '/showcase/cx83-website-showcase-poster-v2.jpg'
      await image.decode()
      return [image.naturalWidth, image.naturalHeight]
    })
    expect(posterSize).toEqual([1920, 1080])

    await video.evaluate((element: HTMLVideoElement) => element.load())
    await expect.poll(
      () => video.evaluate((element: HTMLVideoElement) => element.readyState >= 1 && element.duration > 49 && element.duration < 50),
      { timeout: 15000 },
    ).toBe(true)

    await page.locator('#website-demo summary').click()
    await expect(page.getByText('The authorized CX83 development connection performed actual website work.')).toBeVisible()
    await expect(page.getByRole('link', { name: /Read the evidence record/ })).toHaveAttribute('href', '/how-it-works#real-proof')
  })

  for (const width of [320, 390, 768, 1440]) {
    test('real demonstration fits ' + width + 'px viewport', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(host + '/')
      await expect(page.locator('#website-demo video')).toBeVisible()
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(documentWidth).toBeLessThanOrEqual(width)
    })
  }
})
