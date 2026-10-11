import { writeFile } from 'node:fs/promises'
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config.js'

const host = 'http://localhost:3000'
const fixturePublishedAt = '2026-10-10T00:00:00.000Z'

// Copies of the approved public service records, stored only in the isolated CI
// database. These exercise the published CMS path instead of an empty catalog.
const services = [
  {
    name: 'AI setup and reusable workflows',
    slug: 'ai-setup-and-workflows',
    shortDescription: 'Make AI useful in the work you already do, with clear instructions, connected information, and workflows you can repeat.',
    description: 'We start with a specific task, select the appropriate AI tools, connect approved business information, and build reusable instructions or skills. The scope can include setup, practical testing, documentation, and guidance for the people using the system.',
    capabilities: ['AI tool setup and configuration', 'Custom instructions and reusable skills', 'Workflow testing and documentation'],
    callToAction: { label: 'Discuss your workflow', url: '/contact' },
  },
  {
    name: 'Business automation and integrations',
    slug: 'automation-and-integrations',
    shortDescription: 'Connect disconnected applications so information moves through your business without the same manual steps.',
    description: 'We map a business process from its starting point to its outcome, then connect the applications involved. A project might link inquiry forms, customer records, email, scheduling, or reporting, with clear checks and a defined handoff.',
    capabilities: ['Workflow mapping and application connections', 'Forms, notifications, and structured records', 'Testing, exception handling, and handoff'],
    callToAction: { label: 'Discuss your process', url: '/contact' },
  },
  {
    name: 'Custom websites and business tools',
    slug: 'websites-and-business-tools',
    shortDescription: 'Build a clear online presence or a focused application, with useful AI and integrations where they belong.',
    description: 'We build websites and business tools around a defined purpose, using established software foundations instead of reinventing every component. The scope can include editable content, forms, an API powered assistant, or a custom interface for an existing workflow.',
    capabilities: ['Responsive websites and editable content', 'Business assistants and connected forms', 'Focused custom applications'],
    callToAction: { label: 'Discuss your website or tool', url: '/contact' },
  },
] as const

const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
  { width: 2560, height: 1440 },
  { width: 844, height: 390 },
]

function isolatedCIDatabase(): boolean {
  if (process.env.CI !== 'true' || process.env.PAYLOAD_DB_PUSH !== 'true') return false
  try {
    const database = new URL(process.env.DATABASE_URL || '')
    return ['localhost', '127.0.0.1'].includes(database.hostname)
      && database.pathname === '/cx83_webapp_ci'
  } catch {
    return false
  }
}

async function touchTarget(control: Locator): Promise<void> {
  await expect(control).toBeVisible()
  const size = await control.boundingBox()
  expect(size, 'control has a rendered target').not.toBeNull()
  expect(size!.height, 'control target height').toBeGreaterThanOrEqual(44)
}

