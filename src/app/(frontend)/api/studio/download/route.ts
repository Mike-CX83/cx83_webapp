import fs from 'fs'
import path from 'path'

import { databaseConfigured } from '@/lib/database'
import { getPayloadClient } from '@/lib/payload'
import { authorizeStudioDownload, resolveCatalogFile, type StudioEntitlement, type StudioPlatform } from '@/lib/studioDownload'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('path') || url.searchParams.get('key') || url.searchParams.get('url')) {
    return Response.json({ ok: false, error: 'A download cannot use a caller-supplied path.' }, { status: 400 })
  }
  const artifactId = url.searchParams.get('id') || ''
  if (!databaseConfigured()) {
    return Response.json(
      { ok: false, error: 'The download service is not connected to PostgreSQL yet, so no file was sent.' },
      { status: 503 },
    )
  }
  const payload = await getPayloadClient()
  if (!payload) {
    return Response.json(
      { ok: false, error: 'PostgreSQL did not accept the connection, so no file was sent.' },
      { status: 503 },
    )
  }
  const { user } = await payload.auth({ headers: req.headers })
  const entitlements: StudioEntitlement[] = []
  if (user) {
    const found = await payload.find({
      collection: 'studio-entitlements',
      where: { user: { equals: user.id } },
      depth: 0,
      limit: 20,
    })
    for (const doc of found.docs) {
      entitlements.push({
        userId: String(user.id),
        productSlug: 'client-brand-studio',
        grant: doc.grant === 'owner' ? 'owner' : 'test',
        platforms: (doc.platforms || []) as StudioPlatform[],
      })
    }
  }
  const decision = authorizeStudioDownload({
    userId: user ? String(user.id) : null,
    artifactId,
    entitlements,
  })
  if (!decision.ok) {
    return Response.json({ ok: false, error: decision.error }, { status: decision.status })
  }
  const root = process.env.STUDIO_DOWNLOAD_ROOT
  if (!root) {
    return Response.json(
      { ok: false, error: 'The installer has not been published to this server.' },
      { status: 404 },
    )
  }
  const filePath = resolveCatalogFile(root, decision.artifact.storageKey)
  if (!filePath || !fs.existsSync(filePath)) {
    return Response.json(
      { ok: false, error: 'The installer has not been published to this server.' },
      { status: 404 },
    )
  }
  await payload.create({
    collection: 'studio-download-events',
    data: {
      user: user?.id,
      catalogId: decision.artifact.id,
      testGrant: decision.testGrant,
    },
    overrideAccess: true,
  })
  const bytes = fs.readFileSync(filePath)
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${path.basename(decision.artifact.filename)}"`,
      'X-Studio-Grant': decision.testGrant ? 'test' : 'owner',
      'X-Studio-Signing': decision.artifact.signingStatus,
    },
  })
}
