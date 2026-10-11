import type { Metadata } from 'next'
import Link from 'next/link'

import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { loadSiteCopy } from '@/content/load'
import { approvedAboutTitle } from '@/content/aboutStory'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './about.css'

export const dynamic = 'force-dynamic'

const description = 'How nursing, hospice care and software engineering shaped CX83 Labs and its commitment to practical technology and customer independence.'

export const metadata: Metadata = {
  title: { absolute: approvedAboutTitle },
  description,
  openGraph: mergeOpenGraph({ title: approvedAboutTitle, description, url: '/about' }),
}

export default async function AboutPage() {
  const site = await loadSiteCopy()
  const paragraphs = site.copy.founder.split(/\n\s*\n/).filter(Boolean)

  return (
    <div className="cx83-interior-root cx83-about-refined">
      <InteriorHero id="about-title" title={approvedAboutTitle} />
      <InteriorSection>
        <article aria-labelledby="about-title" className="cx83-about-story" data-testid="approved-about-story">
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </article>
        <div className="cx83-about-story-action">
          <Link className="cx83-action cx83-action-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
      </InteriorSection>
    </div>
  )
}
