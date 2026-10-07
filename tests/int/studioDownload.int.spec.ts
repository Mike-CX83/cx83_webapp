import { describe, expect, it } from 'vitest'

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
})
