import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('Run 2 connected systems and proof', () => {
  test('home keeps the banner and shows first-party proof, systems and development status', async ({ page }) => {
    await page.goto(host + '/')
    await expect(page.getByTestId('homepage-banner')).toHaveAttribute('src', /cx83-labs-hero/)
    await expect(page.getByTestId('cx83-proof-panel')).toContainText('Before. Request. After.')
    await expect(page.getByRole('link', { name: /Read the evidence record/ })).toHaveAttribute('href', '/how-it-works#real-proof')
    await expect(page.getByTestId('systems-map')).toBeVisible()
    await expect(page.getByTestId('brand-studio-spotlight')).toContainText('0.8.4')
    await expect(page.getByRole('img', { name: 'Authentic CX83 Labs logo' })).toHaveAttribute('src', /logo-dark.svg/)
    await expect(page.getByRole('link', { name: /Explore the system in detail/ })).toHaveAttribute('href', '/how-it-works')
  })

  test('seven interactive layers keep CAT outside owner authority', async ({ page }) => {
    await page.goto(host + '/how-it-works')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your work. Connected tools. Clear control.')
    await expect(page.getByTestId('systems-layer')).toHaveCount(7)
    const cat = page.getByRole('button', { name: /Visitor CAT/ })
    await cat.click()
    await expect(cat).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('systems-active-detail')).toContainText('Cannot edit source')
    const tools = page.getByRole('button', { name: /Authorized tools/ })
    await tools.focus()
    await page.keyboard.press('Enter')
    await expect(tools).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('systems-active-detail')).toContainText('The software does the real work')
    await page.locator('.cx83-systems-technical summary').click()
    await expect(page.locator('.cx83-systems-technical')).toHaveAttribute('open', '')
  })

  test('products show source-led visuals without premature sales', async ({ page }) => {
    await page.goto(host + '/software')
    await expect(page.getByTestId('brand-studio-spotlight')).toContainText('actual brand')
    await page.goto(host + '/software/client-brand-studio')
    await expect(page.getByTestId('brand-studio-spotlight')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Customer release not available yet.' })).toBeVisible()
    await expect(page.getByText('development build 0.8.4').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Buy now|Download now|Start trial/i })).toHaveCount(0)
    await page.goto(host + '/software/connected-websites')
    await expect(page.getByText('Actual example: this CX83 website')).toBeVisible()
    await expect(page.getByRole('link', { name: /See the real site workflow/ })).toHaveAttribute('href', '/how-it-works#real-proof')
  })

  test('Brand Studio step indices remain single-line on narrow screens', async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(host + '/software/client-brand-studio')
      const indices = page.locator('.cx83-studio-steps strong')
      await expect(indices).toHaveText(['01', '02', '03'])
      const whiteSpace = await indices.evaluateAll((nodes) =>
        nodes.map((node) => window.getComputedStyle(node).whiteSpace),
      )
      expect(whiteSpace).toEqual(['nowrap', 'nowrap', 'nowrap'])
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    }
  })

  for (const width of [320, 390, 768, 1440]) {
    test('map and product fit ' + width + 'px viewport', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/how-it-works', '/software/client-brand-studio']) {
        await page.goto(host + route)
        expect(await page.evaluate(() => document.documentElement.scrollWidth), route + ' horizontal overflow').toBeLessThanOrEqual(width)
      }
      if (width === 390 || width === 1440) {
        await page.goto(host + '/')
        await page.screenshot({ path: 'test-results/homepage-run2-' + width + '.png', fullPage: true })
      }
    })
  }
})
