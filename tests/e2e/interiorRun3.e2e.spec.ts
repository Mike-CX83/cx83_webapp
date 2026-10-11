import { readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config.js'

const host = 'http://localhost:3000'
const approved = readFileSync('docs/CX83_ABOUT_STORY_APPROVED_2026_10_10.md', 'utf8').trim().split(/\n\s*\n/).slice(1)
const viewports = [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }, { width: 2560, height: 1440 }, { width: 844, height: 390 }]

function isolatedCI() {
  if (process.env.CI !== 'true' || process.env.PAYLOAD_DB_PUSH !== 'true') return false
  try {
    const url = new URL(process.env.DATABASE_URL || '')
    return ['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname === '/cx83_webapp_ci'
  } catch { return false }
}

test.describe('Interior Run 3', () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(!isolatedCI(), 'Fixture writes require the isolated localhost CI database.')
  let payload: Payload
  let oldFounder: string | null | undefined

  test.beforeAll(async () => {
    test.setTimeout(120_000)
    payload = await getPayload({ config })
    oldFounder = (await payload.findGlobal({ slug: 'site-settings' })).founder
    await payload.updateGlobal({ slug: 'site-settings', data: { founder: approved.join('\n\n') } })
  })
  test.afterAll(async () => {
    if (payload && isolatedCI()) await payload.updateGlobal({ slug: 'site-settings', data: { founder: oldFounder || '' } })
  })

  for (const viewport of viewports) {
    test('approved About and utilities fit ' + viewport.width + 'x' + viewport.height, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const metrics = []
      for (const route of ['/about', '/posts', '/search']) {
        const response = await page.goto(host + route)
        expect(response?.status()).toBe(200)
        await page.evaluate(() => document.fonts.ready)
        await expect(page.locator('main h1')).toHaveCount(1)
        if (route === '/about') {
          const story = page.locator('[data-testid="approved-about-story"]')
          await expect(story.locator('p')).toHaveCount(5)
          expect((await story.locator('p').allTextContents()).join(' ').replace(/\s+/g, ' ').trim()).toBe(approved.join(' ').replace(/\s+/g, ' ').trim())
          await expect(story.locator('p').first()).toHaveCSS('text-align', 'justify')
          expect(await story.locator('p').first().evaluate((p) => parseFloat(getComputedStyle(p).textIndent))).toBeGreaterThan(0)
          const symbol = page.locator('.cx83-about-symbol')
          await expect(symbol).toHaveAttribute('src', '/brand/symbol-showcase.svg')
          await expect.poll(() => symbol.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
          const column = await page.locator('.cx83-about-emblem-column').boundingBox()
          const mark = await symbol.boundingBox()
          expect(column).not.toBeNull()
          expect(mark).not.toBeNull()
          // The unchanged SVG viewBox is -24 -24 288 288; its visible artwork occupies x=0..240.
          // Symmetric 24-unit transparent padding gives the visible symbol the same center as its box.
          const visibleLeft = mark!.x + mark!.width / 12
          const visibleRight = mark!.x + mark!.width * 11 / 12
          if (viewport.width >= 1024) {
            // The thin divider starts at the column's left edge; the other boundary is the page edge.
            expect(Math.abs((visibleLeft - column!.x) - (viewport.width - visibleRight))).toBeLessThan(2)
            expect(Math.abs((column!.y + column!.height / 2) - (mark!.y + mark!.height / 2))).toBeLessThan(2)
            expect(mark!.width).toBeLessThanOrEqual(272.1)
          } else {
            // Mobile and tablet preserve the original size and center within the stacked column.
            expect(Math.abs((column!.x + column!.width / 2) - (mark!.x + mark!.width / 2))).toBeLessThan(2)
            expect(Math.abs(mark!.width - 160)).toBeLessThan(1)
          }
          const glow = await page.locator('.cx83-about-emblem-column').evaluate((element) => ({
            width: parseFloat(getComputedStyle(element, '::before').width),
            originalWidth: Math.min(element.getBoundingClientRect().width, 320),
            filter: getComputedStyle(element, '::before').filter,
          }))
          expect(Math.abs(glow.width / glow.originalWidth - 1.1)).toBeLessThan(0.01)
          expect(glow.filter).toBe('blur(16px)')
          await expect(page.getByRole('heading', { level: 1 })).toHaveText('About CX83 Labs')
          await expect(page).toHaveTitle('About CX83 Labs')
          await expect(page.getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact')
        }
        const measure = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight }))
        expect(measure.width).toBe(viewport.width)
        expect(measure.height).toBe(viewport.height)
        expect(measure.scroll).toBeLessThanOrEqual(measure.client)
        metrics.push({ route, ...measure })
        await page.screenshot({ path: testInfo.outputPath('interior-run3-' + route.slice(1) + '-' + viewport.width + 'x' + viewport.height + '.png'), fullPage: true, animations: 'disabled' })
      }
      await writeFile(testInfo.outputPath('interior-metrics-run3-' + viewport.width + '.json'), JSON.stringify(metrics, null, 2))
    })
  }

  test('Cat returns focus, keeps navigation usable and changes only four public starters', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.route('**/api/assistant-status', (route) => route.fulfill({ json: { enabled: true, configured: true } }))
    await page.goto(host + '/services?private=do-not-send')
    const header = page.locator('header.cx83-site-header')
    const trigger = header.getByRole('button', { name: 'Ask Cat' })
    await trigger.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('.cx83-cat-starter')).toHaveCount(4)
    await expect(dialog).toContainText('Hi, I’m Cat. I can help you explore our services')
    await expect(dialog).not.toContainText('I cannot change this website')
    await expect(dialog.locator('.cx83-cat-footer')).toContainText('Have a project in mind?')
    await expect(dialog.locator('.cx83-cat-footer a')).toHaveAttribute('href', '/contact')
    await expect(dialog).toContainText('Which CX83 service fits my business?')
    await dialog.getByRole('button', { name: 'Close Cat', exact: true }).click()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
    await trigger.click()
    await header.getByRole('link', { name: 'Software', exact: true }).click()
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('How can AI update a website?')
    await dialog.getByRole('button', { name: 'New conversation' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Close Cat', exact: true }).click()
    await expect(trigger).toBeFocused()

    for (const [path, text] of [
      ['/software/connected-websites', 'Is the Connected Website Platform available?'],
      ['/software/client-brand-studio', 'Is Client Brand Studio available?'],
    ]) {
      await page.goto(host + path)
      const launcher = page.locator('.cx83-assistant-launcher')
      await launcher.click()
      await expect(dialog.locator('.cx83-cat-starter')).toHaveCount(4)
      await expect(dialog).toContainText(text)
      if (path === '/software/client-brand-studio') {
        await expect(dialog).toContainText('Can I start a brand without existing artwork?')
      }
      await dialog.getByRole('textbox', { name: 'Message Cat' }).fill('Synthetic unsent question.')
      await expect(dialog.getByRole('button', { name: 'Send', exact: true })).toBeEnabled()
      await page.keyboard.press('Escape')
      await expect(launcher).toBeFocused()
    }
  })

  test('mobile header focus falls back to its visible menu and unavailable state is truthful', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.route('**/api/assistant-status', (route) => route.fulfill({ json: { enabled: false, configured: false } }))
    await page.goto(host + '/services')
    const menu = page.getByRole('button', { name: 'Menu', exact: true })
    await menu.click()
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('button', { name: 'Ask Cat' }).click()
    await expect(page.getByRole('dialog')).toContainText('Assistant temporarily unavailable')
    const input = page.getByRole('textbox', { name: 'Message Cat' })
    expect(await input.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)
    await input.fill('Synthetic unsent phone input.')
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Close Cat', exact: true })).toBeInViewport()
    await page.keyboard.press('Escape')
    await expect(menu).toBeFocused()
  })

  test('Notes search preserves and encodes the query, missing routes recover honestly', async ({ page }) => {
    test.setTimeout(90_000) // Six initially cold Next route families are exercised in this journey.
    await page.goto(host + '/search?q=missing%20%26%20synthetic')
    await expect(page.getByRole('searchbox', { name: 'Search notes' })).toHaveValue('missing & synthetic')
    await expect(page.getByText('Search covers published articles, not every website page.')).toBeVisible()
    await page.getByRole('searchbox', { name: 'Search notes' }).fill('other & synthetic')
    await page.getByRole('button', { name: 'Search notes' }).click()
    await expect(page).toHaveURL(/q=other%20%26%20synthetic/)
    await expect(page.getByText('No published notes match this search.')).toBeVisible()
    await page.getByRole('link', { name: 'Explore Services' }).click()
    await expect(page).toHaveURL(host + '/services')
    for (const route of ['/services/run3-missing', '/software/run3-missing', '/work/projects/run3-missing', '/work/case-studies/run3-missing', '/posts/run3-missing', '/run3-missing']) {
      expect((await page.goto(host + route))?.status()).toBe(404)
      await expect(page.getByRole('heading', { name: 'That page is not here.' })).toBeVisible()
      await expect(page.getByRole('link', { name: /Return home/ })).toHaveAttribute('href', '/')
    }
  })
  test('published CMS page and article templates have headings, recovery and real article search', async ({ page }) => {
    test.setTimeout(90_000)
    // Fixtures run outside Next's request context; use the existing hook opt-out.
    const fixtureContext = { disableRevalidate: true }
    const slug = 'run3-synthetic-utility'
    let pageId: number | undefined
    let postId: number | undefined
    const richText = { root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [
      { type: 'paragraph', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [
        { type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text: 'Synthetic article content for isolated CI only.' },
      ] },
    ] } }
    try {
      pageId = (await payload.create({ collection: 'pages', overrideAccess: true, context: fixtureContext, data: {
        title: 'Synthetic Run 3 Page', slug, hero: { type: 'lowImpact' }, layout: [{ blockType: 'content', columns: [{ size: 'full', richText }] }], _status: 'published',
      } })).id
      postId = (await payload.create({ collection: 'posts', overrideAccess: true, context: fixtureContext, data: {
        title: 'Synthetic Run 3 Article', slug, content: richText, _status: 'published',
      } })).id
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 })
        await page.goto(host + '/' + slug)
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Synthetic Run 3 Page')
        await page.getByRole('link', { name: 'Return home', exact: true }).click()
        await expect(page).toHaveURL(host + '/')
        await page.goto(host + '/posts/' + slug)
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Synthetic Run 3 Article')
        await expect(page.getByText('Synthetic article content for isolated CI only.')).toBeVisible()
        await page.getByRole('link', { name: 'Back to Notes' }).click()
        await expect(page).toHaveURL(host + '/posts')
        await page.goto(host + '/search?q=Synthetic%20Run%203%20Article')
        await page.getByRole('link', { name: 'Synthetic Run 3 Article' }).click()
        await expect(page).toHaveURL(host + '/posts/' + slug)
      }
    } finally {
      if (postId) await payload.delete({ collection: 'posts', id: postId, overrideAccess: true, context: fixtureContext })
      if (pageId) await payload.delete({ collection: 'pages', id: pageId, overrideAccess: true, context: fixtureContext })
    }
  })

  test('private admin data stays protected', async ({ request }) => {
    const response = await request.get(host + '/api/form-submissions')
    expect([401, 403]).toContain(response.status())
  })
})
