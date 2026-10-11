import { writeFile } from 'node:fs/promises'
import { expect, test, type Page, type TestInfo } from '@playwright/test'

const host = 'http://localhost:3000'
const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
  { width: 2560, height: 1440 },
  { width: 844, height: 390 },
] as const

const products = [
  { slug: 'connected-websites', name: 'CX83 Connected Website Platform' },
  { slug: 'client-brand-studio', name: 'Client Brand Studio' },
] as const

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(async () => { await document.fonts.ready })
  // Full page screenshots do not reliably load assets far below the fold.
  // Inspect each real image in view before recording the visual evidence.
  for (const asset of await page.locator('main .cx83-interior-run2 img:visible').all()) {
    await asset.scrollIntoViewIfNeeded()
    await expect.poll(
      () => asset.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      { message: 'Original image loaded before visual capture', timeout: 15000 },
    ).toBe(true)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  const metrics = await page.evaluate(() => {
    const root = document.documentElement
    const clipped = [...document.querySelectorAll<HTMLElement>(
      '.cx83-interior-root, .cx83-software-card, .cx83-product-proof-visual, .cx83-work-feature, .cx83-how-guide',
    )].filter((element) => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({ className: element.className, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
    return {
      viewport: [innerWidth, innerHeight],
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      clipped,
      overflowing: [...document.querySelectorAll<HTMLElement>('main *')]
        .filter((element) => {
          const rect = element.getBoundingClientRect()
          return rect.width > 0 && rect.right > root.clientWidth + 1
        })
        .slice(0, 12)
        .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right })),
      headings: [...document.querySelectorAll('main h1, main h2')].map((h) => h.textContent?.trim()),
    }
  })
  expect(metrics.scrollWidth, name + ' must not overflow: ' + JSON.stringify(metrics.overflowing)).toBeLessThanOrEqual(metrics.clientWidth + 1)
  expect(metrics.clipped, name + ' has no clipped scoped elements').toEqual([])
  const filename = testInfo.outputPath('interior-' + name + '.png')
  await page.screenshot({ path: filename, fullPage: true, animations: 'disabled' })
  await testInfo.attach(name, { path: filename, contentType: 'image/png' })
  return metrics
}

