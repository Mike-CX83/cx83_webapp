import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import Link from 'next/link'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import { databaseConfigured } from '@/lib/database'

type Args = {
  searchParams: Promise<{
    q?: string | string[]
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q } = await searchParamsPromise
  const query = typeof q === 'string' ? q.slice(0, 200).trim() : ''

  if (!databaseConfigured()) {
    return (
      <div className="cx83-interior-root">
        <InteriorHero title="Search notes."><p>Search covers published articles, not every website page.</p></InteriorHero>
        <InteriorSection><p>Article search is temporarily unavailable.</p><Link className="cx83-interior-link" href="/services">Explore Services</Link></InteriorSection>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    overrideAccess: false,
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
    <div className="cx83-interior-root pb-24">
      <PageClient />
      <InteriorHero title="Search notes."><p>Search covers published articles, not every website page.</p></InteriorHero>
      <div className="container my-12">
        <div className="max-w-[50rem] mx-auto"><Search initialQuery={query} /></div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="cx83-container"><p>No published notes match this search.</p><Link className="cx83-interior-link" href="/services">Explore Services</Link></div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search notes',
    description: 'Search published CX83 Labs articles. Services and software are available through the main navigation.',
  }
}
