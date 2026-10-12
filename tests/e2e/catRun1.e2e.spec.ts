import { expect, test } from '@playwright/test'

test.describe('Run 1 / Catalyst X83 visual identity and Cat', () => {
  test('desktop navigation, founder story and authentic branding', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/about')
    const primary = page.getByRole('navigation', { name: 'Primary' })
    await expect(primary.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    await expect(primary.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    // Interior Run 3 replaces the former origin narrative with Mike's locked story.
    await expect(page.getByRole('heading', { level: 1, name: 'About CX83 Labs' })).toBeVisible()
    await expect(page.getByTestId('approved-about-story').locator('p')).toHaveCount(5)
    await expect(page.getByTestId('approved-about-story')).toContainText('Our founder, Mike Hankins, spent nearly two decades in nursing and hospice care')
    await expect(page.locator('main')).not.toContainText('Catalyst X83')
    await expect(page).toHaveTitle('About CX83 Labs')
    await expect(page.locator('header.cx83-site-header').getByRole('link', { name: 'CX83 Labs, Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start a conversation', exact: false })).toHaveAttribute('href', '/contact')
    const screenshot = testInfo.outputPath('homepage-about-1440.png')
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
    await testInfo.attach('about-desktop', { path: screenshot, contentType: 'image/png' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440)
  })

  test('Cat opens from desktop navigation with verified public starter paths', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/services')
    await page.locator('header.cx83-site-header').getByRole('button', { name: 'Ask Cat' }).click()
    const dialog = page.getByRole('dialog', { name: /Cat/ })
    await expect(dialog).toBeVisible()
    for (const starter of [
      'Which CX83 service fits my business?',
      'Can CX83 connect my current tools?',
      'What does an AI setup include?',
      'How do I discuss a website project?',
    ]) {
      await expect(dialog.getByRole('button', { name: starter })).toBeVisible()
    }
    await expect(dialog.getByRole('link', { name: /Contact CX83/ })).toHaveAttribute('href', '/contact')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.locator('header.cx83-site-header').getByRole('button', { name: 'Ask Cat' })).toBeFocused()
  })

  for (const width of [320, 390, 768]) {
    test('mobile navigation and Cat fit ' + width + 'px', async ({ page }, testInfo) => {
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
      await mobile.getByRole('button', { name: 'Ask Cat' }).click()
      await expect(mobile).toBeHidden()
      const dialog = page.getByRole('dialog', { name: /Cat/ })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('heading', { name: 'What can we help you explore?' })).toBeInViewport({ ratio: 1 })
      await expect(dialog.getByRole('button', { name: 'How can AI update a website?' })).toBeVisible()
      if (width === 390) {
        const screenshot = testInfo.outputPath('homepage-cat-390.png')
        await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' })
        await testInfo.attach('Cat-mobile', { path: screenshot, contentType: 'image/png' })
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
    })
  }
})
