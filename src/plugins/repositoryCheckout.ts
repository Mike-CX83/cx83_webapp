import { spawn } from 'node:child_process'
import { mkdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const stagingBranch = 'staging-host'
export const sourceBundlePath = '/app/.cx83-staging-source.bundle'
export const deployedRef = 'refs/cx83/deployed'
export const productionRepoRoot = '/repo'

const shaPattern = /^[0-9a-f]{40}$/
const safeRefPattern = /^(?:HEAD|refs\/[A-Za-z0-9._/-]+)$/
const generatedDirectories = ['.pnpm-store', 'node_modules', '.next', '.cx83-checks']
const lockStaleMs = 120_000
const gitTimeoutMs = 20_000

const allowedOrigins = new Set([
  'git@github.com:Mike-CX83/cx83_webapp',
  'ssh://git@github.com/Mike-CX83/cx83_webapp',
  'https://github.com/Mike-CX83/cx83_webapp',
])

export type CheckoutDecision = 'aligned' | 'safe-to-sync' | 'blocked'

export type CheckoutReport = {
  checkoutSha: string
  deployedSha: string
  branch: string
  dirty: boolean
  syncNeeded: boolean
  safeToSync: boolean
  blocked: boolean
  decision: CheckoutDecision
  reason: string
  origin: 'expected' | 'unexpected' | 'unknown'
}

export type GitResult = {
  code: number
  stdout: string
  stderr: string
}

export type GitRunner = (args: string[]) => Promise<GitResult>

export type CheckoutOptions = {
  repoRoot: string
  bundlePath: string
  deployedSha: string
  expectedSha?: string
  runGit?: GitRunner
}

type OwnerCheckout = { ok: true; options: CheckoutOptions } | { ok: false; report: CheckoutReport }

export function normalizeSha(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

export function isCommitSha(value: string): boolean {
  return shaPattern.test(value)
}

export function classifyOrigin(url: string): 'expected' | 'unexpected' {
  const normalized = url
    .trim()
    .replace(/^https:\/\/(?:[^@/\s]+)@/i, 'https://')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '')

  return allowedOrigins.has(normalized) ? 'expected' : 'unexpected'
}

export function userChanges(porcelain: string): string[] {
  const changes: string[] = []

  for (const line of porcelain.split('\n')) {
    if (!line.trim()) continue

    const entry = line.slice(3).trim().replace(/^"|"$/g, '')
    const filePath = (entry.includes(' -> ') ? entry.split(' -> ').at(-1) : entry) ?? entry
    const normalized = filePath.replace(/\\/g, '/').replace(/^\.\//, '')

    if (line.startsWith('?? ') && isGeneratedPath(normalized)) continue

    changes.push(normalized.slice(0, 180))
  }

  return changes
}

export function formatCheckoutReport(report: CheckoutReport): string {
  const lines = [
    `decision=${report.decision}`,
    `blocked=${report.blocked}`,
    `safeToSync=${report.safeToSync}`,
    `syncNeeded=${report.syncNeeded}`,
    `dirty=${report.dirty}`,
    `branch=${report.branch || 'unknown'}`,
    `origin=${report.origin}`,
    `checkoutSha=${report.checkoutSha || 'unknown'}`,
    `deployedSha=${report.deployedSha || 'unknown'}`,
    `reason=${report.reason.replace(/[\r\n]+/g, ' ')}`,
  ]

  return lines.join('\n')
}

export function resolveOwnerCheckoutOptions(expectedSha?: string): OwnerCheckout {
  const requested = normalizeSha(expectedSha)

  if (process.env.NODE_ENV === 'production') {
    const configured = process.env.CX83_REPO_ROOT

    if (configured && path.resolve(configured) !== productionRepoRoot) {
      return {
        ok: false,
        report: blockedReport({
          deployedSha: normalizeSha(process.env.CX83_DEPLOYED_SHA),
          reason: 'repository root is not the staging checkout',
        }),
      }
    }

    return {
      ok: true,
      options: {
        repoRoot: productionRepoRoot,
        bundlePath: sourceBundlePath,
        deployedSha: normalizeSha(process.env.CX83_DEPLOYED_SHA),
        expectedSha: requested || undefined,
      },
    }
  }

  return {
    ok: true,
    options: {
      repoRoot: process.env.CX83_REPO_ROOT
        ? path.resolve(process.env.CX83_REPO_ROOT)
        : process.cwd(),
      bundlePath: sourceBundlePath,
      deployedSha: normalizeSha(process.env.CX83_DEPLOYED_SHA),
      expectedSha: requested || undefined,
    },
  }
}

export function createGitRunner(repoRoot: string, bundlePath: string): GitRunner {
  const root = path.resolve(repoRoot)
  const bundle = path.resolve(bundlePath)

  return async (args) => {
    assertAllowedGitArgs(args, bundle)
    const hooksPath = path.join(root, '.git', 'cx83-no-hooks')
    await mkdir(hooksPath, { recursive: true })
    return runGitProcess(root, args, hooksPath)
  }
}

export async function inspectRepositoryCheckout(options: CheckoutOptions): Promise<CheckoutReport> {
  const deployedSha = normalizeSha(options.deployedSha)
  const requestedSha = normalizeSha(options.expectedSha)
  const runGit = options.runGit ?? createGitRunner(options.repoRoot, options.bundlePath)

  try {
    const head = await runGit(['rev-parse', '--verify', 'HEAD'])
    const checkoutSha = firstLine(head.stdout).toLowerCase()
    const validHead = head.code === 0 && isCommitSha(checkoutSha)
    const branchResult = await runGit(['symbolic-ref', '--quiet', '--short', 'HEAD'])
    const branch = branchResult.code === 0 ? firstLine(branchResult.stdout) : ''
    const originResult = await runGit(['remote', 'get-url', 'origin'])
    const origin =
      originResult.code === 0 ? classifyOrigin(firstLine(originResult.stdout)) : 'unknown'
    const statusResult = await runGit(['status', '--porcelain=v1', '--untracked-files=normal'])
    const changes =
      statusResult.code === 0 ? userChanges(statusResult.stdout) : ['status-unreadable']
    const dirty = changes.length > 0
    const deployedRecorded = isCommitSha(deployedSha)
    const syncNeeded = validHead && deployedRecorded && checkoutSha !== deployedSha
    let history: 'ancestor' | 'diverged' | 'absent' | 'unchecked' = 'unchecked'

    if (validHead && deployedRecorded && syncNeeded) {
      const present = await runGit(['rev-parse', '--verify', `${deployedSha}^{commit}`])

      if (present.code !== 0) {
        history = 'absent'
      } else {
        const ancestor = await runGit(['merge-base', '--is-ancestor', checkoutSha, deployedSha])
        history = ancestor.code === 0 ? 'ancestor' : 'diverged'
      }
    }

    let reason = 'checkout already matches the deployed commit'
    let blocked = false

    if (!validHead || head.code !== 0) {
      blocked = true
      reason = 'checkout commit is unknown'
    } else if (!branch) {
      blocked = true
      reason = 'detached HEAD'
    } else if (branch !== stagingBranch) {
      blocked = true
      reason = `branch is ${branch}`
    } else if (origin !== 'expected') {
      blocked = true
      reason = 'origin is not the CX83 website repository'
    } else if (statusResult.code !== 0) {
      blocked = true
      reason = 'checkout status could not be read'
    } else if (dirty) {
      blocked = true
      reason = `uncommitted changes: ${changes.slice(0, 8).join(', ')}`
    } else if (requestedSha && !isCommitSha(requestedSha)) {
      blocked = true
      reason = 'requested commit is not a commit id'
    } else if (requestedSha && requestedSha !== deployedSha) {
      blocked = true
      reason = 'requested commit does not match the deployed commit'
    } else if (!deployedRecorded) {
      blocked = true
      reason = 'deployed commit is not recorded'
    } else if (history === 'diverged') {
      blocked = true
      reason = 'checkout history diverges from the deployed commit'
    } else if (history === 'absent') {
      const bundleReady = await readableBundle(path.resolve(options.bundlePath))

      if (!bundleReady) {
        blocked = true
        reason = 'verified source bundle could not be read'
      } else {
        reason = 'deployed commit is not in this checkout yet'
      }
    } else if (syncNeeded) {
      reason = 'checkout can fast-forward to the deployed commit'
    }

    const safeToSync = !blocked && syncNeeded && (history === 'ancestor' || history === 'absent')

    return {
      checkoutSha: validHead ? checkoutSha : '',
      deployedSha: deployedRecorded ? deployedSha : '',
      branch,
      dirty,
      syncNeeded,
      safeToSync,
      blocked,
      decision: blocked ? 'blocked' : syncNeeded ? 'safe-to-sync' : 'aligned',
      reason,
      origin,
    }
  } catch {
    return blockedReport({
      deployedSha: isCommitSha(deployedSha) ? deployedSha : '',
      reason: 'checkout status could not be read',
    })
  }
}

export async function syncRepositoryCheckout(options: CheckoutOptions): Promise<CheckoutReport> {
  const repoRoot = path.resolve(options.repoRoot)
  const bundlePath = path.resolve(options.bundlePath)
  const deployedSha = normalizeSha(options.deployedSha)
  const runGit = options.runGit ?? createGitRunner(repoRoot, bundlePath)

  let release = async () => {}

  try {
    release = await acquireSyncLock(repoRoot)
  } catch (error) {
    if (error instanceof Error && error.message === 'sync already running') {
      return blockedReport({
        deployedSha: isCommitSha(deployedSha) ? deployedSha : '',
        reason: 'sync already running',
      })
    }

    return blockedReport({
      deployedSha: isCommitSha(deployedSha) ? deployedSha : '',
      reason: 'checkout status could not be read',
    })
  }

  try {
    const before = await inspectRepositoryCheckout({ ...options, repoRoot, bundlePath, runGit })

    if (before.decision === 'aligned' || before.blocked || !before.safeToSync) return before

    const present = await runGit(['rev-parse', '--verify', `${deployedSha}^{commit}`])

    if (present.code !== 0) {
      const imported = await importDeployedBundle(runGit, bundlePath, deployedSha)

      if (imported) return { ...before, ...blockedFields(imported) }

      const ancestor = await runGit([
        'merge-base',
        '--is-ancestor',
        before.checkoutSha,
        deployedSha,
      ])

      if (ancestor.code !== 0) {
        await runGit(['update-ref', '-d', deployedRef])
        return { ...before, ...blockedFields('checkout history diverges from the deployed commit') }
      }
    }

    const again = await inspectRepositoryCheckout({ ...options, repoRoot, bundlePath, runGit })

    if (again.blocked || again.checkoutSha !== before.checkoutSha) {
      await runGit(['update-ref', '-d', deployedRef])
      return again.blocked
        ? again
        : { ...again, ...blockedFields('checkout changed before the fast-forward') }
    }

    const merged = await runGit(['merge', '--ff-only', deployedSha])
    const afterSha = firstLine(
      (await runGit(['rev-parse', '--verify', 'HEAD'])).stdout,
    ).toLowerCase()
    await runGit(['update-ref', '-d', deployedRef])

    if (merged.code !== 0 || afterSha !== deployedSha) {
      return {
        ...before,
        checkoutSha: isCommitSha(afterSha) ? afterSha : before.checkoutSha,
        ...blockedFields('end commit did not match the deployed commit'),
      }
    }

    return {
      ...before,
      checkoutSha: afterSha,
      dirty: false,
      syncNeeded: false,
      safeToSync: false,
      blocked: false,
      decision: 'aligned',
      reason: 'checkout fast-forwarded to the deployed commit',
    }
  } catch {
    return blockedReport({
      deployedSha: isCommitSha(deployedSha) ? deployedSha : '',
      reason: 'sync failed',
    })
  } finally {
    await release()
  }
}

function blockedFields(
  reason: string,
): Pick<CheckoutReport, 'blocked' | 'safeToSync' | 'decision' | 'reason'> {
  return {
    blocked: true,
    safeToSync: false,
    decision: 'blocked',
    reason,
  }
}

function blockedReport(partial: Partial<CheckoutReport> & { reason: string }): CheckoutReport {
  return {
    checkoutSha: partial.checkoutSha ?? '',
    deployedSha: partial.deployedSha ?? '',
    branch: partial.branch ?? '',
    dirty: partial.dirty ?? false,
    syncNeeded: partial.syncNeeded ?? false,
    safeToSync: false,
    blocked: true,
    decision: 'blocked',
    reason: partial.reason,
    origin: partial.origin ?? 'unknown',
  }
}

async function readableBundle(bundlePath: string): Promise<boolean> {
  try {
    const info = await stat(bundlePath)

    return info.isFile() && info.size > 0
  } catch {
    return false
  }
}

async function importDeployedBundle(
  runGit: GitRunner,
  bundlePath: string,
  deployedSha: string,
): Promise<string | undefined> {
  const verified = await runGit(['bundle', 'verify', bundlePath])

  if (verified.code !== 0) return 'verified source bundle could not be read'

  const heads = await runGit(['bundle', 'list-heads', bundlePath])
  const bundledRef = heads.code === 0 ? refForSha(heads.stdout, deployedSha) : ''

  if (!bundledRef) return 'bundled commit does not match the deployed commit'

  await runGit(['update-ref', '-d', deployedRef])
  const fetched = await runGit(['fetch', '--no-tags', bundlePath, `${bundledRef}:${deployedRef}`])

  if (fetched.code !== 0) {
    await runGit(['update-ref', '-d', deployedRef])
    return 'verified source bundle could not be read'
  }

  const fetchedSha = firstLine(
    (await runGit(['rev-parse', '--verify', deployedRef])).stdout,
  ).toLowerCase()

  if (fetchedSha !== deployedSha) {
    await runGit(['update-ref', '-d', deployedRef])
    return 'bundled commit does not match the deployed commit'
  }

  return undefined
}

function isGeneratedPath(filePath: string): boolean {
  const normalized = filePath.replace(/\/+$/, '')

  return generatedDirectories.some(
    (directory) => normalized === directory || normalized.startsWith(`${directory}/`),
  )
}

function firstLine(value: string): string {
  return value.split(/\r?\n/, 1)[0]?.trim() ?? ''
}

function refForSha(listHeads: string, sha: string): string {
  for (const line of listHeads.split('\n')) {
    const [foundSha, ref] = line.trim().split(/\s+/)

    if (foundSha?.toLowerCase() !== sha || !ref) continue
    if (!safeRefPattern.test(ref) || ref.includes('..')) continue

    return ref
  }

  return ''
}

function assertAllowedGitArgs(args: string[], bundlePath: string): void {
  const [command, ...rest] = args

  if (!command || rest.some((arg) => arg.includes('\0'))) {
    throw new Error('Refused git command.')
  }

  const shaArg = (value: string | undefined) =>
    Boolean(value && (isCommitSha(value) || /^[0-9a-f]{40}\^\{commit\}$/.test(value)))

  const allowed =
    (command === 'rev-parse' &&
      rest.length === 2 &&
      rest[0] === '--verify' &&
      (rest[1] === 'HEAD' || rest[1] === deployedRef || shaArg(rest[1]))) ||
    (command === 'symbolic-ref' &&
      rest.length === 3 &&
      rest[0] === '--quiet' &&
      rest[1] === '--short' &&
      rest[2] === 'HEAD') ||
    (command === 'status' &&
      rest.length === 2 &&
      rest[0] === '--porcelain=v1' &&
      rest[1] === '--untracked-files=normal') ||
    (command === 'remote' && rest.length === 2 && rest[0] === 'get-url' && rest[1] === 'origin') ||
    (command === 'bundle' &&
      rest.length === 2 &&
      (rest[0] === 'verify' || rest[0] === 'list-heads') &&
      path.resolve(rest[1] ?? '') === bundlePath) ||
    (command === 'update-ref' &&
      rest.length === 2 &&
      rest[0] === '-d' &&
      rest[1] === deployedRef) ||
    (command === 'fetch' &&
      rest.length === 3 &&
      rest[0] === '--no-tags' &&
      path.resolve(rest[1] ?? '') === bundlePath &&
      isFixedRefspec(rest[2] ?? '')) ||
    (command === 'merge-base' &&
      rest.length === 3 &&
      rest[0] === '--is-ancestor' &&
      isCommitSha(rest[1] ?? '') &&
      isCommitSha(rest[2] ?? '')) ||
    (command === 'merge' &&
      rest.length === 2 &&
      rest[0] === '--ff-only' &&
      isCommitSha(rest[1] ?? ''))

  if (!allowed) throw new Error('Refused git command.')
}

function isFixedRefspec(value: string): boolean {
  const separator = value.lastIndexOf(':')

  if (separator <= 0) return false

  const source = value.slice(0, separator)
  const destination = value.slice(separator + 1)

  return destination === deployedRef && safeRefPattern.test(source) && !source.includes('..')
}

function runGitProcess(repoRoot: string, args: string[], hooksPath: string): Promise<GitResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['-C', repoRoot, ...args], {
      env: gitEnv(repoRoot, hooksPath),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    let settled = false

    const finish = (result: GitResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      finish({ code: 124, stdout, stderr })
    }, gitTimeoutMs)

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    child.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code) => finish({ code: code ?? 1, stdout, stderr }))
  })
}

