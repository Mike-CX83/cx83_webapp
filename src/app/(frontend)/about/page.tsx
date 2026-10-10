import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ContentNotice, PageHero, Section } from '@/components/site/Section'
import { loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Catalyst X83',
  description: 'Meet the founder of CX83 Labs and learn why Catalyst X83 connects business operations, software and useful AI.',
}

export default async function AboutPage() {
  const site = await loadSiteCopy()

  return (
    <div className="cx83-about">
      <PageHero eyebrow="Catalyst X83 / Our story" title="Built from real work. Designed for what comes next.">
        <p>We build intelligent business systems you can own, understand and improve.</p>
      </PageHero>
      <Section>
        <ContentNotice source={site.source} />
        <div className="cx83-about-intro">
          <div>
            <p className="cx83-about-eyebrow">Why Catalyst X83 exists</p>
            <h2>Software should serve the people doing the work.</h2>
            <p className="cx83-about-lead">{site.copy.founder}</p>
            <Link href="/services" className="cx83-shared-text-link">Explore what we do <span aria-hidden="true">↗</span></Link>
          </div>
          <aside className="cx83-about-brand" aria-label="Original CX83 Labs brand artwork">
            <Image src="/brand/symbol-showcase.svg" width={112} height={112} alt="CX83 Labs geometric frame symbol" />
            <p className="cx83-about-brand-overline">Catalyst X83</p>
            <p className="cx83-about-brand-statement">Built to connect the people, tools and systems that make a business work.</p>
            <p className="cx83-about-brand-note">The original CX83 identity, not a stock illustration or replacement logo.</p>
          </aside>
        </div>
      </Section>
      <Section className="cx83-about-principles">
        <div className="cx83-about-section-heading">
          <p className="cx83-about-eyebrow">What guides the work</p>
          <h2>Useful technology. Clear ownership. Thoughtful handoffs.</h2>
        </div>
        <div className="cx83-about-principles-grid">
          <article className="cx83-shared-card">
            <span className="cx83-about-index">01 / Our mission</span>
            <h3>Make the work more capable.</h3>
            <p>{site.copy.mission}</p>
          </article>
          <article className="cx83-shared-card">
            <span className="cx83-about-index">02 / Our approach</span>
            <h3>Start with how things really work.</h3>
            <p>{site.copy.approach}</p>
          </article>
        </div>
      </Section>
      <Section>
        <div className="cx83-about-origin">
          <div>
            <p className="cx83-about-eyebrow">The name behind CX83</p>
            <h2>Catalyst means meaningful change.</h2>
          </div>
          <div>
            <p>Catalyst X83 brings together practical experience, software engineering and connected AI. The X is where people, applications, information and real work meet.</p>
            <p>Our goal is to help businesses keep control of their systems, not add a new dependency every time something needs to improve. Software releases and hosting options are qualified separately as they become available.</p>
          </div>
        </div>
      </Section>
      <Section className="cx83-about-capabilities">
        <p className="cx83-about-eyebrow">Where we can help</p>
        <h2>Build what you need. Connect what you have.</h2>
        <ul className="cx83-about-capability-grid">
          {site.copy.capabilities.map((capability) => (
            <li className="cx83-shared-card" key={capability}>{capability}</li>
          ))}
        </ul>
        <div className="cx83-about-cta">
          <div>
            <h2>Have a workflow that should work better?</h2>
            <p>Tell us what you are trying to accomplish. We can start with the problem and find the right scope.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
      </Section>
    </div>
  )
}
