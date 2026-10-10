import { expect, test } from '@playwright/test'

test.describe('Run 1 / Catalyst X83 visual identity and CAT', () => {
  test('desktop navigation, founder story and authentic branding', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/about')
    const primary = page.getByRole('navigation', { name: 'Primary' })
    await expect(primary.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    await expect(primary.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('heading', { name: 'Built from real work. Designed for what comes next.' })).toBeVisible()
    await expect(page.getByText(/Founder Mike Hankins came to software from a career in nursing and hospice care/)).toBeVisible()
    await expect(page.getByText(/In 2025, he founded Catalyst X83/)).toBeVisible()
    await expect(page.locator('.cx83-about-brand img[src="/brand/symbol-showcase.svg"]')).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'Start a conversation', exact: false })).toHaveAttribute('href', '/contact')
    const screenshot = testInfo.outputPath('homepage-about-1440.png')
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
    await testInfo.attach('about-desktop', { path: screenshot, contentType: 'image/png' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440)
  })

  test('CAT opens from desktop navigation with verified public starter paths', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/services')
    await page.locator('header.cx83-site-header').getByRole('button', { name: 'Ask CAT' }).click()
    const dialog = page.getByRole('dialog', { name: /CAT/ })
    await expect(dialog).toBeVisible()
    for (const starter of [
      'How can AI update a website?',
      'What is Client Brand Studio?',
      'Can CX83 connect my current tools?',
      'How do I start a project?',
    ]) {
      await expect(dialog.getByRole('button', { name: starter })).toBeVisible()
    }
    await expect(dialog.getByRole('link', { name: /Contact CX83/ })).toHaveAttribute('href', '/contact')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.locator('.cx83-assistant-launcher')).toBeFocused()
  })

  for (const width of [320, 390, 768]) {
    test('mobile navigation and CAT fit ' + width + 'px', async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('http://localhost:3000')
      const firstSection = page.locator('main .cx83-home > section').first()
      await expect(firstSection).toHaveClass(/cx83-home-hero/)
      await expect(firstSection.getByTestId('homepage-banner')).toBeVisible()
      const menu = page.getByRole('button', { name: 'Menu', exact: true })
      await expect(menu).toBeVisible()
      await expect(menu.locator('.cx83-menu-icon > span')).toHaveCount(3)
      await expect(menu).toHaveAttribute('aria-expanded', 'false')
      await menu.click()
      await expect(menu).toHaveAttribute('aria-expanded', 'true')
      const mobile = page.getByRole('navigation', { name: 'Mobile' })
      await expect(mobile.getByRole('link', { name: 'Home' })).toBeVisible()
      await mobile.getByRole('button', { name: 'Ask CAT' }).click()
      await expect(mobile).toBeHidden()
      const dialog = page.getByRole('dialog', { name: /CAT/ })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('button', { name: 'How can AI update a website?' })).toBeVisible()
      if (width === 390) {
        const greetingIsInViewport = await dialog.getByText('Welcome to CX83').evaluate((element) => {
          const viewport = element.closest('.cx83-cat-messages')?.getBoundingClientRect()
          const greeting = element.getBoundingClientRect()
          return Boolean(viewport && greeting.top >= viewport.top - 2 && greeting.bottom <= viewport.bottom + 2)
        })
        expect(greetingIsInViewport).toBe(true)
        const screenshot = testInfo.outputPath('homepage-cat-390.png')
        await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' })
        await testInfo.attach('CAT-mobile', { path: screenshot, contentType: 'image/png' })
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
    })
  }
})
