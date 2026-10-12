import { randomBytes, createHmac } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const label = 'Personal ChatGPT owner'
const envPath = path.resolve(process.cwd(), '.env')

const content = { find: true, create: true, update: true, delete: true }
const globals = { find: true, update: true }

async function main() {
  const envText = await readFile(envPath, 'utf8')
  const existingKey = readEnv(envText, 'PAYLOAD_MCP_API_KEY')
  const payload = await getPayload({ config })
  const owners = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    sort: 'createdAt',
  })
  const owner = owners.docs[0]

  if (!owner) {
    throw new Error('No Payload owner exists yet. Create the owner at /admin, then run this again.')
  }

  if (existingKey && (await keyMatchesOwner(payload, existingKey, owner.id))) {
    console.log('Owner MCP key already matches this account.')
    await payload.destroy()
    return
  }

  const apiKey = randomBytes(32).toString('hex')

  await payload.create({
    collection: 'payload-mcp-api-keys',
    overrideAccess: true,
    data: {
      user: owner.id,
      label,
      description:
        'Full owner access for personal ChatGPT. The key stays in the ignored local environment.',
      enableAPIKey: true,
      apiKey,
      pages: content,
      posts: content,
      media: content,
      services: content,
      projects: content,
      caseStudies: content,
      forms: content,
      formSubmissions: content,
      users: content,
      categories: content,
      header: globals,
      footer: globals,
      siteSettings: globals,
      assistantSettings: globals,
      'payload-mcp-tool': {
        readRepositoryFile: true,
        searchRepository: true,
        readDevelopmentErrors: true,
        applyRepositoryEdit: true,
        runRepositoryCheck: true,
      },
    },
  })

  await writeFile(envPath, upsertEnv(envText, 'PAYLOAD_MCP_API_KEY', apiKey), 'utf8')
  console.log('Owner MCP key created and stored in the ignored .env file.')
  await payload.destroy()
}

function readEnv(text: string, name: string): string | undefined {
  const line = text.split('\n').find((entry) => entry.startsWith(`${name}=`))

  return line?.slice(name.length + 1).trim() || undefined
}

function upsertEnv(text: string, name: string, value: string): string {
  const line = `${name}=${value}`
  const pattern = new RegExp(`^${name}=.*$`, 'm')

  if (pattern.test(text)) return text.replace(pattern, line)
  return `${text.replace(/\n?$/, '\n')}${line}\n`
}

async function keyMatchesOwner(
  payload: Awaited<ReturnType<typeof getPayload>>,
  apiKey: string,
  ownerId: number | string,
): Promise<boolean> {
  const apiKeyIndex = createHmac('sha256', payload.secret).update(apiKey).digest('hex')
  const found = await payload.find({
    collection: 'payload-mcp-api-keys',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      apiKeyIndex: {
        equals: apiKeyIndex,
      },
    },
  })
  const doc = found.docs[0] as { user?: number | string | { id?: number | string } } | undefined
  const user = doc?.user
  const userId = typeof user === 'object' && user ? user.id : user

  return userId === ownerId
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Could not prepare the owner MCP key.'
  console.error(message)
  process.exitCode = 1
})
