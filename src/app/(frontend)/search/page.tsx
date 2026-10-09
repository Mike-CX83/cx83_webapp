import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageHero } from '@/components/site/Section'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import { databaseConfigured } from '@/lib/database'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise

  if (!databaseConfigured()) {
    return (
      <div>
        <PageHero eyebrow="Search" title="Find something useful." />
        <p className="cx83-container py-20 text-muted-foreground">Search is available after PostgreSQL is connected.</p>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pb-24">
      <PageClient />
      <PageHero eyebrow="Search" title="Find something useful." />
      <div className="container my-12">
        <div className="max-w-[50rem] mx-auto"><Search /></div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search`,
  }
}
