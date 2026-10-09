// @vitest-environment node

import { spawn } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  classifyOrigin,
  createGitRunner,
  deployedRef,
  formatCheckoutReport,
  inspectRepositoryCheckout,
  resolveOwnerCheckoutOptions,
  syncRepositoryCheckout,
  userChanges,
  type CheckoutOptions,
  type GitRunner,
} from '@/plugins/repositoryCheckout'
import { repositoryTools } from '@/plugins/repositoryTools'

const directories: string[] = []
const bundles: string[] = []

afterEach(async () => {
  await Promise.all(bundles.splice(0).map((bundle) => rm(bundle, { force: true })))
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('repository checkout sync', () => {
  it('classifies the website origin and ignores generated files', () => {
    expect(
      classifyOrigin('https://x-access-token:ghp_supersecret@github.com/Mike-CX83/cx83_webapp.git'),
    ).toBe('expected')
    expect(classifyOrigin('git@github.com:Mike-CX83/cx83_webapp.git')).toBe('expected')
    expect(classifyOrigin('https://github.com/other/repo.git')).toBe('unexpected')
    expect(userChanges('?? .pnpm-store/\n?? notes.txt\n M README.md\n')).toEqual([
      'notes.txt',
      'README.md',
    ])
    expect(formatCheckoutReport(reportFixture())).not.toContain('ghp_')
  })

  it('fast-forwards a clean checkout that is behind and is idempotent', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    const first = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(first.decision).toBe('aligned')
    expect(first.blocked).toBe(false)
    expect(first.checkoutSha).toBe(ahead.sha)
    expect(await head(behind.dir)).toBe(ahead.sha)
    await rm(ahead.bundle, { force: true })

    const second = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(second.decision).toBe('aligned')
    expect(second.syncNeeded).toBe(false)
    expect(second.reason).toContain('already matches')
    expect(await head(behind.dir)).toBe(ahead.sha)
  })

  it('reports a clean behind checkout as safe to sync', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    const status = await inspectRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(status).toMatchObject({
      decision: 'safe-to-sync',
      blocked: false,
      safeToSync: true,
      syncNeeded: true,
      dirty: false,
      branch: 'staging-host',
      origin: 'expected',
      checkoutSha: behind.sha,
      deployedSha: ahead.sha,
    })
  })

  it('preserves a dirty checkout', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    await writeFile(path.join(behind.dir, 'README.md'), 'local edit\n')

    const status = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(status.blocked).toBe(true)
    expect(status.dirty).toBe(true)
    expect(status.reason).toContain('uncommitted changes')
    expect(await head(behind.dir)).toBe(behind.sha)
    expect(await readFile(path.join(behind.dir, 'README.md'), 'utf8')).toBe('local edit\n')
  })

  it('preserves an untracked owner file', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    await writeFile(path.join(behind.dir, 'notes.txt'), 'keep\n')

    const status = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(status.blocked).toBe(true)
    expect(status.reason).toContain('notes.txt')
    expect(await head(behind.dir)).toBe(behind.sha)
    expect(await readFile(path.join(behind.dir, 'notes.txt'), 'utf8')).toBe('keep\n')
  })

  it('fast-forwards when the only untracked files are generated', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    await mkdir(path.join(behind.dir, '.pnpm-store'), { recursive: true })
    await writeFile(path.join(behind.dir, '.pnpm-store', 'cache'), 'generated\n')

    const status = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(status.decision).toBe('aligned')
    expect(await head(behind.dir)).toBe(ahead.sha)
    expect(await readFile(path.join(behind.dir, '.pnpm-store', 'cache'), 'utf8')).toBe(
      'generated\n',
    )
  })

  it('preserves a diverged checkout', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    await writeFile(path.join(behind.dir, 'local.txt'), 'local\n')
    await git(behind.dir, ['add', 'local.txt'])
    await git(behind.dir, ['commit', '-m', 'local'])
    const local = await head(behind.dir)

    const status = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(status.blocked).toBe(true)
    expect(status.decision).toBe('blocked')
    expect(status.reason).toContain('diverg')
    expect(await head(behind.dir)).toBe(local)
    expect(await readFile(path.join(behind.dir, 'local.txt'), 'utf8')).toBe('local\n')
    await expect(git(behind.dir, ['rev-parse', '--verify', deployedRef])).rejects.toThrow()
  })

  it('refuses an unexpected origin without printing a credential', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    await git(behind.dir, [
      'remote',
      'set-url',
      'origin',
      'https://x-access-token:ghp_supersecret@github.com/other/repo.git',
    ])

    const status = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))
    const text = formatCheckoutReport(status)

    expect(status.blocked).toBe(true)
    expect(status.origin).toBe('unexpected')
    expect(text).not.toContain('ghp_supersecret')
    expect(await head(behind.dir)).toBe(behind.sha)
  })

  it('accepts the website origin when the saved URL contains a credential', async () => {
    const checkout = await initCheckout()
    await git(checkout.dir, [
      'remote',
      'set-url',
      'origin',
      'https://x-access-token:ghp_supersecret@github.com/Mike-CX83/cx83_webapp.git',
    ])

    const status = await inspectRepositoryCheckout(
      options(checkout.dir, checkout.sha, path.join(checkout.dir, 'missing.bundle')),
    )

    expect(status.origin).toBe('expected')
    expect(status.decision).toBe('aligned')
    expect(formatCheckoutReport(status)).not.toContain('ghp_supersecret')
  })

  it('refuses a detached HEAD and the wrong branch', async () => {
    const detached = await initCheckout()
    const detachedAhead = await commitAhead(detached.dir)
    await git(detached.dir, ['checkout', '--detach'])
    const detachedStatus = await syncRepositoryCheckout(
      options(detached.dir, detachedAhead.sha, detachedAhead.bundle),
    )

    expect(detachedStatus.blocked).toBe(true)
    expect(detachedStatus.reason).toContain('detached HEAD')
    expect(await head(detached.dir)).toBe(detached.sha)

    const branched = await initCheckout()
    const branchedAhead = await commitAhead(branched.dir)
    await git(branched.dir, ['checkout', '-b', 'main'])
    const branchStatus = await syncRepositoryCheckout(
      options(branched.dir, branchedAhead.sha, branchedAhead.bundle),
    )

    expect(branchStatus.blocked).toBe(true)
    expect(branchStatus.reason).toContain('branch is main')
    expect(await head(branched.dir)).toBe(branched.sha)
  })

  it('refuses a requested commit that is not the deployed commit', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    const mismatch = await syncRepositoryCheckout({
      ...options(behind.dir, ahead.sha, ahead.bundle),
      expectedSha: 'b'.repeat(40),
    })

    expect(mismatch.blocked).toBe(true)
    expect(mismatch.reason).toContain('does not match the deployed commit')
    expect(await head(behind.dir)).toBe(behind.sha)

    const injected = path.join(behind.dir, 'pwned.txt')
    const evil = await syncRepositoryCheckout({
      ...options(behind.dir, ahead.sha, ahead.bundle),
      expectedSha: `${'a'.repeat(40)};touch ${injected}`,
    })

    expect(evil.blocked).toBe(true)
    expect(evil.reason).toContain('not a commit id')
    await expect(readFile(injected, 'utf8')).rejects.toThrow()
    expect(await head(behind.dir)).toBe(behind.sha)
  })

  it('refuses a bundle that does not contain the deployed commit', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    const status = await syncRepositoryCheckout(options(behind.dir, 'c'.repeat(40), ahead.bundle))

    expect(status.blocked).toBe(true)
    expect(status.reason).toContain('does not match the deployed commit')
    expect(await head(behind.dir)).toBe(behind.sha)
  })

  it('reports an unreadable bundle and leaves the checkout in place', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    const missing = await syncRepositoryCheckout(
      options(behind.dir, ahead.sha, path.join(behind.dir, 'missing.bundle')),
    )

    expect(missing.blocked).toBe(true)
    expect(missing.reason).toContain('could not be read')
    expect(await head(behind.dir)).toBe(behind.sha)

    await chmod(ahead.bundle, 0o000)

    try {
      const unreadable = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

      expect(unreadable.blocked).toBe(true)
      expect(unreadable.reason).toContain('could not be read')
      expect(await head(behind.dir)).toBe(behind.sha)
    } finally {
      await chmod(ahead.bundle, 0o644)
    }
  })

  it('does not run repository hooks and refuses commands outside the allowlist', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    const marker = path.join(behind.dir, 'hook-ran')
    const hook = path.join(behind.dir, '.git', 'hooks', 'post-merge')
    await mkdir(path.dirname(hook), { recursive: true })
    await writeFile(hook, `#!/bin/sh\ntouch '${marker}'\n`, { mode: 0o755 })
    await chmod(hook, 0o755)

    const status = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(status.decision).toBe('aligned')
    await expect(readFile(marker, 'utf8')).rejects.toThrow()

    const runner = createGitRunner(behind.dir, ahead.bundle)
    await expect(runner(['reset', '--hard', 'HEAD'])).rejects.toThrow(/Refused/)
    await expect(runner(['push', 'origin', 'staging-host'])).rejects.toThrow(/Refused/)
    await expect(runner(['clean', '-fd'])).rejects.toThrow(/Refused/)
    await expect(
      runner(['fetch', '--no-tags', '/tmp/other.bundle', `HEAD:${deployedRef}`]),
    ).rejects.toThrow(/Refused/)
  })

  it('reports a failed end check without resetting the checkout', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'cx83-rollback-'))
    directories.push(dir)
    await mkdir(path.join(dir, '.git'))
    const current = 'a'.repeat(40)
    const deployed = 'b'.repeat(40)
    const wrong = 'c'.repeat(40)
    const calls: string[][] = []
    let merged = false
    const runGit: GitRunner = async (args) => {
      calls.push(args)
      const target = args.at(-1)

      if (args[0] === 'rev-parse' && target === 'HEAD') {
        return { code: 0, stdout: `${merged ? wrong : current}\n`, stderr: '' }
      }

      if (
        args[0] === 'rev-parse' &&
        (target === `${deployed}^{commit}` || target === deployedRef)
      ) {
        return { code: 0, stdout: `${deployed}\n`, stderr: '' }
      }

      if (args[0] === 'symbolic-ref') return { code: 0, stdout: 'staging-host\n', stderr: '' }
      if (args[0] === 'remote') {
        return { code: 0, stdout: 'git@github.com:Mike-CX83/cx83_webapp.git\n', stderr: '' }
      }
      if (args[0] === 'status') return { code: 0, stdout: '', stderr: '' }
      if (args[0] === 'merge-base') return { code: 0, stdout: '', stderr: '' }
      if (args[0] === 'update-ref') return { code: 0, stdout: '', stderr: '' }

      if (args[0] === 'merge') {
        merged = true
        return { code: 0, stdout: '', stderr: '' }
      }

      throw new Error(`unexpected git ${args.join(' ')}`)
    }

    const status = await syncRepositoryCheckout({
      repoRoot: dir,
      bundlePath: path.join(dir, 'unused.bundle'),
      deployedSha: deployed,
      runGit,
    })

    expect(status.blocked).toBe(true)
    expect(status.decision).toBe('blocked')
    expect(status.reason).toContain('end commit did not match')
    expect(
      calls.some((args) => ['reset', 'push', 'clean', 'checkout'].includes(args[0] ?? '')),
    ).toBe(false)
  })

  it('does not start a second sync while one holds the checkout lock', async () => {
    const behind = await initCheckout()
    const ahead = await commitAhead(behind.dir)
    await mkdir(path.join(behind.dir, '.git', 'cx83-sync.lock'))

    const status = await syncRepositoryCheckout(options(behind.dir, ahead.sha, ahead.bundle))

    expect(status.blocked).toBe(true)
    expect(status.reason).toBe('sync already running')
    expect(await head(behind.dir)).toBe(behind.sha)
  })

  it('blocks production use when the repository root is not the staging checkout', () => {
    const env = process.env as { NODE_ENV?: string; CX83_REPO_ROOT?: string }
    const previousEnv = env.NODE_ENV
    const previousRoot = env.CX83_REPO_ROOT

    env.NODE_ENV = 'production'
    env.CX83_REPO_ROOT = '/tmp/not-the-staging-checkout'

    try {
      const resolved = resolveOwnerCheckoutOptions()

      expect(resolved.ok).toBe(false)
      if (!resolved.ok) {
        expect(resolved.report.blocked).toBe(true)
        expect(resolved.report.reason).toContain('staging checkout')
      }
    } finally {
      env.NODE_ENV = previousEnv
      env.CX83_REPO_ROOT = previousRoot
    }
  })

  it('keeps the sync tool off the visitor assistant and ignores extra arguments', async () => {
    const names = repositoryTools.map((tool) => tool.name)
    const chat = await readFile('src/app/(frontend)/api/chat/route.ts', 'utf8')
    const assistant = await readFile('src/ai/assistant.ts', 'utf8')
    const before = (await git(process.cwd(), ['rev-parse', 'HEAD'])).trim()
    const syncTool = repositoryTools.find((tool) => tool.name === 'syncRepositoryCheckout')

    expect(names).toEqual(expect.arrayContaining(['getRepositoryStatus', 'syncRepositoryCheckout']))
    expect(chat).not.toContain('getRepositoryStatus')
    expect(chat).not.toContain('syncRepositoryCheckout')
    expect(assistant).not.toContain('getRepositoryStatus')
    expect(assistant).not.toContain('syncRepositoryCheckout')
    expect(syncTool).toBeDefined()

    const result = await syncTool?.handler(
      { path: '/tmp', command: 'reset --hard', expectedSha: 'not-a-sha' },
      {} as never,
      {},
    )
    const text = JSON.stringify(result)

    expect(text).toContain('blocked=true')
    expect((await git(process.cwd(), ['rev-parse', 'HEAD'])).trim()).toBe(before)
  })
})

