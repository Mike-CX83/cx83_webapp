import { expect, test } from '@playwright/test'

function sse(text: string) {
  return [
    { type: 'start' }, { type: 'text-start', id: 'synthetic-answer' },
    { type: 'text-delta', id: 'synthetic-answer', delta: text },
    { type: 'text-end', id: 'synthetic-answer' }, { type: 'finish', finishReason: 'stop' },
  ].map((chunk) => 'data: ' + JSON.stringify(chunk) + '\n\n').join('') + 'data: [DONE]\n\n'
}
async function open(page: import('@playwright/test').Page, answer = 'Use [Contact CX83](/contact?context=websites-and-business-tools#contact-form) or [hello@cx83labs.com](mailto:hello@cx83labs.com).') {
  await page.route('**/api/assistant-status', (route) => route.fulfill({ json: { configured: true, enabled: true } }))
  await page.route('**/api/chat', (route) => route.fulfill({ contentType: 'text/event-stream', headers: { 'x-vercel-ai-ui-message-stream': 'v1' }, body: sse(answer) }))
  await page.goto('http://localhost:3000')
  await page.locator('.cx83-assistant-launcher').click()
  const dialog = page.getByRole('dialog', { name: 'Cat, the CX83 Labs AI assistant' })
  await dialog.getByRole('textbox', { name: 'Message Cat' }).fill('How do I contact someone about a website?')
  await dialog.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(dialog.getByRole('button', { name: 'Report a problem' })).toBeVisible()
  return dialog
}

