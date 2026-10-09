import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import { z } from 'zod'

const repoRoot = process.cwd()
const maxReadCharacters = 80_000
const maxOutputCharacters = 40_000

const checks = {
  typecheck: ['exec', 'tsc', '--noEmit'],
  lint: ['lint'],
  'test:int': ['test:int'],
} as const

type RepositoryCheck = keyof typeof checks

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

export async function runRepositoryCheck(check: RepositoryCheck): Promise<string> {
  const args = checks[check]

  if (!args) {
    throw new Error('Choose typecheck, lint, or test:int.')
  }

  const { code, output } = await runCommand('pnpm', [...args], 240_000)

  return [`check: ${check}`, `exit: ${code}`, output || '(no output)'].join('\n')
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
      'Replace one unique text span in a repository file. The old text must match exactly once. This writes the working tree on this Mac.',
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
      'Run an existing project check in this repository and return its exit code and output. Allowed checks are typecheck, lint, and test:int.',
    parameters: {
      check: z.enum(['typecheck', 'lint', 'test:int']).describe('Existing project check to run'),
    },
    handler: async (args) => {
      try {
        return textResult(await runRepositoryCheck(args.check as RepositoryCheck))
      } catch (error) {
        return toolError(error)
      }
    },
  },
]
