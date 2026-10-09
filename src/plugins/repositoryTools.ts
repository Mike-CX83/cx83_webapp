import { spawn, type ChildProcess } from 'node:child_process'
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import { z } from 'zod'

import {
  formatCheckoutReport,
  inspectRepositoryCheckout,
  resolveOwnerCheckoutOptions,
  syncRepositoryCheckout,
} from '@/plugins/repositoryCheckout'

const repoRoot = process.env.CX83_REPO_ROOT
  ? path.resolve(process.env.CX83_REPO_ROOT)
  : process.cwd()
const checksDirectory = path.join(repoRoot, '.cx83-checks')
const maxReadCharacters = 80_000
const maxOutputCharacters = 40_000
const jobIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const checks = {
  typecheck: ['exec', 'tsc', '--noEmit'],
  lint: ['lint'],
  'test:int': ['test:int'],
} as const

type RepositoryCheck = keyof typeof checks

type CheckJob = {
  id: string
  check: RepositoryCheck
  status: 'running' | 'finished'
  startedAt: string
  finishedAt?: string
  exitCode: number | null
  output: string
  pid?: number
}

const secretPatterns = [
  /postgres(?:ql)?:\/\/\S+/gi,
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /Bearer\s+[A-Za-z0-9._~+/-]{8,}/gi,
  /\b(?:API_KEY|SECRET|PASSWORD|TOKEN)\b\s*[=:]\s*\S+/gi,
]

export function redactToolOutput(text: string): string {
  return secretPatterns.reduce((current, pattern) => current.replace(pattern, '[redacted]'), text)
}

export function resolveRepositoryFile(relativePath: string): string {
  const trimmed = relativePath.trim()

  if (!trimmed || path.isAbsolute(trimmed)) {
    throw new Error('Use a path relative to the repository root.')
  }

  const normalized = path.normalize(trimmed)
  const segments = normalized.split(path.sep).filter((segment) => segment && segment !== '.')

  if (
    segments.length === 0 ||
    segments.includes('..') ||
    segments.includes('node_modules') ||
    segments.includes('.git') ||
    segments.includes('.next')
  ) {
    throw new Error('That path is outside the repository or is not available to this tool.')
  }

  const base = segments[segments.length - 1] ?? ''

  if (
    base === '.env' ||
    base.startsWith('.env.') ||
    base.endsWith('.local') ||
    base.endsWith('.pem') ||
    base === 'credentials.json' ||
    base === 'mcp.json'
  ) {
    throw new Error('Credential files are not available to this tool.')
  }

  const absolute = path.resolve(repoRoot, ...segments)
  const relative = path.relative(repoRoot, absolute)

  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('That path is outside the repository.')
  }

  return absolute
}

function textResult(text: string) {
  return {
    content: [
      {
        type: 'text' as const,
        text: redactToolOutput(text).slice(0, maxOutputCharacters),
      },
    ],
  }
}

async function readRepositoryText(relativePath: string): Promise<string> {
  const absolute = resolveRepositoryFile(relativePath)
  const bytes = await readFile(absolute)

  if (bytes.includes(0)) {
    throw new Error('That file is binary. Read a text source file.')
  }

  return bytes.toString('utf8')
}

export async function readRepositorySource(relativePath: string): Promise<string> {
  const text = await readRepositoryText(relativePath)

  if (text.length > maxReadCharacters) {
    return `${text.slice(0, maxReadCharacters)}\n\n[truncated]`
  }

  return text
}

export async function applyRepositoryEdit(
  relativePath: string,
  oldText: string,
  newText: string,
): Promise<string> {
  if (!oldText) {
    throw new Error('The text to replace cannot be empty.')
  }

  const absolute = resolveRepositoryFile(relativePath)
  const current = await readRepositoryText(relativePath)
  const matches = current.split(oldText).length - 1

  if (matches !== 1) {
    throw new Error(`Expected one match in ${relativePath}, found ${matches}.`)
  }

  await writeFile(absolute, current.replace(oldText, newText), 'utf8')

  return `Updated ${relativePath}.`
}

export async function searchRepositorySource(pattern: string): Promise<string> {
  const query = pattern.trim()

  if (!query || query.length > 200) {
    throw new Error('Provide a search pattern of 1 to 200 characters.')
  }

  const { code, output } = await runCommand(
    'rg',
    [
      '--line-number',
      '--heading',
      '--max-count',
      '40',
      '--glob',
      '!node_modules/**',
      '--glob',
      '!.git/**',
      '--glob',
      '!.next/**',
      '--glob',
      '!.env*',
      '--glob',
      '!*.local',
      '--glob',
      '!pnpm-lock.yaml',
      query,
      '.',
    ],
    20_000,
  )

  if (code === 1) return 'No matches.'

  if (code !== 0) {
    throw new Error(output || `Search exited with code ${code}.`)
  }

  return output
}