test.describe('Cat repair and confirmed visitor submissions', () => {
  test('contact links navigate to the working contextual inquiry and email is clickable', async ({ page }) => {
    const dialog = await open(page)
    const contact = dialog.getByRole('link', { name: 'Contact CX83', exact: true }).first()
    await expect(contact).toHaveAttribute('href', '/contact?context=websites-and-business-tools#contact-form')
    await expect(dialog.getByRole('link', { name: 'hello@cx83labs.com' })).toHaveAttribute('href', 'mailto:hello@cx83labs.com')
    await contact.click()
    await expect(page).toHaveURL(/contact\?context=websites-and-business-tools#contact-form/)
    await expect(page.getByLabel('Specific interest (optional)')).toHaveValue('websites-and-business-tools')
  })
  test('problem report requires confirmation and does not attach history by default', async ({ page }) => {
    let sent: Record<string, unknown> | null = null
    await page.route('**/api/cat-reports', async (route) => { sent = route.request().postDataJSON(); await route.fulfill({ status: 201, json: { saved: true, message: 'Report saved for owner review.' } }) })
    const dialog = await open(page)
    await dialog.getByRole('button', { name: 'Report a problem' }).click()
    await expect(dialog.getByRole('button', { name: 'Send report', exact: true })).toBeDisabled()
    await dialog.getByLabel('Details (optional)').fill('Synthetic incorrect answer report')
    expect(sent).toBeNull()
    await dialog.getByLabel('I confirm this report may be sent to CX83.').check()
    await dialog.getByRole('button', { name: 'Send report', exact: true }).click()
    await expect(dialog.getByRole('heading', { name: 'Report saved' })).toBeVisible()
    expect(sent).toMatchObject({ confirmed: true, includeExchange: false })
    expect(sent).not.toHaveProperty('question'); expect(sent).not.toHaveProperty('answer'); expect(sent).not.toHaveProperty('transcript')
  })
  test('selected exchange has a redacted preview and optional attachment consent', async ({ page }) => {
    const dialog = await open(page, 'Contact synthetic@example.invalid or use [Contact CX83](/contact).')
    await dialog.getByRole('button', { name: 'Report a problem' }).click()
    await dialog.getByLabel('Attach this question and answer').check()
    await expect(dialog.locator('.cx83-cat-exchange-preview')).toContainText('[email removed]')
    await expect(dialog.locator('.cx83-cat-exchange-preview')).not.toContainText('synthetic@example.invalid')
  })
  test('plan review captures optional contact and requires explicit confirmation', async ({ page }) => {
    let sent: Record<string, unknown> | null = null
    await page.route('**/api/cat-plans', async (route) => { sent = route.request().postDataJSON(); await route.fulfill({ status: 201, json: { saved: true, message: 'Your preliminary plan was saved for CX83 to review.' } }) })
    const dialog = await open(page, 'Goal: reduce manual intake. Tools: Gmail and Sheets. Requirements: approval before sending email. Open question: who reviews each inquiry?')
    await dialog.getByRole('button', { name: 'Review and send a plan' }).click()
    await expect(dialog.getByLabel('Preliminary project plan')).toHaveValue(/Goal: reduce manual intake/)
    await expect(dialog.getByRole('button', { name: 'Submit preliminary plan' })).toBeDisabled()
    await dialog.getByLabel('Email (optional)').fill('synthetic@example.invalid')
    await dialog.getByLabel('I reviewed this plan and confirm it may be sent to CX83.').check()
    await dialog.getByRole('button', { name: 'Submit preliminary plan' }).click()
    await expect(dialog.getByRole('heading', { name: 'Plan saved' })).toBeVisible()
    expect(sent).toMatchObject({ confirmed: true, email: 'synthetic@example.invalid' })
    expect(sent).not.toHaveProperty('transcript')
  })
  test('editing reviewed plan removes confirmation, cancel sends nothing', async ({ page }) => {
    let calls = 0
    await page.route('**/api/cat-plans', (route) => { calls++; return route.fulfill({ json: { saved: true } }) })
    const dialog = await open(page)
    await dialog.getByRole('button', { name: 'Review and send a plan' }).click()
    await dialog.getByLabel('I reviewed this plan and confirm it may be sent to CX83.').check()
    await dialog.getByLabel('Preliminary project plan').fill('Goal: new intake system. Tools: spreadsheets. Requirements: manual approval.')
    await expect(dialog.getByLabel('I reviewed this plan and confirm it may be sent to CX83.')).not.toBeChecked()
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    expect(calls).toBe(0)
    await expect(dialog.getByRole('textbox', { name: 'Message Cat' })).toBeVisible()
  })
  test('closing Cat preserves an unsent plan, while new conversation clears the session', async ({ page }) => {
    const dialog = await open(page)
    await dialog.getByRole('button', { name: 'Review and send a plan' }).click()
    await dialog.getByLabel('Preliminary project plan').fill('Goal: preserve this synthetic draft. Tools: email. Requirements: review before send.')
    await dialog.getByRole('button', { name: 'Close Cat', exact: true }).click()
    await expect(dialog).toBeHidden()
    await page.locator('.cx83-assistant-launcher').click()
    await expect(dialog.getByLabel('Preliminary project plan')).toHaveValue(/preserve this synthetic draft/)
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await dialog.getByRole('button', { name: 'New conversation' }).click()
    await expect(dialog.getByRole('heading', { name: 'What can we help you explore?' })).toBeVisible()
  })
  test('failed submission keeps edited text and retry identifier', async ({ page }) => {
    const ids: string[] = []
    await page.route('**/api/cat-plans', async (route) => { ids.push(route.request().postDataJSON().requestId); await route.fulfill({ status: 503, json: { error: 'Synthetic storage unavailable.' } }) })
    const dialog = await open(page)
    await dialog.getByRole('button', { name: 'Review and send a plan' }).click()
    await dialog.getByLabel('Preliminary project plan').fill('Goal: automate synthetic intake. Tools: email and spreadsheets. Need review controls.')
    await dialog.getByLabel('I reviewed this plan and confirm it may be sent to CX83.').check()
    await dialog.getByRole('button', { name: 'Submit preliminary plan' }).click()
    await expect(dialog.getByRole('alert')).toContainText('Synthetic storage unavailable')
    await expect(dialog.getByLabel('Preliminary project plan')).toHaveValue(/automate synthetic intake/)
    await dialog.getByRole('button', { name: 'Submit preliminary plan' }).click()
    await expect.poll(() => ids.length).toBe(2)
    expect(ids[0]).toBe(ids[1])
  })
  test('privacy describes provider processing, voluntary storage and retention', async ({ page }) => {
    const dialog = await open(page)
    await dialog.getByRole('button', { name: 'Chat privacy', exact: true }).click()
    await expect(dialog).toContainText('does not save a general chat archive')
    await expect(dialog).toContainText('30 days'); await expect(dialog).toContainText('90 days')
    await dialog.getByRole('button', { name: 'Back to chat' }).click()
    await dialog.getByRole('button', { name: 'New conversation' }).click()
    await expect(dialog.getByRole('heading', { name: 'What can we help you explore?' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Report a problem' })).toHaveCount(0)
  })
  test('longer conversations retain browser history but send only the recent model window', async ({ page }) => {
    let envelope: { messages: unknown[] } | undefined
    const dialog = await open(page)
    await page.route('**/api/chat', async (route) => {
      envelope = route.request().postDataJSON()
      await route.fulfill({ contentType: 'text/event-stream', headers: { 'x-vercel-ai-ui-message-stream': 'v1' }, body: sse('A concise synthetic reply.') })
    })
    for (let i = 1; i < 8; i++) {
      await dialog.getByRole('textbox', { name: 'Message Cat' }).fill('Synthetic conversation turn ' + i)
      await dialog.getByRole('button', { name: 'Send', exact: true }).click()
      await expect(dialog.locator('.cx83-cat-assistant-message')).toHaveCount(i + 1)
    }
    expect(envelope!.messages).toHaveLength(12)
    await expect(dialog.locator('.cx83-cat-user-message')).toHaveCount(8)
  })
  test('unsafe links remain text, useful safety explanation remains visible', async ({ page }) => {
    const dialog = await open(page, 'For safety, avoid sending patient records. [Bad link](https://evil.example/contact) [Good contact](/contact).')
    await expect(dialog).toContainText('For safety, avoid sending patient records.')
    await expect(dialog.getByRole('link', { name: 'Bad link' })).toHaveCount(0)
    await expect(dialog.getByRole('link', { name: 'Good contact' })).toHaveAttribute('href', '/contact')
  })
  test('chat failure is visible, reset clears it, input has a sensible limit', async ({ page }) => {
    const dialog = await open(page)
    await dialog.getByRole('button', { name: 'New conversation' }).click()
    await page.route('**/api/chat', (route) => route.fulfill({ status: 503, json: { error: 'Cat is temporarily unavailable.' } }))
    await expect(dialog.getByRole('textbox', { name: 'Message Cat' })).toHaveAttribute('maxlength', '2000')
    await dialog.getByRole('textbox', { name: 'Message Cat' }).fill('Explain your services')
    await dialog.getByRole('button', { name: 'Send', exact: true }).click()
    await expect(dialog.getByRole('alert')).toContainText('Cat could not complete that reply')
  })
  for (const size of [{ width: 320, height: 720 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 844, height: 390 }, { width: 1440, height: 1000 }]) {
    test('long replies, report review and plan review fit ' + size.width + 'x' + size.height, async ({ page }, testInfo) => {
      await page.setViewportSize(size)
      const dialog = await open(page, 'A preliminary plan:\n\n' + 'Review one workflow with your team before expanding. '.repeat(70) + '\n\n[Contact CX83](/contact).')
      expect(await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }))).toEqual({ w: size.width, h: size.height })
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width)
      const panel = await dialog.boundingBox()
      expect(panel!.x).toBeGreaterThanOrEqual(0); expect(panel!.y).toBeGreaterThanOrEqual(0)
      expect(panel!.x + panel!.width).toBeLessThanOrEqual(size.width)
      expect(panel!.y + panel!.height).toBeLessThanOrEqual(size.height)
      await dialog.getByRole('button', { name: 'Report a problem' }).click()
      await expect(dialog.getByRole('button', { name: 'Send report', exact: true })).toBeVisible()
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
      await dialog.getByRole('button', { name: 'Review and send a plan' }).click()
      await expect(dialog.getByLabel('Preliminary project plan')).toBeVisible()
      await dialog.getByLabel('Preliminary project plan').fill('Goal: improve intake. Current tools: email and Sheets. Requirements: manual approval before any automated message.')
      await dialog.getByLabel('I reviewed this plan and confirm it may be sent to CX83.').check()
      await expect(dialog.getByRole('button', { name: 'Submit preliminary plan' })).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('homepage-cat-repair-' + testInfo.project.name + '-' + size.width + '.png'), animations: 'disabled' })
    })
  }
})
