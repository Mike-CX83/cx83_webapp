import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config.js'

const host = 'http://localhost:3000'
const fixturePublishedAt = '2026-10-10T00:00:00.000Z'
const projectSlug = 'run2-synthetic-project'
const studySlug = 'run2-synthetic-case'

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

test.describe('Run 2 Work with published synthetic CMS records', () => {
  test.skip(!isolatedCIDatabase(), 'Synthetic fixture writes require isolated localhost CI PostgreSQL.')
  let payload: Payload | undefined
  let projectId: number | undefined
  let studyId: number | undefined

  test.beforeAll(async () => {
    test.setTimeout(120_000)
    payload = await getPayload({ config })
    const projects = await payload.find({ collection: 'projects', overrideAccess: true, where: { slug: { equals: projectSlug } }, limit: 1 })
    const foundProject = projects.docs[0]
    if (foundProject) {
      expect(foundProject.title).toBe('Synthetic Run 2 Project')
      expect(foundProject.publishedAt).toBe(fixturePublishedAt)
      expect(foundProject._status).toBe('published')
      projectId = foundProject.id
    } else {
      const created = await payload.create({
        collection: 'projects', overrideAccess: true,
        data: {
          title: 'Synthetic Run 2 Project', slug: projectSlug, summary: 'Isolated test data, never a real customer.',
          description: 'An intentionally synthetic published fixture tests the Work detail view and return navigation.',
          technologies: [{ name: 'Test fixture' }], status: 'in-progress', publishedAt: fixturePublishedAt, _status: 'published',
        },
      })
      projectId = created.id
    }
    const studies = await payload.find({ collection: 'case-studies', overrideAccess: true, where: { slug: { equals: studySlug } }, limit: 1 })
    const foundStudy = studies.docs[0]
    if (foundStudy) {
      expect(foundStudy.title).toBe('Synthetic Run 2 Case')
      expect(foundStudy.publishedAt).toBe(fixturePublishedAt)
      expect(foundStudy._status).toBe('published')
      studyId = foundStudy.id
    } else {
      const created = await payload.create({
        collection: 'case-studies', overrideAccess: true,
        data: {
          title: 'Synthetic Run 2 Case', slug: studySlug, summary: 'Fixture for published case rendering.',
          problem: 'Test the presence of a complete case.', approach: 'Use synthetic test data only.',
          outcome: 'The template renders populated content and its return navigation.',
          publishedAt: fixturePublishedAt, _status: 'published',
        },
      })
      studyId = created.id
    }
  })

  test.afterAll(async () => {
    if (!payload || !isolatedCIDatabase()) return
    if (studyId) {
      const record = await payload.findByID({ collection: 'case-studies', id: studyId, overrideAccess: true })
      if (record.slug === studySlug && record.title === 'Synthetic Run 2 Case' && record.publishedAt === fixturePublishedAt) {
        await payload.delete({ collection: 'case-studies', id: studyId, overrideAccess: true })
      }
    }
    if (projectId) {
      const record = await payload.findByID({ collection: 'projects', id: projectId, overrideAccess: true })
      if (record.slug === projectSlug && record.title === 'Synthetic Run 2 Project' && record.publishedAt === fixturePublishedAt) {
        await payload.delete({ collection: 'projects', id: projectId, overrideAccess: true })
      }
    }
  })

  test('Work renders published cards, both detail templates and return links', async ({ page }) => {
    const response = await page.goto(host + '/work')
    expect(response?.status()).toBe(200)
    const project = page.getByRole('heading', { name: 'Synthetic Run 2 Project' })
    const study = page.getByRole('heading', { name: 'Synthetic Run 2 Case' })
    await expect(project).toBeVisible()
    await expect(study).toBeVisible()
    await expect(page.locator('#cx83-connected-website')).toBeVisible()
    await expect(page.getByRole('link', { name: 'View the project' })).toHaveAttribute('href', '/work/projects/' + projectSlug)
    await expect(page.getByRole('link', { name: 'Read the case study' })).toHaveAttribute('href', '/work/case-studies/' + studySlug)
    await page.goto(host + '/work/projects/' + projectSlug)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Synthetic Run 2 Project')
    await expect(page.getByText('An intentionally synthetic published fixture tests')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to Work' })).toHaveAttribute('href', '/work')
    await page.goto(host + '/work/case-studies/' + studySlug)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Synthetic Run 2 Case')
    await expect(page.getByRole('heading', { name: 'Problem' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Outcome' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to Work' })).toHaveAttribute('href', '/work')
  })
})