export async function readDevelopmentErrors(): Promise<string> {
  const logPath = path.join(repoRoot, '.next', 'dev', 'logs', 'next-development.log')

  try {
    const text = await readFile(logPath, 'utf8')
    const lines = text.trim().split('\n').slice(-80)

    return lines.join('\n') || 'The development log is empty.'
  } catch {
    return 'The development log is not available yet.'
  }
}

function isRepositoryCheck(value: string): value is RepositoryCheck {
  return Object.prototype.hasOwnProperty.call(checks, value)
}

function jobPath(id: string): string {
  if (!jobIdPattern.test(id) || id.length > 80) {
    throw new Error('Unknown check id.')
  }

  const absolute = path.resolve(checksDirectory, `${id}.json`)
  const relative = path.relative(checksDirectory, absolute)

  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Unknown check id.')
  }

  return absolute
}

function formatJob(job: CheckJob, note?: string): string {
  const lines = [
    `check: ${job.check}`,
    `id: ${job.id}`,
    `status: ${job.status}`,
    job.exitCode == null ? 'exit: pending' : `exit: ${job.exitCode}`,
  ]

  if (note) lines.push(note)
  if (job.output) lines.push(job.output)

  return lines.join('\n')
}

async function writeJob(job: CheckJob): Promise<void> {
  await mkdir(checksDirectory, { recursive: true })
  const destination = jobPath(job.id)
  const temporary = `${destination}.${process.pid}.tmp`

  await writeFile(temporary, JSON.stringify(job), 'utf8')
  await rename(temporary, destination)
}

function pidAlive(pid: number | undefined): boolean {
  if (!pid) return false

  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function readJob(id: string): Promise<CheckJob> {
  const file = jobPath(id)
  let text: string

  try {
    text = await readFile(file, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('No repository check has that id.')
    }

    throw error
  }

  let job: CheckJob

  try {
    job = JSON.parse(text) as CheckJob
  } catch {
    throw new Error('That check result could not be read.')
  }

  if (job.status === 'running' && !pidAlive(job.pid)) {
    job = {
      ...job,
      status: 'finished',
      finishedAt: new Date().toISOString(),
      exitCode: job.exitCode ?? 1,
      output: job.output || 'The check process stopped before it recorded a result.',
    }
    await writeJob(job)
  }

  return job
}

async function findRunningCheck(check: RepositoryCheck): Promise<CheckJob | undefined> {
  let names: string[]

  try {
    names = await readdir(checksDirectory)
  } catch {
    return undefined
  }

  for (const name of names) {
    if (!name.endsWith('.json')) continue

    try {
      const job = await readJob(name.slice(0, -'.json'.length))

      if (job.check === check && job.status === 'running') return job
    } catch {
      continue
    }
  }

  return undefined
}

function recordCheckProcess(job: CheckJob, child: ChildProcess): void {
  let output = ''
  let settled = false

  const finish = (code: number) => {
    if (settled) return
    settled = true
    void writeJob({
      ...job,
      status: 'finished',
      finishedAt: new Date().toISOString(),
      exitCode: code,
      output: redactToolOutput(output).slice(0, maxOutputCharacters),
      pid: child.pid,
    })
  }

  child.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString()
  })
  child.stderr?.on('data', (chunk: Buffer) => {
    output += chunk.toString()
  })
  child.on('error', (error) => {
    output += error.message
    finish(127)
  })
  child.on('close', (code) => finish(code ?? 1))
  child.unref()
}

