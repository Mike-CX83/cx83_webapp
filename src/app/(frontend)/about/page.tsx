import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

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

// Presentation only: keep the CMS value and approved source untouched.
const emphasis = /(technology should make work easier|more time for what matters|accessible so people can become more independent|they understand their system, retain meaningful control, and have more time for what matters\.)/g

function emphasize(text: string) {
  return text.split(emphasis).map((part, index) =>
    index % 2 ? <strong key={index}>{part}</strong> : part,
  )
}

export default async function AboutPage() {
  const site = await loadSiteCopy()
  const paragraphs = site.copy.founder
    .split(/\n\s*\n| (?=CX83 started with Mike's experience,|Whether a customer wants a one time setup,)/)
    .filter(Boolean)

  return (
    <div className="cx83-interior-root cx83-about-refined">
      <InteriorHero id="about-title" title={approvedAboutTitle} />
      <InteriorSection>
        <div className="cx83-about-layout">
          <article aria-labelledby="about-title" className="cx83-about-story" data-testid="approved-about-story">
            {paragraphs.map((paragraph, index) => <p key={index}>{emphasize(paragraph)}</p>)}
          </article>
          <div className="cx83-about-brand" aria-hidden="true">
            <Image className="cx83-about-symbol" src="/brand/symbol-showcase.svg" alt="" width={288} height={288} />
          </div>
          <div className="cx83-about-story-action">
            <Link className="cx83-action cx83-action-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </InteriorSection>
    </div>
  )
}
