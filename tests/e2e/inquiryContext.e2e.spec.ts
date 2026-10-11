import { randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

const host = 'http://localhost:3000'
const visitorMessage = 'We want to connect intake with our calendar. Please keep these exact details.'

async function fillInquiry(page: Page) {
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Synthetic Context Visitor')
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('context@example.invalid')
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill(visitorMessage)
}

type PostedInquiry = {
  requestId: string
  inquiryType: string
  context?: string
  message: string
}

test.describe('contact interest continuity', () => {
  const approved = [
    { token: 'websites-and-business-tools', label: 'Custom websites and business tools', inquiryType: 'project' },
    { token: 'automation-and-integrations', label: 'Business automation and integrations', inquiryType: 'services' },
    { token: 'ai-setup-and-workflows', label: 'AI setup and reusable workflows', inquiryType: 'services' },
    { token: 'connected-websites', label: 'Connected Website Platform', inquiryType: 'software' },
    { token: 'client-brand-studio', label: 'Client Brand Studio', inquiryType: 'software' },
  ]

  for (const context of approved) {
    test('shows the approved interest for ' + context.token, async ({ page }) => {
      await page.goto(host + '/contact?context=' + context.token)
      await expect(page.getByLabel('What can we help with?')).toHaveValue(context.inquiryType)
      await expect(page.getByLabel('Specific interest (optional)')).toHaveValue(context.token)
      await expect(page.locator('.cx83-inquiry-context-summary')).toContainText(context.label)
      await expect(page.getByRole('button', { name: 'Remove selected interest' })).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('')
    })
  }

  for (const query of [
    '',
    '?context=unlisted-service',
    '?context=connected-websites&context=connected-websites',
    '?context=connected-websites&context=client-brand-studio',
  ]) {
    test('starts neutral for /contact' + query, async ({ page }) => {
      await page.goto(host + '/contact' + query)
      await expect(page.getByLabel('What can we help with?')).toHaveValue('general')
      await expect(page.getByLabel('Specific interest (optional)')).toHaveValue('')
      await expect(page.locator('.cx83-inquiry-context-summary')).toHaveCount(0)
      await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('')
    })
  }

  test('lets visitors change or remove interest while keeping their message and autofill hints', async ({ page }) => {
    await page.goto(host + '/contact?context=automation-and-integrations')
    await fillInquiry(page)
    const category = page.getByLabel('What can we help with?')
    const interest = page.getByLabel('Specific interest (optional)')
    const message = page.getByRole('textbox', { name: 'Message', exact: true })
    await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveAttribute('autocomplete', 'name')
    await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveAttribute('autocomplete', 'email')
    await expect(page.getByRole('textbox', { name: 'Organization (optional)', exact: true })).toHaveAttribute('autocomplete', 'organization')
    await expect(page.getByRole('textbox', { name: 'Organization (optional)', exact: true })).not.toHaveAttribute('required', '')
    await expect(message).toHaveAttribute('placeholder', 'What are you trying to build, connect, or make easier?')

    await interest.selectOption('ai-setup-and-workflows')
    await expect(category).toHaveValue('services')
    await expect(message).toHaveValue(visitorMessage)
    await category.selectOption('project')
    await expect(interest).toHaveValue('')
    await expect(page.locator('.cx83-inquiry-context-summary')).toHaveCount(0)
    await expect(message).toHaveValue(visitorMessage)

    await interest.selectOption('client-brand-studio')
    await expect(category).toHaveValue('software')
    await page.getByRole('button', { name: 'Remove selected interest' }).click()
    await expect(interest).toHaveValue('')
    await expect(category).toHaveValue('software')
    await expect(message).toHaveValue(visitorMessage)
    expect(page.url()).not.toContain('context@example.invalid')
    expect(page.url()).not.toContain('Synthetic')
    expect(page.url()).not.toContain('calendar')
  })

  test('reuses the same request ID and context after an ambiguous save', async ({ page }) => {
    const submissions: PostedInquiry[] = []
    await page.route('**/api/inquiries', async (route) => {
      submissions.push(route.request().postDataJSON() as PostedInquiry)
      if (submissions.length === 1) {
        await route.abort()
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, saved: true, duplicate: true, message: 'Your inquiry was saved in the CX83 system.' }),
        })
      }
    })
    await page.goto(host + '/contact?context=connected-websites')
    await fillInquiry(page)
    await page.getByRole('button', { name: 'Send inquiry' }).click()
    await expect(page.locator('form [role="alert"]')).toContainText('could not confirm the save')
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue(visitorMessage)
    await expect(page.getByLabel('Specific interest (optional)')).toHaveValue('connected-websites')
    await page.getByRole('button', { name: 'Send inquiry' }).click()
    await expect(page.getByRole('status')).toContainText('Inquiry saved')
    await expect(page.getByRole('status')).not.toContainText(/email delivered|email sent/i)
    expect(submissions).toHaveLength(2)
    expect(submissions[0].requestId).toBeTruthy()
    expect(submissions[1]).toEqual(submissions[0])
    expect(submissions[0].context).toBe('connected-websites')
    expect(submissions[0].message).toBe(visitorMessage)
  })

  test('uses a new request ID when an interest changes or is cleared after an ambiguous save', async ({ page }) => {
    const submissions: PostedInquiry[] = []
    await page.route('**/api/inquiries', async (route) => {
      submissions.push(route.request().postDataJSON() as PostedInquiry)
      await route.abort()
    })
    await page.goto(host + '/contact?context=automation-and-integrations')
    await fillInquiry(page)
    const submit = page.getByRole('button', { name: 'Send inquiry' })
    await submit.click()
    await expect(page.locator('form [role="alert"]')).toContainText('could not confirm the save')

    await page.getByLabel('Specific interest (optional)').selectOption('ai-setup-and-workflows')
    await submit.click()
    await expect.poll(() => submissions.length).toBe(2)
    await expect(page.locator('form [role="alert"]')).toContainText('could not confirm the save')

    await page.getByRole('button', { name: 'Remove selected interest' }).click()
    await submit.click()
    await expect.poll(() => submissions.length).toBe(3)
    await expect(page.locator('form [role="alert"]')).toContainText('could not confirm the save')
    expect(new Set(submissions.map((submission) => submission.requestId)).size).toBe(3)
    expect(submissions.map((submission) => submission.context)).toEqual([
      'automation-and-integrations',
      'ai-setup-and-workflows',
      undefined,
    ])
    expect(submissions.every((submission) => submission.message === visitorMessage)).toBe(true)
    expect(submissions.every((submission) => submission.inquiryType === 'services')).toBe(true)
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue(visitorMessage)
  })

  test('a normal Contact link clears context through soft navigation without clearing visitor text', async ({ page }) => {
    await page.goto(host + '/contact?context=connected-websites')
    await fillInquiry(page)
    const contactLink = page.getByRole('link', { name: 'Contact', exact: true }).first()
    await expect(contactLink).toHaveAttribute('href', '/contact')
    await contactLink.click()
    await expect(page).toHaveURL(host + '/contact')
    await expect(page.getByLabel('What can we help with?')).toHaveValue('general')
    await expect(page.getByLabel('Specific interest (optional)')).toHaveValue('')
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue(visitorMessage)
  })

  test('persists selected interest once and reads it back from isolated CI PostgreSQL', async ({ request }) => {
    let isolatedDatabase = false
    try {
      const database = new URL(process.env.DATABASE_URL || '')
      isolatedDatabase = process.env.CI === 'true'
        && ['localhost', '127.0.0.1'].includes(database.hostname)
        && database.pathname === '/cx83_webapp_ci'
    } catch {
      isolatedDatabase = false
    }
    test.skip(!isolatedDatabase, 'Persistence proof requires the isolated CI database.')
    test.skip(Boolean(process.env.CX83_GMAIL_CLIENT_ID || process.env.CX83_GMAIL_CLIENT_SECRET || process.env.CX83_GMAIL_REFRESH_TOKEN), 'Persistence proof requires mail credentials to be absent.')

    const requestId = randomUUID()
    const data = {
      requestId,
      name: 'CX83 Synthetic CI Context Proof',
      email: 'context-proof@example.invalid',
      organization: 'Isolated CI fixture',
      inquiryType: 'software',
      context: 'connected-websites',
      message: visitorMessage,
    }
    // This identifier keeps the proof separate from other synthetic CI requests.
    const headers = { 'x-real-ip': 'synthetic-ci-context-' + requestId }
    const first = await request.post(host + '/api/inquiries', { data, headers })
    expect(first.status()).toBe(201)
    expect(await first.json()).toMatchObject({ saved: true, duplicate: false, notification: 'needs-configuration' })
    const retry = await request.post(host + '/api/inquiries', { data, headers })
    expect(retry.status()).toBe(200)
    expect(await retry.json()).toMatchObject({ saved: true, duplicate: true })

    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('../../src/payload.config'),
    ])
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'form-submissions',
      overrideAccess: true,
      depth: 0,
      limit: 10,
      where: { 'submissionData.value': { equals: requestId } },
    })
    const matching = result.docs.filter((row) => row.submissionData?.some((entry) => entry.field === 'cx83-request-id' && entry.value === requestId))
    expect(matching).toHaveLength(1)
    const fields = matching[0].submissionData || []
    expect(fields.find((entry) => entry.field === 'message')?.value).toBe('Selected interest: Connected Website Platform\n\n' + visitorMessage)
    expect(fields.find((entry) => entry.field === 'inquiry-type')?.value).toBe('software')
    expect(fields.find((entry) => entry.field === 'cx83-delivery-status')?.value).toBe('unconfigured')
  })
})
