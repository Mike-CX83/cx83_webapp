import type { Metadata } from 'next'
import Link from 'next/link'

import { ConnectionExamples } from '@/components/site/ConnectionVisuals'
import { Cx83FAQ } from '@/components/site/Cx83FAQ'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { SystemsMap } from '@/components/site/SystemsMap'

import '../interior-run2.css'

export const metadata: Metadata = {
  title: 'How CX83 Works',
  description: 'Explore illustrative customer, marketing and operations connections, actual CX83 website evidence and customer control.',
}

export default function HowItWorksPage() {
  return (
    <div className="cx83-interior-root cx83-interior-run2 cx83-how" data-testid="cx83-how-page">
      <InteriorHero title="Your work. Connected tools. Clear control." id="how-title">
        <p>Choose a practical example, see where people approve the next step, and explore the real CX83 website implementation.</p>
      </InteriorHero>
      <InteriorSection>
        <section id="examples" className="cx83-connection-examples" aria-labelledby="how-examples-title">
          <h2 id="how-examples-title">Three ways connected tools could help.</h2>
          <p className="cx83-how-intro">These are illustrative workflows. CX83 chooses, authorizes and tests each connection for a particular project.</p>
          <nav className="cx83-how-guide" aria-label="Jump to a business example">
            <Link href="#customers">Customers <span aria-hidden="true">↗</span></Link>
            <Link href="#marketing">Marketing <span aria-hidden="true">↗</span></Link>
            <Link href="#operations">Operations <span aria-hidden="true">↗</span></Link>
          </nav>
          <ConnectionExamples />
        </section>
      </InteriorSection>
      <InteriorSection className="cx83-how-technical-section">
        <section id="system-map" aria-label="Technical map">
          <details className="cx83-technical-disclosure">
            <summary>Explore the technical details</summary>
            <div className="cx83-technical-disclosure-content">
              <h2>See the authorizations behind a real connection.</h2>
              <p className="cx83-how-intro">Choose a layer or workflow to inspect the access and review boundaries. Provider logos explain possibilities, not universal live integrations or endorsements.</p>
              <SystemsMap />
            </div>
          </details>
        </section>
      </InteriorSection>
      <InteriorSection>
        <section id="ownership" className="cx83-how-ownership cx83-interior-reading" aria-labelledby="how-control-title">
          <h2 id="how-control-title">A system you understand and can control.</h2>
          <p>We design around your accounts, data and approved permissions. Software rights depend on its actual license. Hosting, third party tools, AI usage and optional CX83 setup or managed support are separate decisions.</p>
          <p>Customer installation packages are still being tested. The questions below explain the current boundaries in more detail.</p>
          <Link className="cx83-interior-link" href="#questions">
            Review common ownership questions <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </InteriorSection>
      <InteriorSection className="cx83-how-proof-section">
        <section id="real-proof" aria-labelledby="how-proof-title" className="cx83-how-proof">
          <div>
            <p className="cx83-work-kicker">Real CX83 website example</p>
            <h2 id="how-proof-title">A real change to the CX83 website.</h2>
            <p>See how an owner request became an actual website update, with the results reviewed and verified through the existing release process.</p>
          </div>
          <Link className="cx83-interior-link" href="/work#cx83-connected-website">
            Explore the CX83 website example <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </InteriorSection>
      <InteriorSection>
        <div id="questions" className="cx83-how-faq">
          <Cx83FAQ />
        </div>
        <div className="cx83-interior-closing">
          <div>
            <h2>Start with one problem worth fixing.</h2>
            <p>Tell us what your team repeats, where information gets lost or what you want to control.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </InteriorSection>
    </div>
  )
}
