import { expect, test } from '@playwright/test'

test.describe('Approved connection visuals', () => {
  test('homepage overview leads to examples and demonstration leads to software', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByTestId('connection-overview')).toBeVisible()
    await expect(page.locator('.cx83-demo-product')).toContainText('Software in development')
    await page.getByRole('link', { name: /Explore connected websites/ }).click()
    await expect(page).toHaveURL(/\/software\/connected-websites$/)
    await page.goBack()
    await page.getByRole('link', { name: /Explore the connections/ }).click()
    await expect(page).toHaveURL(/\/how-it-works#examples$/)
    await expect(page.locator('#examples')).toBeVisible()
    await expect(page.locator('#examples')).toContainText('Example connections. We choose and test tools for each client.')
    await expect(page.getByTestId('systems-map')).not.toBeVisible()
    const disclosure = page.locator('.cx83-technical-disclosure > summary')
    await disclosure.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('systems-map')).toBeVisible()
    await disclosure.press('Enter')
    await expect(page.getByTestId('systems-map')).not.toBeVisible()
  })

  for (const width of [320, 390, 768, 1440, 2560, 3440]) {
    test(`connection visuals load and remain understandable at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/', '/how-it-works']) {
        await page.goto('http://localhost:3000' + route)
        const images = page.locator('.cx83-connection-image')
        await expect(images).toHaveCount(route === '/' ? 1 : 3)
        for (const img of await images.all()) {
          await img.scrollIntoViewIfNeeded()
          await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
          const box = await img.boundingBox()
          expect(box).not.toBeNull()
          expect(Math.abs(box!.width / box!.height - 1.5)).toBeLessThan(0.03)
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
        if (width < 1024) {
          const copy = page.locator('.cx83-connection-mobile-text').first()
          const box = await copy.boundingBox()
          expect(box!.width).toBeGreaterThan(200)
          await expect(copy).toContainText(route === '/' ? 'Your team reviews and approves.' : 'Your team chooses the next step.')
        }
        if (width === 390 || width === 1440) {
          const path = testInfo.outputPath(`homepage-connections-${route === '/' ? 'home' : 'examples'}-${width}.png`)
          await page.screenshot({ path, fullPage: true, animations: 'disabled' })
          await testInfo.attach('connection-layout', { path, contentType: 'image/png' })
        }
      }
    })
  }
})
