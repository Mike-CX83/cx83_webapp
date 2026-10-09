import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('CX83 branded intake', () => {
  test('form fields have accessible labels, constraints and clear validation errors', async ({ page }) => {
    await page.goto(host + '/contact')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('work better')
    await expect(page.getByText('Tell us what you have in mind.')).toBeVisible()
    const name = page.getByRole('textbox', { name: 'Name' })
    const email = page.getByRole('textbox', { name: 'Email' })
    const message = page.getByRole('textbox', { name: 'Message' })
    await expect(name).toHaveAttribute('maxlength', '120')
    await expect(email).toHaveAttribute('maxlength', '200')
    await expect(message).toHaveAttribute('maxlength', '5000')
    await page.getByRole('button', { name: 'Send inquiry' }).click()
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAttribute('aria-describedby', 'name-error')
    await expect(page.locator('#name-error')).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(1)
  })

  test('a synthetic inquiry is saved before success is shown', async ({ page }) => {
    await page.goto(host + '/contact')
    await page.getByRole('textbox', { name: 'Name' }).fill('CX83 Synthetic CI Test')
    await page.getByRole('textbox', { name: 'Email' }).fill('qa-test@example.invalid')
    await page.getByRole('textbox', { name: 'Message' }).fill('Automated synthetic submission for CX83 website test environment only. No real customer.')
    await page.getByRole('button', { name: 'Send inquiry' }).click()
    await expect(page.getByRole('status')).toContainText('saved')
  })

  for(const width of [320,390,768]) {
    test('contact page fits ' + width + 'px', async ({ page }) => {
      await page.setViewportSize({width, height: 900})
      await page.goto(host + '/contact')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    })
  }
})
