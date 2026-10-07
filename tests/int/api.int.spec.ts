import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { databaseConfigured } from '@/lib/database'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload | undefined

describe('API', () => {
  beforeAll(async () => {
    if (!databaseConfigured()) return
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users when PostgreSQL is configured', async () => {
    if (!payload) {
      expect(databaseConfigured()).toBe(false)
      return
    }

    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
