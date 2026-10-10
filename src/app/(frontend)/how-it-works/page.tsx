import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHero, Section } from '@/components/site/Section'
import { SystemsMap } from '@/components/site/SystemsMap'
import { Cx83FAQ } from '@/components/site/Cx83FAQ'

export const metadata: Metadata = {
  title: 'How CX83 Works',
  description: 'Explore connected owner AI, public CAT, authorized tools, staging checks and customer-controlled software.',
}

export default function HowItWorksPage() {
  return (
    <div className="cx83-run2-page">
      <PageHero eyebrow="Inside the CX83 system" title="Your work. Connected tools. Clear control.">
        <p>From an everyday request to real software operations, with each access boundary and publishing step explained.</p>
      </PageHero>
      <Section className="cx83-run2-map-section" id="system-map">
        <p className="cx83-run2-eyebrow">Explore the connected ecosystem</p>
        <h2 className="cx83-run2-section-title">See how CX83 connects the tools behind your business.</h2>
        <p className="cx83-run2-lead">Select a tool or choose a workflow to explore. Every branch shows how a request becomes action, what it can access and whether that connection has actually been demonstrated.</p>
        <SystemsMap />
      </Section>
      <Section className="cx83-run2-ownership" id="ownership">
        <div className="cx83-run2-ownership-grid">
          <div>
            <p className="cx83-run2-eyebrow">What you own</p>
            <h2 className="cx83-run2-section-title">Software you can keep. Systems you can grow.</h2>
            <p>We are developing supported software that customers can operate on approved hosting and connect to their own supported AI. Keeping a licensed version is different from purchasing ongoing CX83 management.</p>
            <Link className="cx83-run2-text-link" href="/software">Explore software in development <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="cx83-run2-control-facts">
            <h3>Control and costs are separate decisions.</h3>
            <dl>
              <div><dt>Software and files</dt><dd>Actual ownership rights come from each approved release license.</dd></div>
              <div><dt>Hosting and data</dt><dd>Customer-controlled where the release supports it, with backups and operations planned.</dd></div>
              <div><dt>AI and third parties</dt><dd>Models, automation, email and other services may carry independent fees.</dd></div>
              <div><dt>Optional CX83 services</dt><dd>Setup, updates, support and managed operations may be separately scoped.</dd></div>
            </dl>
          </div>
        </div>
        <p className="cx83-run2-caveat">This is a product goal, not a released perpetual license, approved hosting matrix or promise of free third-party services. Customer installers are not available yet.</p>
      </Section>
      <Section className="cx83-run2-proof-record" id="real-proof">
        <p className="cx83-run2-eyebrow">Real first-party demonstration</p>
        <h2 className="cx83-run2-section-title">This site is the proof, not a mockup.</h2>
        <p className="cx83-run2-lead">On October 9, 2026, the actual CX83 website received source updates for its design, navigation and public CAT experience, then passed checks and deployed to protected staging.</p>
        <div className="cx83-run2-proof-facts">
          <div><span>01 / Requested</span><strong>Consistent CX83 identity and a functional public AI interface</strong></div>
          <div><span>02 / Verified</span><strong>29 integration tests and 46 browser tests passed</strong></div>
          <div><span>03 / Deployed</span><strong>Password-protected staging was verified; no public launch claimed</strong></div>
        </div>
        <p className="cx83-run2-caveat">Evidence: verified Run 1 staging workflow 38015054550, application commit <code>cdae3ebab225cbe2bb362a1109da1d439abb3421</code>. The underlying repository is private, so public readers are directed to working pages instead of inaccessible source links.</p>
        <div className="cx83-run2-proof-links">
          <Link className="cx83-run2-text-link" href="/about">Explore the updated About page <span aria-hidden="true">↗</span></Link>
          <Link className="cx83-run2-text-link" href="/software">Explore the software pages <span aria-hidden="true">↗</span></Link>
        </div>
      </Section>
      <Section className="cx83-run3-faq-section" id="questions">
        <Cx83FAQ />
      </Section>
      <Section className="cx83-run2-closing">
        <div>
          <p className="cx83-run2-eyebrow">Ready to connect your work?</p>
          <h2 className="cx83-run2-section-title">Start with a specific business problem.</h2>
          <p>We can identify what already works, which connections are worth adding and what you want to control.</p>
        </div>
        <Link className="cx83-action cx83-action-primary" href="/contact">Talk to CX83 <span aria-hidden="true">↗</span></Link>
      </Section>
    </div>
  )
}
