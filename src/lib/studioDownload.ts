import path from 'path'

export type StudioPlatform = 'mac-arm64' | 'windows-x64'
export type StudioGrant = 'test' | 'owner'
export type SigningStatus = 'unsigned' | 'developer-id' | 'notarized'

export type StudioArtifact = {
  id: string
  version: string
  platform: StudioPlatform
  filename: string
  sha256: string
  signingStatus: SigningStatus
  storageKey: string
}

export type StudioEntitlement = {
  userId: string
  productSlug: 'client-brand-studio'
  grant: StudioGrant
  platforms: StudioPlatform[]
}

export const STUDIO_CATALOG: Record<string, StudioArtifact> = {
  'client-brand-studio-0.7.0-mac-arm64-unsigned': {
    id: 'client-brand-studio-0.7.0-mac-arm64-unsigned',
    version: '0.7.0',
    platform: 'mac-arm64',
    filename: 'Client-Brand-Studio-0.7.0-mac-arm64-unsigned.dmg',
    sha256: '',
    signingStatus: 'unsigned',
    storageKey: 'Client-Brand-Studio-0.7.0-mac-arm64-unsigned.dmg',
  },
}

export type DownloadDecision =
  | { ok: true; artifact: StudioArtifact; testGrant: boolean }
  | { ok: false; status: 400 | 401 | 403 | 404; error: string }

export function authorizeStudioDownload(input: {
  userId: string | null
  artifactId: string
  requestedPath?: string | null
  entitlements: StudioEntitlement[]
  catalog?: Record<string, StudioArtifact>
}): DownloadDecision {
  if (input.requestedPath) {
    return { ok: false, status: 400, error: 'A download cannot use a caller-supplied path.' }
  }
  if (!input.userId) {
    return { ok: false, status: 401, error: 'Sign in before downloading.' }
  }
  const catalog = input.catalog ?? STUDIO_CATALOG
  const artifact = catalog[input.artifactId]
  if (!artifact) {
    return { ok: false, status: 404, error: 'That release file is not in the catalog.' }
  }
  const grant = input.entitlements.find(
    (item) =>
      item.userId === input.userId &&
      item.productSlug === 'client-brand-studio' &&
      item.platforms.includes(artifact.platform),
  )
  if (!grant) {
    return { ok: false, status: 403, error: 'This account does not have this download.' }
  }
  return { ok: true, artifact, testGrant: grant.grant === 'test' }
}

export function resolveCatalogFile(root: string, storageKey: string): string | null {
  if (!storageKey || storageKey.includes('..') || storageKey.startsWith('/') || storageKey.includes('\\')) {
    return null
  }
  const rootPath = path.resolve(root)
  const full = path.resolve(rootPath, storageKey)
  if (full !== rootPath && !full.startsWith(rootPath + path.sep)) {
    return null
  }
  return full
}