test.describe('Interior Run 2 product and proof journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('catalog products, contextual inquiry actions and Studio variants have no self link', async ({ page }) => {
    await page.goto(host + '/software')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Software that puts you in control.')
    await expect(page.locator('.cx83-software-card')).toHaveCount(2)
    await expect(page.locator('.cx83-software-status')).toHaveText(['In development', 'In development'])
    const compactStudio = page.getByTestId('brand-studio-spotlight')
    await expect(compactStudio.getByRole('link', { name: 'See the Studio details' })).toHaveAttribute('href', '/software/client-brand-studio')
    await expect(compactStudio).toContainText('This is authentic CX83 branding created through our own Client Brand Studio.')
    await expect(page.locator('.cx83-software-card').filter({ hasText: 'Client Brand Studio' })).toContainText('Original CX83 branding created with Client Brand Studio.')
    for (const product of products) {
      const card = page.locator('.cx83-software-card').filter({ has: page.getByRole('heading', { name: product.name, exact: true }) })
      await expect(card.getByRole('link')).toHaveAttribute('href', '/software/' + product.slug)
      await page.goto(host + '/software/' + product.slug)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(product.name)
      await expect(page.locator('.cx83-product-availability')).toContainText('not released')
      await expect(page.getByRole('link', { name: 'Back to Software' })).toHaveAttribute('href', '/software')
      const contact = page.getByRole('link', { name: 'Start a conversation' })
      await expect(contact).toHaveCount(1)
      await expect(contact).toHaveAttribute('href', '/contact?context=' + product.slug + '#contact-form')
      await contact.click()
      await expect(page).toHaveURL(host + '/contact?context=' + product.slug + '#contact-form')
      await expect(page.locator('#context')).toHaveValue(product.slug)
      await expect(page.locator('.cx83-contact-form-note')).toHaveText('We’ll use the details you provide to review and respond to your inquiry.')
      await expect(page.getByRole('button', { name: /Send inquiry|Submit|Send message/i })).toBeVisible()
      await page.goto(host + '/software')
    }
    await page.goto(host + '/software/client-brand-studio')
    const detailStudio = page.getByTestId('brand-studio-spotlight')
    const detailLink = detailStudio.getByRole('link', { name: 'See the product status' })
    await expect(detailLink).toHaveAttribute('href', '#studio-review')
    await expect(detailStudio.getByRole('link', { name: /Explore Client Brand Studio/ })).toHaveCount(0)
    await detailLink.click()
    await expect(page).toHaveURL(host + '/software/client-brand-studio#studio-review')
    await expect(page.getByRole('heading', { name: 'Real Studio work, product in development.' })).toBeVisible()
    await expect(detailStudio).toContainText('Original CX83 branding created with Client Brand Studio')
    await expect(page.locator('.cx83-product-availability')).toContainText('not released')
    await expect(page.getByRole('link', { name: /Buy now|Download now|Start trial|Checkout/i })).toHaveCount(0)
  })

  test('connected website uses real media and a working Work evidence destination', async ({ page, request }) => {
    await page.goto(host + '/software/connected-websites')
    await expect(page.locator('.cx83-product-proof-visual img')).toHaveAttribute('src', /cx83-website-showcase-poster-v2/)
    const demo = page.getByRole('link', { name: 'Watch the real website demonstration' })
    await expect(demo).toHaveAttribute('href', '/#showcase-title')
    const proof = page.getByRole('link', { name: 'See the CX83 website example' })
    await expect(proof).toHaveAttribute('href', '/work#cx83-connected-website')
    await proof.click()
    await expect(page).toHaveURL(host + '/work#cx83-connected-website')
    await expect(page.locator('#cx83-connected-website')).toBeVisible()
    await expect(page.locator('#cx83-connected-website')).toContainText('A request became a real website update. Using our connected AI tools, we made changes to the CX83 website, reviewed the results, and verified the updated experience.')
    await expect(page.locator('#cx83-connected-website')).not.toContainText(/77 integration|111 browser|October 10|October 2026|engineering record/)
    await expect(page.locator('.cx83-work-evidence')).toHaveCount(0)
    const response = await request.head(host + '/showcase/cx83-website-showcase-poster-v2.jpg')
    expect(response.status()).toBe(200)
    await page.goto(host + '/#showcase-title')
    await expect(page.locator('#website-demo video')).toHaveAttribute('poster', '/showcase/cx83-website-showcase-poster-v2.jpg')
    await expect(page.locator('#website-demo track')).not.toHaveAttribute('default')
  })

  test('historical proof anchor, example guide, map and FAQ remain keyboard usable', async ({ page }) => {
    await page.goto(host + '/how-it-works#real-proof')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your work. Connected tools. Clear control.')
    await expect(page.locator('#real-proof')).toBeVisible()
    await expect(page.locator('#real-proof')).not.toContainText(/October 10|77 integration|111 browser|dated implementation/)
    await expect(page.locator('#real-proof')).toContainText('See how an owner request became an actual website update')
    await expect(page.locator('#real-proof').getByRole('link')).toHaveAttribute('href', '/work#cx83-connected-website')
    await page.getByRole('link', { name: 'Customers', exact: false }).first().click()
    await expect(page).toHaveURL(host + '/how-it-works#customers')
    await expect(page.locator('#customers')).toBeVisible()
    await expect.poll(async () => {
      const [top, header] = await Promise.all([
        page.locator('#customers').evaluate((el) => el.getBoundingClientRect().top),
        page.locator('header.cx83-site-header').evaluate((el) => el.getBoundingClientRect().bottom),
      ])
      return top - header
    }).toBeGreaterThanOrEqual(-1)
    for (const id of ['examples', 'marketing', 'operations', 'system-map', 'ownership', 'real-proof', 'questions']) {
      await expect(page.locator('#' + id)).toHaveCount(1)
    }
    const technical = page.locator('#system-map > .cx83-technical-disclosure')
    await technical.locator(':scope > summary').focus()
    await page.keyboard.press('Enter')
    await expect(technical).toHaveAttribute('open', '')
    await expect(page.getByTestId('systems-map')).toBeVisible()
    await page.getByTestId('systems-layer').filter({ hasText: 'Visitor Cat' }).click()
    await expect(page.getByTestId('systems-active-detail')).toContainText('Cannot edit source')
    const faq = page.locator('#questions details').first()
    await faq.locator('summary').focus()
    await page.keyboard.press('Enter')
    await expect(faq).toHaveAttribute('open', '')
    await expect(page.getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact')
  })

  test('Work centers real evidence and preserves empty CMS state and missing detail routes', async ({ page }) => {
    await page.goto(host + '/work')
    await expect(page.locator('#cx83-connected-website')).toBeVisible()
    await expect(page.locator('#cx83-connected-website')).not.toContainText('What was actually demonstrated')
    await expect(page.getByText('No customer projects or case studies have been approved for publication here yet.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Published projects' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Published case studies' })).toHaveCount(0)
    for (const route of ['/work/projects/nonexistent-run2-project', '/work/case-studies/nonexistent-run2-case', '/software/nonexistent-run2-product']) {
      const response = await page.goto(host + route)
      expect(response?.status(), route + ' must be 404').toBe(404)
    }
  })

  for (const viewport of viewports) {
    test('responsive interiors at ' + viewport.width + 'x' + viewport.height, async ({ page }, testInfo) => {
      test.setTimeout(180_000)
      await page.setViewportSize(viewport)
      const metrics = []
      for (const [path, label] of [
        ['/software', 'catalog'],
        ['/software/connected-websites', 'connected'],
        ['/software/client-brand-studio', 'studio'],
        ['/work', 'work'],
        ['/how-it-works', 'how'],
      ]) {
        const response = await page.goto(host + path)
        expect(response?.status()).toBe(200)
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
        metrics.push({ path, ...(await capture(page, testInfo, 'run2-' + label + '-' + viewport.width + 'x' + viewport.height)) })
      }
      const file = testInfo.outputPath('interior-metrics-run2-' + viewport.width + 'x' + viewport.height + '.json')
      await writeFile(file, JSON.stringify({ viewport, metrics, environment: 'isolated CI application with local test database' }, null, 2) + '\n', 'utf8')
      await testInfo.attach('run2-responsive-metrics', { path: file, contentType: 'application/json' })
    })
  }
})