function reportFixture() {
  return {
    checkoutSha: 'a'.repeat(40),
    deployedSha: 'a'.repeat(40),
    branch: 'staging-host',
    dirty: false,
    syncNeeded: false,
    safeToSync: false,
    blocked: false,
    decision: 'aligned' as const,
    reason: 'checkout already matches the deployed commit',
    origin: 'expected' as const,
  }
}

function options(repoRoot: string, deployedSha: string, bundlePath: string): CheckoutOptions {
  return { repoRoot, deployedSha, bundlePath }
}

async function initCheckout(): Promise<{ dir: string; sha: string }> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cx83-checkout-'))
  directories.push(dir)
  await git(dir, ['init', '-b', 'staging-host'])
  await git(dir, ['config', 'user.email', 'test@example.com'])
  await git(dir, ['config', 'user.name', 'CX83 Test'])
  await writeFile(path.join(dir, 'README.md'), 'base\n')
  await git(dir, ['add', 'README.md'])
  await git(dir, ['commit', '-m', 'base'])
  await git(dir, ['remote', 'add', 'origin', 'git@github.com:Mike-CX83/cx83_webapp.git'])

  return { dir, sha: await head(dir) }
}

async function commitAhead(source: string): Promise<{ dir: string; sha: string; bundle: string }> {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'cx83-ahead-'))
  directories.push(parent)
  const dir = path.join(parent, 'repo')
  await git(parent, ['clone', source, dir])
  await git(dir, ['config', 'user.email', 'test@example.com'])
  await git(dir, ['config', 'user.name', 'CX83 Test'])
  await writeFile(path.join(dir, 'README.md'), 'deployed\n')
  await git(dir, ['add', 'README.md'])
  await git(dir, ['commit', '-m', 'deployed'])
  const bundle = path.join(parent, 'source.bundle')
  bundles.push(bundle)
  await git(dir, ['bundle', 'create', bundle, 'HEAD'])

  return { dir, sha: await head(dir), bundle }
}

async function head(directory: string): Promise<string> {
  return (await git(directory, ['rev-parse', 'HEAD'])).trim()
}

function git(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'CX83 Test',
        GIT_AUTHOR_EMAIL: 'test@example.com',
        GIT_COMMITTER_NAME: 'CX83 Test',
        GIT_COMMITTER_EMAIL: 'test@example.com',
      },
    })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(stdout)
      else reject(new Error(stderr || stdout || `git ${args.join(' ')} failed`))
    })
  })
}
