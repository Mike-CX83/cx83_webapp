import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { databaseConfigured } from './database'

let client: Promise<Payload | null> | null = null

export async function getPayloadClient(): Promise<Payload | null> {
  if (!databaseConfigured()) return null

  if (!client) {
    client = getPayload({ config: configPromise }).catch((error: unknown) => {
      console.error('Payload could not connect to PostgreSQL.', error)
      return null
    })
  }

  return client
}
