import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import Link from 'next/link'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
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
      <div className="cx83-interior-root">
        <InteriorHero title="Notes from CX83 Labs." />
        <p className="cx83-container py-20 text-muted-foreground">
          Published articles are temporarily unavailable. Explore Services or return later.
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
    <div className="cx83-interior-root pb-24">
      <PageClient />
      <InteriorHero title="Notes from CX83 Labs." />

      {posts.totalDocs === 0 ? <InteriorSection><p>No notes have been published yet.</p><Link className="cx83-interior-link" href="/services">Explore Services</Link></InteriorSection> : null}
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
