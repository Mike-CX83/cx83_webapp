import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('Cat header visual refinement', () => {
  for (const width of [320, 390, 1440]) {
    test(`Cat header stays readable and interactive at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 })
      await page.route('**/api/assistant-status', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ configured: true, enabled: true }) }),
      )
      await page.goto(host + '/')

      const launcher = page.locator('button.cx83-assistant-launcher')
      await launcher.click()
      const dialog = page.getByRole('dialog', { name: 'Cat, the CX83 Labs AI assistant' })
      await expect(dialog).toBeVisible()
      const header = dialog.locator('.cx83-cat-header')
      const title = header.locator('#cx83-assistant-title')
      const close = dialog.getByRole('button', { name: 'Close Cat' })
      await expect(title).toHaveText(/Cat\s*\/ CX83 Labs AI Assistant/)
      await expect(header.locator('.cx83-cat-eyebrow')).toHaveCount(0)
      await expect(header.getByText('Assistant configured')).toBeVisible()
      await expect(close).toBeFocused()
      await expect(header.locator('.cx83-cat-symbol img')).toHaveAttribute('src', /symbol-showcase\.svg/)

      const layout = await header.evaluate((element) => {
        const logo = element.querySelector<HTMLElement>('.cx83-cat-symbol')!
        const heading = element.querySelector<HTMLElement>('.cx83-cat-heading')!
        const closeButton = element.querySelector<HTMLElement>('.cx83-cat-close')!
        const logoStyle = getComputedStyle(logo)
        const headerRect = element.getBoundingClientRect()
        const headingRect = heading.getBoundingClientRect()
        const closeRect = closeButton.getBoundingClientRect()
        return {
          logoBackground: logoStyle.backgroundColor,
          logoBorder: logoStyle.borderWidth,
          logoShadow: logoStyle.boxShadow,
          clipped: element.scrollWidth > element.clientWidth + 1,
          headingOverlapsClose: headingRect.right > closeRect.left + 1,
          closeWithinHeader: closeRect.right <= headerRect.right + 1,
          closeHeight: closeRect.height,
        }
      })
      expect(layout.logoBackground).toBe('rgba(0, 0, 0, 0)')
      expect(layout.logoBorder).toBe('0px')
      expect(layout.logoShadow).toBe('none')
      expect(layout.clipped).toBe(false)
      expect(layout.headingOverlapsClose).toBe(false)
      expect(layout.closeWithinHeader).toBe(true)
      expect(layout.closeHeight).toBeGreaterThanOrEqual(40)

      const input = dialog.getByRole('textbox', { name: 'Message Cat' })
      await input.fill('Can CX83 connect my tools?')
      await expect(input).toHaveValue('Can CX83 connect my tools?')
      await test.info().attach(`cat-header-${width}px`, { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' })
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(launcher).toBeFocused()
    })
  }

  test('unavailable status is not mislabeled as configured', async ({ page }) => {
    await page.route('**/api/assistant-status', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ configured: false, enabled: true }) }),
    )
    await page.goto(host + '/')
    await page.locator('button.cx83-assistant-launcher').click()
    const dialog = page.getByRole('dialog', { name: 'Cat, the CX83 Labs AI assistant' })
    await expect(dialog.getByText('Assistant temporarily unavailable')).toBeVisible()
    await expect(dialog.getByText('Assistant configured')).toHaveCount(0)
    await expect(dialog.getByRole('link', { name: /Contact CX83/ })).toHaveAttribute('href', '/contact')
  })
})