export async function startRepositoryCheck(check: string): Promise<string> {
  if (!isRepositoryCheck(check)) {
    throw new Error('Choose typecheck, lint, or test:int.')
  }

  const running = await findRunningCheck(check)

  if (running) {
    return formatJob(running, 'Already running. Call runRepositoryCheck again with this id.')
  }

  const job: CheckJob = {
    id: `${check.replace(':', '-')}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    check,
    status: 'running',
    startedAt: new Date().toISOString(),
    exitCode: null,
    output: '',
  }
  const child = spawn('pnpm', [...checks[check]], {
    cwd: repoRoot,
    env: {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, '--max-old-space-size=640']
        .filter(Boolean)
        .join(' '),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  job.pid = child.pid
  recordCheckProcess(job, child)
  await writeJob(job)

  return formatJob(
    job,
    'Started. Call runRepositoryCheck again with this id to retrieve the result.',
  )
}

export async function readRepositoryCheck(id: string): Promise<string> {
  return formatJob(await readJob(id.trim()))
}

function runCommand(
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<{ code: number; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    let settled = false

    const finish = (code: number) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ code, output: redactToolOutput(output).slice(0, maxOutputCharacters) })
    }

    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      finish(124)
    }, timeoutMs)

    child.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code) => finish(code ?? 1))
  })
}

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : 'The repository tool failed.'

  return textResult(message)
}

async function checkoutReport(action: 'status' | 'sync', expectedSha?: string) {
  const resolved = resolveOwnerCheckoutOptions(expectedSha)

  if (!resolved.ok) return formatCheckoutReport(resolved.report)

  const report =
    action === 'status'
      ? await inspectRepositoryCheckout(resolved.options)
      : await syncRepositoryCheckout(resolved.options)

  return formatCheckoutReport(report)
}

export const repositoryTools: NonNullable<NonNullable<MCPPluginConfig['mcp']>['tools']> = [
  {
    name: 'readRepositoryFile',
    description:
      'Read a text source file in this CX83 website repository. Use a repository-relative path. Credential files are refused.',
    parameters: {
      path: z.string().describe('Repository-relative path, such as src/plugins/index.ts'),
    },
    handler: async (args) => {
      try {
        const filePath = String(args.path ?? '')
        return textResult(await readRepositorySource(filePath))
      } catch (error) {
        return toolError(error)
      }
    },
  },
  {
    name: 'searchRepository',
    description:
      'Search this repository with ripgrep and return matching lines. Skips dependencies, build output, and credential files.',
    parameters: {
      pattern: z.string().describe('Text or regular expression to find'),
    },
    handler: async (args) => {
      try {
        return textResult(await searchRepositorySource(String(args.pattern ?? '')))
      } catch (error) {
        return toolError(error)
      }
    },
  },
  {
    name: 'readDevelopmentErrors',
    description:
      'Return the latest local Next.js development log lines so a code repair can start from the current error.',
    parameters: {},
    handler: async () => textResult(await readDevelopmentErrors()),
  },
  {
    name: 'applyRepositoryEdit',
    description:
      'Replace one unique text span in a repository file. The old text must match exactly once. This writes the git checkout on this server and does not change the running site until that change is committed and deployed.',
    parameters: {
      path: z.string().describe('Repository-relative path'),
      oldText: z.string().describe('Exact existing text to replace'),
      newText: z.string().describe('Replacement text'),
    },
    handler: async (args) => {
      try {
        return textResult(
          await applyRepositoryEdit(
            String(args.path ?? ''),
            String(args.oldText ?? ''),
            String(args.newText ?? ''),
          ),
        )
      } catch (error) {
        return toolError(error)
      }
    },
  },
  {
    name: 'runRepositoryCheck',
    description:
      'Start typecheck, lint, or test:int and return immediately with an id. Call again with that id to retrieve the exit code and output. The commands stay pnpm exec tsc --noEmit, pnpm lint, and pnpm test:int.',
    parameters: {
      check: z
        .enum(['typecheck', 'lint', 'test:int'])
        .optional()
        .describe('Existing project check to start'),
      id: z
        .string()
        .optional()
        .describe('Id from a previous runRepositoryCheck call. Returns that check result.'),
    },
    handler: async (args) => {
      try {
        const id = String(args.id ?? '').trim()

        if (id) return textResult(await readRepositoryCheck(id))

        return textResult(await startRepositoryCheck(String(args.check ?? '')))
      } catch (error) {
        return toolError(error)
      }
    },
  },
  {
    name: 'getRepositoryStatus',
    description:
      'Read the staging website checkout. Reports the checkout commit, the deployed commit, branch, whether the owner has uncommitted changes, whether a sync is needed, and whether a fast-forward is safe. This is read-only and does not print secrets, remote URLs, or credential files.',
    parameters: {},
    handler: async () => {
      try {
        return textResult(await checkoutReport('status'))
      } catch (error) {
        return toolError(error)
      }
    },
  },
  {
    name: 'syncRepositoryCheckout',
    description:
      'Fast-forward the staging website checkout to the deployed commit when that is safe. Refuses a dirty checkout, the wrong branch, an unexpected repository, a detached HEAD, diverged history, a missing deployment record, or any commit other than the recorded staging deployment. Does not reset, delete, push, or accept a path or shell command. Pass expectedSha only to confirm the deployed commit.',
    parameters: {
      expectedSha: z
        .string()
        .optional()
        .describe('Optional deployed commit id. It must match the recorded staging deployment.'),
    },
    handler: async (args) => {
      try {
        const expectedSha = typeof args.expectedSha === 'string' ? args.expectedSha : undefined

        return textResult(await checkoutReport('sync', expectedSha))
      } catch (error) {
        return toolError(error)
      }
    },
  },
]