async function captureInterior(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(async () => { await document.fonts.ready })
  const metrics = await page.evaluate(() => {
    const rectangle = (element: Element) => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom }
    }
    const root = document.documentElement
    const cards = [...document.querySelectorAll('.cx83-service-choice')].map((element) => ({
      ...rectangle(element),
      heading: element.querySelector('h2')?.textContent?.trim() || '',
      children: [...element.children].map(rectangle),
    }))
    const clipped = [...document.querySelectorAll<HTMLElement>(
      '.cx83-interior-root, .cx83-interior-heading, .cx83-service-choice, .cx83-contact-form-card, .cx83-inquiry-context-summary',
    )].filter((element) => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({ className: element.className, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
    return {
      url: window.location.href,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      headings: [...document.querySelectorAll('main h1, main h2')].map((element) => element.textContent?.trim()),
      cards,
      clipped,
    }
  })
  expect(metrics.scrollWidth, 'document has no horizontal overflow').toBeLessThanOrEqual(metrics.clientWidth + 1)
  expect(metrics.clipped, 'scoped content is not clipped inside its container').toEqual([])
  const screenshot = testInfo.outputPath(`interior-${name}.png`)
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
  await testInfo.attach(`interior-${name}`, { path: screenshot, contentType: 'image/png' })
  return { ...metrics, screenshot: `interior-${name}.png`, evidence: 'isolated CI browser with published synthetic CMS records' }
}

test.describe('Run 1 interior services and Contact visual continuity', () => {
  // No fixture writes or browser submissions may target a developer or staging DB.
  test.skip(!isolatedCIDatabase(), 'Published service fixtures require the isolated local CI database.')
  let payload: Payload | undefined
  const fixtureIds: number[] = []

  test.beforeAll(async () => {
    test.setTimeout(120_000)
    payload = await getPayload({ config })
    for (const service of services) {
      const existing = await payload.find({
        collection: 'services',
        depth: 0,
        overrideAccess: true,
        limit: 1,
        where: { slug: { equals: service.slug } },
      })
      const prior = existing.docs[0]
      if (prior) {
        // A retry may encounter our own fixture; never overwrite other content.
        expect(prior.publishedAt).toBe(fixturePublishedAt)
        expect(prior.name).toBe(service.name)
        expect(prior.description).toBe(service.description)
        expect(prior.shortDescription).toBe(service.shortDescription)
        expect(prior.capabilities?.map((item) => item.item)).toEqual(service.capabilities)
        expect(prior.callToAction).toEqual(service.callToAction)
        expect(prior._status).toBe('published')
        fixtureIds.push(prior.id)
        continue
      }
      const created = await payload.create({
        collection: 'services',
        overrideAccess: true,
        data: {
          ...service,
          capabilities: service.capabilities.map((item) => ({ item })),
          publishedAt: fixturePublishedAt,
          _status: 'published',
        },
      })
      fixtureIds.push(created.id)
    }
  })

  test.afterAll(async () => {
    if (!payload || !isolatedCIDatabase()) return
    for (const id of fixtureIds) {
      const record = await payload.findByID({ collection: 'services', id, depth: 0, overrideAccess: true })
      if (record.publishedAt === fixturePublishedAt) {
        await payload.delete({ collection: 'services', id, overrideAccess: true })
      }
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  for (const viewport of viewports) {
    test(`published interiors fit ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      const scriptErrors: string[] = []
      page.on('pageerror', (error) => scriptErrors.push(error.message))
      const metrics = []
      const routes = [
        { path: '/services', name: 'services' },
        { path: '/services/ai-setup-and-workflows', name: 'ai-service' },
        { path: '/contact?context=websites-and-business-tools', name: 'contact-selected' },
      ]
      for (const route of routes) {
        const response = await page.goto(host + route.path)
        expect(response?.status(), route.path).toBe(200)
        await expect(page.locator('main h1')).toHaveCount(1)
        await expect(page.locator('main h1')).toBeVisible()
        const record = await captureInterior(page, testInfo, `${route.name}-${viewport.width}x${viewport.height}`)
        expect(record.innerWidth).toBe(viewport.width)
        expect(record.innerHeight).toBe(viewport.height)
        if (route.name === 'services') {
          await expect(page.getByTestId('cx83-services-index').getByRole('heading', { level: 1 })).toHaveText('Practical help for the way you work.')
          expect(record.cards).toHaveLength(3)
          if (viewport.width >= 1200) {
            const tops = record.cards.map((card) => card.y)
            expect(Math.max(...tops) - Math.min(...tops), 'desktop choices share one row').toBeLessThanOrEqual(2)
            expect(record.cards[1].x).toBeGreaterThan(record.cards[0].x)
            expect(record.cards[2].x).toBeGreaterThan(record.cards[1].x)
          } else {
            for (let index = 1; index < record.cards.length; index++) {
              expect(record.cards[index].y, 'phone and tablet choices are separate rows').toBeGreaterThanOrEqual(record.cards[index - 1].bottom - 1)
            }
            expect(record.cards[0].width, 'phone and tablet cards use available width').toBeGreaterThan(viewport.width * 0.7)
          }
        }
        if (route.name === 'contact-selected') {
          await expect(page.locator('.cx83-contact-refined')).toBeVisible()
          await expect(page.getByRole('heading', { level: 1 })).toContainText('work better')
          await expect(page.getByRole('heading', { name: 'Tell us what you have in mind.', exact: true })).toBeVisible()
          await expect(page.locator('#context')).toHaveValue('websites-and-business-tools')
          await expect(page.locator('.cx83-inquiry-context-summary')).toBeVisible()
          for (const control of [page.locator('#name'), page.locator('#email'), page.locator('#context'), page.getByRole('button', { name: 'Send inquiry', exact: true })]) {
            await touchTarget(control)
          }
          if (viewport.width <= 390) {
            const form = await page.locator('.cx83-contact-form-card').boundingBox()
            const next = await page.getByRole('heading', { name: 'What happens next', exact: true }).boundingBox()
            expect(form).not.toBeNull()
            expect(next).not.toBeNull()
            expect(next!.y, 'the form precedes the next-step explanation on phones').toBeGreaterThanOrEqual(form!.y + form!.height)
          }
        }
        metrics.push(record)
      }
      expect(scriptErrors, 'no uncaught browser script errors').toEqual([])
      const report = testInfo.outputPath(`interior-metrics-${viewport.width}x${viewport.height}.json`)
      await writeFile(report, JSON.stringify({ viewport, metrics }, null, 2) + '\n', 'utf8')
      await testInfo.attach('interior-responsive-metrics', { path: report, contentType: 'application/json' })
    })
  }

  for (const width of [390, 1440]) {
    for (const service of services) {
      test(`${service.slug} has a complete working path at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
        await page.goto(host + '/services')
        const card = page.locator('.cx83-service-choice').filter({
          has: page.getByRole('heading', { level: 2, name: service.name, exact: true }),
        })
        await expect(card).toHaveCount(1)
        await expect(card).toContainText(service.shortDescription)
        const cardAction = card.getByRole('link')
        await expect(cardAction).toHaveCount(1)
        await expect(cardAction).toHaveAttribute('href', `/services/${service.slug}`)
        await touchTarget(cardAction)
        await cardAction.click()
        await expect(page).toHaveURL(host + `/services/${service.slug}`)

        const detail = page.getByTestId('cx83-service-detail')
        await expect(detail.getByRole('heading', { level: 1 })).toHaveText(service.name)
        await expect(detail).toContainText(service.shortDescription)
        await expect(detail).toContainText(service.description)
        await expect(detail.getByRole('heading', { name: 'Who this helps', exact: true })).toHaveAttribute('id', 'service-fit')
        await expect(detail.getByRole('heading', { name: 'What you can expect', exact: true })).toHaveAttribute('id', 'service-deliverables')
        await expect(detail.getByRole('heading', { name: 'A useful example', exact: true })).toHaveAttribute('id', 'service-example')
        const deliverables = detail.locator('section[aria-labelledby="service-deliverables"]')
        await expect(deliverables.locator('li')).toHaveCount(3)
        for (const capability of service.capabilities) {
          await expect(deliverables).toContainText(capability)
        }
        await expect(detail.getByRole('heading', { name: service.callToAction.label, exact: true })).toBeVisible()
        const action = detail.getByRole('link', { name: 'Start a conversation', exact: true })
        await expect(action).toHaveCount(1)
        const contactPath = `/contact?context=${service.slug}#contact-form`
        await expect(action).toHaveAttribute('href', contactPath)
        await touchTarget(action)
        const record = await captureInterior(page, testInfo, `${service.slug}-${width}`)
        const report = testInfo.outputPath(`interior-metrics-${service.slug}-${width}.json`)
        await writeFile(report, JSON.stringify(record, null, 2) + '\n', 'utf8')

        await action.click()
        await expect(page).toHaveURL(host + contactPath)
        await expect(page.locator('#contact-form')).toBeVisible()
        await expect(page.locator('#context')).toHaveValue(service.slug)
        await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toBeInViewport()
        await page.goBack()
        if (service.slug === 'websites-and-business-tools' || service.slug === 'automation-and-integrations') {
          const websiteExample = service.slug === 'websites-and-business-tools'
          const examplePath = websiteExample ? '/#showcase-title' : '/how-it-works#customers'
          const example = page.getByTestId('cx83-service-detail').locator('section[aria-labelledby="service-example"]').getByRole('link')
          await expect(example).toHaveCount(1)
          await expect(example).toHaveAttribute('href', examplePath)
          await example.click()
          await expect(page).toHaveURL(host + examplePath)
          const target = page.locator(websiteExample ? '#showcase-title' : '#customers')
          const heading = websiteExample ? target : target.getByRole('heading').first()
          await expect(heading).toBeInViewport({ ratio: 1 })
          // Visibility alone does not detect a heading hidden under the sticky header.
          await expect.poll(async () => {
            const [anchorBox, headerBox] = await Promise.all([
              target.boundingBox(),
              page.locator('header.cx83-site-header').boundingBox(),
            ])
            return anchorBox && headerBox ? anchorBox.y - (headerBox.y + headerBox.height) : -1000
          }, { message: 'example anchor clears the sticky header' }).toBeGreaterThanOrEqual(-2)
          await page.goBack()
        }
        const back = page.getByTestId('cx83-service-detail').getByRole('link', { name: 'Back to Services', exact: true })
        await expect(back).toHaveAttribute('href', '/services')
        await back.click()
        await expect(page).toHaveURL(host + '/services')
      })
    }
  }

  test('service navigation works with keyboard and direct Contact remains clear', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(host + '/services/ai-setup-and-workflows')
    const back = page.getByTestId('cx83-service-detail').getByRole('link', { name: 'Back to Services', exact: true })
    await back.focus()
    await expect(back).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(host + '/services')

    await page.goto(host + '/contact')
    await expect(page.getByRole('heading', { name: 'Tell us what you have in mind.', exact: true })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('')
    await captureInterior(page, testInfo, 'contact-direct-390')
  })
})
