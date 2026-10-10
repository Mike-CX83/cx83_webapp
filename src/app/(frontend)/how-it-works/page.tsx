import type { Metadata } from 'next'
import Link from 'next/link'

import { OwnershipSection } from '@/components/site/OwnershipSection'
import { PageHero, Section } from '@/components/site/Section'
import { SystemMap } from '@/components/site/SystemMap'

export const metadata: Metadata = {
  title: 'How CX83 Works',
  description: 'Understand connected owner AI, CAT public assistance, controlled software changes and CX83 software ownership goals.',
}

export default function HowItWorksPage() {
  return (
    <div className="cx83-how-it-works">
      <PageHero eyebrow="Inside Catalyst X83" title="Real software changes, with the right controls.">
        <p>See how a business request can travel from a conversation to actual website tools, checks and a reviewed result. Visitors get a separate assistant with public access only.</p>
      </PageHero>
      <Section className="cx83-systems-spotlight">
        <SystemMap />
      </Section>
      <Section className="cx83-ownership-section">
        <OwnershipSection />
      </Section>
      <Section className="cx83-how-evidence-section">
        <div className="cx83-how-evidence">
          <p className="cx83-run2-kicker">Built and checked on this website</p>
          <h2>An actual CX83 implementation, not a stock animation.</h2>
          <p>The CX83 Run 1 website update brought the real brand, accessible navigation, founder story and CAT into one connected application. Its protected staging deployment was verified on October 9, 2026. Automated checks covered 29 integration tests and 46 browser tests, including the original homepage banner.</p>
          <div className="cx83-how-evidence-links">
            <Link className="cx83-run2-link" href="/about">Read the published founder story <span aria-hidden="true">↗</span></Link>
            <Link className="cx83-run2-link" href="/software">Explore the software in development <span aria-hidden="true">↗</span></Link>
          </div>
          <p className="cx83-how-evidence-note">The current public website is a first-party demonstration. The separately packaged customer installer, customer license and full supported hosting matrix are not yet released.</p>
        </div>
      </Section>
      <Section>
        <div className="cx83-home-contact">
          <div>
            <p className="cx83-home-eyebrow">Start with what matters</p>
            <h2>What would you like your systems to do?</h2>
            <p>Tell us about the workflow, your existing tools and where the friction is. We can discuss a scoped service while packaged products are in development.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">Contact CX83 Labs <span aria-hidden="true">↗</span></Link>
        </div>
      </Section>
    </div>
  )
}