function gitEnv(repoRoot: string, hooksPath: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    GIT_CONFIG_COUNT: '2',
    GIT_CONFIG_KEY_0: 'safe.directory',
    GIT_CONFIG_VALUE_0: repoRoot,
    GIT_CONFIG_KEY_1: 'core.hooksPath',
    GIT_CONFIG_VALUE_1: hooksPath,
  }
}

async function acquireSyncLock(repoRoot: string): Promise<() => Promise<void>> {
  const lockPath = path.join(repoRoot, '.git', 'cx83-sync.lock')

  const claim = async () => {
    await mkdir(lockPath)
  }

  try {
    await claim()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error

    const info = await stat(lockPath).catch(() => undefined)

    if (!info || Date.now() - info.mtimeMs < lockStaleMs) {
      throw new Error('sync already running')
    }

    await rm(lockPath, { recursive: true, force: true })
    await claim()
  }

  return async () => {
    await rm(lockPath, { recursive: true, force: true })
  }
}

function isDirectCheckoutCommand(): boolean {
  const entry = process.argv[1]

  if (!entry || !process.argv.includes('--sync')) return false

  return pathToFileURL(path.resolve(entry)).href === import.meta.url
}

if (isDirectCheckoutCommand()) {
  const resolved = resolveOwnerCheckoutOptions()
  const pending = resolved.ok
    ? syncRepositoryCheckout(resolved.options)
    : Promise.resolve(resolved.report)

  pending
    .then((report) => {
      process.stdout.write(`${formatCheckoutReport(report)}\n`)
      process.exit(report.blocked ? 2 : 0)
    })
    .catch(() => {
      process.stdout.write(`${formatCheckoutReport(blockedReport({ reason: 'sync failed' }))}\n`)
      process.exit(2)
    })
}
