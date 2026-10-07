import fs from 'fs'
import os from 'os'
import path from 'path'

import { getPayload } from 'payload'
import { describe, expect, it } from 'vitest'

import { downloadForUser, GET } from '@/app/(frontend)/api/studio/download/route'
import config from '@/payload.config'
import { databaseConfigured } from '@/lib/database'
import { authorizeStudioDownload, resolveCatalogFile, STUDIO_CATALOG } from '@/lib/studioDownload'

const artifact = STUDIO_CATALOG['client-brand-studio-0.7.0-mac-arm64-unsigned']

describe('studio download authorization', () => {
  it('rejects a caller-supplied path and an unknown artifact', () => {
    const supplied = authorizeStudioDownload({
      userId: 'user-1',
      artifactId: artifact.id,
      requestedPath: '../secret.dmg',
      entitlements: [],
    })
    expect(supplied.ok).toBe(false)
    if (!supplied.ok) expect(supplied.status).toBe(400)

    const missing = authorizeStudioDownload({
      userId: 'user-1',
      artifactId: 'not-a-release',
      entitlements: [
        { userId: 'user-1', productSlug: 'client-brand-studio', grant: 'test', platforms: ['mac-arm64'] },
      ],
    })
    expect(missing.ok).toBe(false)
    if (!missing.ok) expect(missing.status).toBe(404)
  })

  it('allows a labeled test grant and keeps the file inside the storage root', () => {
    const allowed = authorizeStudioDownload({
      userId: 'user-1',
      artifactId: artifact.id,
      entitlements: [
        { userId: 'user-1', productSlug: 'client-brand-studio', grant: 'test', platforms: ['mac-arm64'] },
      ],
    })
    expect(allowed.ok).toBe(true)
    if (allowed.ok) expect(allowed.testGrant).toBe(true)

    expect(resolveCatalogFile('/private/downloads', artifact.storageKey)).toBe(
      '/private/downloads/Client-Brand-Studio-0.7.0-mac-arm64-unsigned.dmg',
    )
    expect(resolveCatalogFile('/private/downloads', '../etc/passwd')).toBeNull()
  })

  it('rejects a caller-supplied download path before any file is opened', async () => {
    const response = await GET(new Request('http://localhost/api/studio/download?id=x&path=../secret.dmg'))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/caller-supplied path/)
  })

  it('serves an entitled test grant and rejects a signed-in user without one', async () => {
    if (!databaseConfigured()) {
      expect(databaseConfigured()).toBe(false)
      return
    }
    const payload = await getPayload({ config: await config })
    const stamp = Date.now()
    const password = 'studio-test-password'
    const entitled = await payload.create({
      collection: 'users',
      data: { email: `studio-entitled-${stamp}@example.com`, password, name: 'Studio Entitled' },
    })
    const outsider = await payload.create({
      collection: 'users',
      data: { email: `studio-outsider-${stamp}@example.com`, password, name: 'Studio Outsider' },
    })
    await payload.create({
      collection: 'studio-entitlements',
      data: {
        user: entitled.id,
        productSlug: 'client-brand-studio',
        grant: 'test',
        platforms: ['mac-arm64'],
      },
      overrideAccess: true,
    })
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-download-'))
    const filename = STUDIO_CATALOG['client-brand-studio-0.7.0-mac-arm64-unsigned'].filename
    fs.writeFileSync(path.join(root, filename), 'unsigned-installer-bytes')
    const previous = process.env.STUDIO_DOWNLOAD_ROOT
    process.env.STUDIO_DOWNLOAD_ROOT = root
    try {
      const anonymous = await GET(
        new Request('http://localhost/api/studio/download?id=client-brand-studio-0.7.0-mac-arm64-unsigned'),
      )
      expect(anonymous.status).toBe(401)
      const denied = await downloadForUser(String(outsider.id), 'client-brand-studio-0.7.0-mac-arm64-unsigned')
      expect(denied.status).toBe(403)
      const allowed = await downloadForUser(String(entitled.id), 'client-brand-studio-0.7.0-mac-arm64-unsigned')
      expect(allowed.status).toBe(200)
      expect(allowed.headers.get('X-Studio-Grant')).toBe('test')
      expect(Buffer.from(await allowed.arrayBuffer()).toString()).toBe('unsigned-installer-bytes')
    } finally {
      if (previous === undefined) delete process.env.STUDIO_DOWNLOAD_ROOT
      else process.env.STUDIO_DOWNLOAD_ROOT = previous
      fs.rmSync(root, { recursive: true, force: true })
      await payload.delete({
        collection: 'studio-download-events',
        where: { user: { in: [entitled.id, outsider.id] } },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'studio-entitlements',
        where: { user: { in: [entitled.id, outsider.id] } },
        overrideAccess: true,
      })
      await payload.delete({ collection: 'users', id: entitled.id, overrideAccess: true })
      await payload.delete({ collection: 'users', id: outsider.id, overrideAccess: true })
    }
  })
})
