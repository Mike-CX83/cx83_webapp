import { expect, test } from '@playwright/test'

test.describe('CX83 homepage software discovery', () => {
  test('shows real prerelease products below the original banner, with useful links', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const hero = page.locator('main .cx83-home > section').first()
    await expect(hero).toHaveClass(/cx83-home-hero/)
    await expect(hero.getByTestId('homepage-banner')).toBeVisible()
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Systems for work that should not stay manual.')
    const section = page.locator('#software')
    await expect(section.getByRole('heading', { name: 'Tools you can make your own.' })).toBeVisible()
    await expect(section.getByRole('link', { name: 'Explore CX83 software', exact: false })).toHaveAttribute('href', '/software')
    const cards = section.locator('.cx83-home-service-card')
    await expect(cards).toHaveCount(2)
    await expect(cards.locator('.cx83-home-software-status')).toHaveText(['In development', 'In development'])
    await expect(cards.getByRole('link', { name: 'Explore the software', exact: false }).first()).toHaveAttribute('href', '/software/connected-websites')
    await expect(cards.getByRole('link', { name: 'Explore the software', exact: false }).last()).toHaveAttribute('href', '/software/client-brand-studio')
  })

  for (const width of [320, 390, 768, 1440]) {
    test('homepage teaser fits ' + width + 'px without horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('http://localhost:3000')
      await expect(page.locator('#software')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    })
  }
})
