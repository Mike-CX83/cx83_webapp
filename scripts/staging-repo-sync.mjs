// Synchronize only the clean, dedicated staging tool checkout with the deployed build.
// This runs before the web server starts. Any uncertainty leaves the checkout untouched.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = '/repo'
const bundle = '/app/.cx83-staging-source.bundle'
const expected = process.env.CX83_STAGING_SOURCE_SHA || ''
const gitEnv = {
  ...process.env,
  GIT_CONFIG_COUNT: '1',
  GIT_CONFIG_KEY_0: 'safe.directory',
  GIT_CONFIG_VALUE_0: root,
  GIT_TERMINAL_PROMPT: '0',
}
const say = (message) => process.stdout.write('[cx83-checkout-sync] ' + message + '\n')

function git(...args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8', timeout: 20_000, env: gitEnv, maxBuffer: 1024 * 1024,
  })
  return { ok: result.status === 0 && !result.error, output: String(result.stdout || '').trim() }
}

try {
  if (process.env.NODE_ENV !== 'production' || process.env.CX83_REPO_ROOT !== root) {
    say('skipped: not the dedicated staging deployment')
  } else if (!/^[0-9a-f]{40}$/.test(expected) || !existsSync(bundle)) {
    say('skipped: no verified source bundle or deployment commit')
  } else if (!existsSync(path.join(root, '.git'))) {
    say('skipped: repository checkout is missing')
  } else {
    const branch = git('symbolic-ref', '--quiet', '--short', 'HEAD')
    const original = git('rev-parse', 'HEAD')
    const origin = git('remote', 'get-url', 'origin')
    const status = git('status', '--porcelain', '--untracked-files=normal', '--', '.', ':(exclude).cx83-checks')
    const expectedOrigin = /(?:github\.com[:/])Mike-CX83\/cx83_webapp(?:\.git)?$/

    if (!branch.ok || branch.output !== 'staging-host') {
      say('skipped: checkout is not on staging-host')
    } else if (!original.ok || !/^[0-9a-f]{40}$/.test(original.output)) {
      say('skipped: current checkout commit is unknown')
    } else if (!origin.ok || !expectedOrigin.test(origin.output)) {
      say('skipped: checkout origin does not match CX83 website')
    } else if (!status.ok || status.output !== '') {
      say('skipped: repository has pending changes; they are preserved')
    } else if (original.output === expected) {
      say('aligned: ' + expected)
    } else if (!git('bundle', 'verify', bundle).ok) {
      say('skipped: bundled source could not be verified')
    } else if (!git('fetch', '--no-tags', bundle, 'HEAD').ok) {
      say('skipped: bundled commit could not be imported')
    } else if (!git('cat-file', '-e', expected + '^{commit}').ok) {
      say('skipped: expected deployed commit was not found')
    } else if (!git('merge-base', '--is-ancestor', original.output, expected).ok) {
      say('skipped: checkout history diverges; nothing was replaced')
    } else if (!git('merge', '--ff-only', expected).ok) {
      say('skipped: safe fast-forward could not complete; inspect checkout')
    } else if (git('rev-parse', 'HEAD').output === expected) {
      say('aligned: ' + expected)
    } else {
      say('skipped: post-update commit verification failed')
    }
  }
} catch {
  // Do not take down the site to reconcile the separate code-tools checkout.
  say('skipped: unexpected checkout condition; inspect before retrying')
}
