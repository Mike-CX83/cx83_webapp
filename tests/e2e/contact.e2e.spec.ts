import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

const host = 'http://localhost:3000'

test.describe('CX83 branded intake', () => {
  test('client-side validation is immediate, accessible, and does not disable inputs', async ({ page }) => {
    await page.goto(host + '/contact')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('work better')
    await expect(page.getByText('Tell us what you have in mind.')).toBeVisible()
    const name = page.getByRole('textbox', { name: 'Name' })
    const email = page.getByRole('textbox', { name: 'Email' })
    const message = page.getByRole('textbox', { name: 'Message' })
    await expect(name).toHaveAttribute('maxlength', '120')
    await expect(email).toHaveAttribute('maxlength', '200')
    await expect(message).toHaveAttribute('maxlength', '5000')
    let posted = false
    await page.route('**/api/inquiries', async (route) => {
      posted = true
      await route.abort()
    })
    await page.getByRole('button', { name: 'Send inquiry' }).click()
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAttribute('aria-describedby', 'name-error')
    await expect(page.locator('#name-error')).toBeVisible()
    await expect(name).toBeEnabled()
    await expect(page.locator('form [role="alert"]')).toContainText('Nothing has been sent.')
    expect(posted).toBe(false)
  })

  test('a synthetic inquiry is saved before the page shows success', async ({ page }) => {
    await page.goto(host + '/contact')
    await page.getByRole('textbox', { name: 'Name' }).fill('CX83 Synthetic CI Test')
    await page.getByRole('textbox', { name: 'Email' }).fill('qa-test@example.invalid')
    await page.getByRole('textbox', { name: 'Message' }).fill('Automated synthetic submission for CX83 website test environment only. No real customer.')
    await page.getByRole('button', { name: 'Send inquiry' }).click()
    await expect(page.getByRole('status')).toContainText('saved')
  })

  test('an API failure never appears as a saved message; input survives retry', async ({ page }) => {
    await page.goto(host + '/contact')
    await page.route('**/api/inquiries', async (route) => {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Synthetic test: storage unavailable.' }) })
    })
    await page.getByRole('textbox', { name: 'Name' }).fill('Synthetic Retry')
    await page.getByRole('textbox', { name: 'Email' }).fill('retry@example.invalid')
    await page.getByRole('textbox', { name: 'Message' }).fill('Synthetic failure for testing only.')
    await page.getByRole('button', { name: 'Send inquiry' }).click()
    await expect(page.locator('form [role="alert"]')).toContainText('storage unavailable')
    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Synthetic Retry')
    await expect(page.getByRole('status')).toHaveCount(0)
  })

  test('same request ID is saved only once and reports provider status separately', async ({ request }) => {
    const data = {
      requestId: randomUUID(),
      name: 'CX83 Synthetic Idempotency',
      email: 'synthetic@example.invalid',
      organization: 'CX83 CI only',
      inquiryType: 'software',
      message: 'Synthetic data only. Verify durable contact storage and idempotency.',
    }
    const first = await request.post(host + '/api/inquiries', { data })
    expect(first.status()).toBe(201)
    const saved = await first.json()
    expect(saved.saved).toBe(true)
    expect(saved.duplicate).toBe(false)
    expect(saved.notification).toBeTruthy()
    const again = await request.post(host + '/api/inquiries', { data })
    expect(again.status()).toBe(200)
    const duplicate = await again.json()
    expect(duplicate.saved).toBe(true)
    expect(duplicate.duplicate).toBe(true)
    expect(duplicate.notification).not.toBe('email-delivered')
  })

  test('protected dispatch rejects visitor requests', async ({ request }) => {
    const response = await request.post(host + '/api/inquiries/dispatch', { data: {} })
    expect(response.status()).toBe(404)
  })

  for (const width of [320, 390, 768]) {
    test('contact page fits ' + width + 'px', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(host + '/contact')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    })
  }

  test('mobile contact page screenshot and accessible touch controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(host + '/contact')
    await expect(page.getByLabel('What can we help with?')).toBeVisible()
    await page.screenshot({ path: 'test-results/homepage-run3-contact-mobile.png', fullPage: true })
  })
})
