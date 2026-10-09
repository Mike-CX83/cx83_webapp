import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  applyRepositoryEdit,
  readRepositorySource,
  redactToolOutput,
  resolveRepositoryFile,
} from '@/plugins/repositoryTools'

describe('repository tools', () => {
  const disposablePath = path.join('tests', 'int', '.disposable-mcp-edit.txt')

  afterEach(async () => {
    await rm(path.resolve(process.cwd(), disposablePath), { force: true })
  })

  it('resolves a source file and refuses credentials and paths outside the repo', () => {
    expect(resolveRepositoryFile('src/plugins/index.ts')).toContain(
      `${path.sep}src${path.sep}plugins${path.sep}index.ts`,
    )
    expect(() => resolveRepositoryFile('.env')).toThrow(/Credential/)
    expect(() => resolveRepositoryFile('../outside.txt')).toThrow(/not available|outside/)
    expect(() => resolveRepositoryFile('node_modules/payload/package.json')).toThrow(/not available/)
  })

  it('redacts connection strings and bearer tokens from check output', () => {
    const redacted = redactToolOutput(
      'failed DATABASE_URL=postgresql://mike:secret@localhost:5432/cx83 Authorization: Bearer sk-live-secret',
    )

    expect(redacted).not.toContain('secret@localhost')
    expect(redacted).not.toContain('sk-live-secret')
    expect(redacted).toContain('[redacted]')
  })

  it('applies one unique edit and restores the file', async () => {
    const absolute = path.resolve(process.cwd(), disposablePath)
    await writeFile(absolute, 'marker: original\n', 'utf8')

    await expect(applyRepositoryEdit(disposablePath, 'original', 'changed')).resolves.toContain(
      disposablePath,
    )
    await expect(readRepositorySource(disposablePath)).resolves.toContain('marker: changed')
    await expect(applyRepositoryEdit(disposablePath, 'missing', 'changed')).rejects.toThrow(
      /found 0/,
    )
    await applyRepositoryEdit(disposablePath, 'changed', 'original')
  })

  it('does not follow a path that leaves the repository through a temporary directory', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'cx83-mcp-'))

    try {
      expect(() => resolveRepositoryFile(path.relative(process.cwd(), directory))).toThrow(
        /outside|not available/,
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})