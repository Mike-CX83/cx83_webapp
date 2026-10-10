import { expect, test } from '@playwright/test'

const base = 'http://localhost:3000'

test.describe('CX83 Run 2 first-party proof and connected systems', () => {
  test('home has real first-party proof, ownership and development studio story', async ({ page }) => {
    await page.goto(base + '/')
    await expect(page.getByTestId('cx83-proof-panel')).toContainText('29')
    await expect(page.getByTestId('cx83-proof-panel')).toContainText('46')
    await expect(page.getByTestId('cx83-proof-panel')).toContainText('Before')
    await expect(page.getByTestId('cx83-proof-panel')).toContainText('After')
    await expect(page.getByTestId('cx83-system-map')).toBeVisible()
    await expect(page.getByTestId('cx83-ownership')).toContainText('Software you can keep')
    await expect(page.getByTestId('cx83-brand-studio-feature')).toContainText('0.8.4')
    await expect(page.getByRole('link', { name: 'Explore the complete approach', exact: false })).toHaveAttribute('href', '/how-it-works')
  })

  test('separate owner and visitor paths have seven working controls', async ({ page }) => {
    await page.goto(base + '/how-it-works')
    const map = page.getByTestId('cx83-system-map')
    await expect(map.getByRole('button')).toHaveCount(7)
    await expect(map.getByRole('region', { name: 'Authorized website tools' })).toContainText('CAT does not have these tools')
    await map.getByRole('button', { name: /CAT assistant/ }).click()
    await expect(map.getByRole('button', { name: /CAT assistant/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(map.getByRole('region', { name: 'CAT assistant' })).toContainText('never owner editing')
    await expect(map.getByRole('button', { name: /Business owner/ })).toHaveAttribute('aria-pressed', 'false')
    await map.getByText('Technical details and optional tool types').click()
    await expect(map).toContainText('GitHub')
  })

  test('system map supports keyboard selection and is not a dead illustration', async ({ page }) => {
    await page.goto(base + '/how-it-works')
    const ownerControl = page.getByTestId('cx83-system-map').getByRole('button', { name: /Business owner/ })
    await ownerControl.focus()
    await page.keyboard.press('Enter')
    await expect(ownerControl).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('cx83-system-detail')).toContainText('owner chooses access')
    const visitorControl = page.getByTestId('cx83-system-map').getByRole('button', { name: /Website visitor/ })
    await visitorControl.focus()
    await page.keyboard.press('Space')
    await expect(visitorControl).toHaveAttribute('aria-pressed', 'true')
  })

  test('software routes retain development-only status and genuine CX83 artwork', async ({ page }) => {
    await page.goto(base + '/software/client-brand-studio')
    await expect(page.getByTestId('cx83-brand-studio-feature')).toContainText('0.8.4')
    await expect(page.getByTestId('cx83-brand-studio-feature').locator('img')).toHaveAttribute('src', /logo-light\.svg/)
    await expect(page.getByRole('heading', { name: 'Customer release not available yet.' })).toBeVisible()
    await expect(page.getByRole('link', { name: /^(Buy|Download|Checkout|Purchase)/i })).toHaveCount(0)
    await page.goto(base + '/software/connected-websites')
    await expect(page.getByTestId('cx83-system-map')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Customer release not available yet.' })).toBeVisible()
  })

  for (const width of [320, 390, 768, 1440]) {
    test('Run 2 home, systems and product screens fit ' + width + 'px', async ({ page }, testInfo) => {
      test.setTimeout(120_000)
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/', '/how-it-works', '/software', '/software/client-brand-studio']) {
        await page.goto(base + route)
        await page.evaluate(() => document.fonts.ready)
        const actual = await page.evaluate(() => document.documentElement.scrollWidth)
        expect(actual, route + ' page overflows ' + width + 'px').toBeLessThanOrEqual(width)
        if (route === '/how-it-works' && (width === 390 || width === 1440)) {
          const screenshot = testInfo.outputPath('homepage-run2-system-map-' + width + '.png')
          await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
          await testInfo.attach('run2-system-map-' + width, { path: screenshot, contentType: 'image/png' })
        }
      }
    })
  }
})
