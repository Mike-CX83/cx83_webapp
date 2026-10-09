import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageHero } from '@/components/site/Section'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { databaseConfigured } from '@/lib/database'

export const dynamic = 'force-dynamic'

export default async function Page() {
  if (!databaseConfigured()) {
    return (
      <div>
        <PageHero eyebrow="Notes" title="Notes from CX83 Labs." />
        <p className="cx83-container py-20 text-muted-foreground">
          Articles will appear here after PostgreSQL is connected and posts are published.
        </p>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pb-24">
      <PageClient />
      <PageHero eyebrow="Notes" title="Notes from CX83 Labs." />

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Notes`,
  }
}
