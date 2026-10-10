import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('Connected Ecosystem showcase', () => {
  test('preserves original homepage banner and shows actual logo journey', async ({ page, request }) => {
    await page.goto(host + '/')
    await expect(page.getByTestId('homepage-banner')).toHaveAttribute('src', /cx83-labs-hero/)
    await expect(page.getByTestId('systems-map')).toBeVisible()
    await expect(page.getByText('One request. Connected systems. Real work.')).toBeVisible()
    await expect(page.getByRole('link', { name: /Explore all connections/ })).toHaveAttribute('href', '/how-it-works#system-map')
    for (const logo of ['openai.svg', 'github.svg']) {
      const response = await request.head(host + '/integrations/' + logo)
      expect(response.ok(), logo + ' is required').toBe(true)
      expect(response.headers()['content-type']).toContain('image/svg+xml')
    }
  })

  test('traces a verified website request with manual steps and source proof', async ({ page }) => {
    await page.goto(host + '/how-it-works')
    await expect(page.getByTestId('systems-layer')).toHaveCount(7)
    await expect(page.getByTestId('ecosystem-provider').first()).toBeVisible()
    await expect(page.getByTestId('ecosystem-step')).toContainText('Step 1 of 7')
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(page.getByTestId('ecosystem-step')).toContainText('Step 2 of 7')
    await expect(page.getByRole('link', { name: /See the actual proof record/ })).toHaveAttribute('href', '/how-it-works#real-proof')
    await page.getByRole('button', { name: /GitHub\. Demonstrated on CX83/ }).click()
    await expect(page.getByTestId('systems-active-detail')).toContainText('GitHub')
  })

  test('distinguishes illustrative automation and unavailable email delivery', async ({ page }) => {
    await page.goto(host + '/how-it-works')
    const workflow = page.getByTestId('ecosystem-scenario').filter({ hasText: 'Route a customer inquiry' })
    await workflow.click()
    await expect(workflow).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('ecosystem-step')).toContainText('Illustrative or developing route')
    await expect(page.getByText('Notification automation and email delivery remain unverified.')).toBeVisible()
    await page.getByRole('button', { name: 'Visitor CAT' }).click()
    await expect(page.getByTestId('systems-active-detail')).toContainText('Cannot edit source')
  })

  test('a separate public CAT lane never implies owner access', async ({ page }) => {
    await page.goto(host + '/how-it-works')
    await expect(page.getByTestId('visitor-lane')).toContainText('It has no link to private editing')
    await page.getByTestId('ecosystem-scenario').filter({ hasText: 'Ask visitor CAT' }).click()
    await expect(page.getByTestId('ecosystem-step')).toContainText('Step 1 of 4')
    const tools = page.getByRole('button', { name: 'Authorized tools' })
    await tools.focus()
    await page.keyboard.press('Enter')
    await expect(tools).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('systems-active-detail')).toContainText('The software does the real work')
  })

  for (const width of [320, 390, 768, 1440]) {
    test('ecosystem stays usable at ' + width + 'px', async ({ page }) => {
      await page.setViewportSize({ width, height: 850 })
      await page.goto(host + '/how-it-works')
      await expect(page.getByTestId('ecosystem-step')).toBeVisible()
      await expect(page.getByTestId('visitor-lane')).toBeVisible()
      await page.getByRole('button', { name: 'Next step' }).click()
      await expect(page.getByTestId('ecosystem-step')).toContainText('Step 2 of 7')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      if (width === 390 || width === 1440) {
        await page.screenshot({ path: 'test-results/homepage-ecosystem-' + width + '.png', fullPage: true })
      }
    })
  }
})
