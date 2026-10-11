import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ContentNotice } from '@/components/site/Section'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { loadCaseStudies, loadProjects } from '@/content/load'

import '../interior-run2.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Work',
  description: 'See verified first party website work at CX83 Labs and authorized published projects.',
}

export default async function WorkPage() {
  const [projects, caseStudies] = await Promise.all([loadProjects(), loadCaseStudies()])
  const source = projects.source === 'unavailable' || caseStudies.source === 'unavailable' ? 'unavailable' : 'payload'

  return (
    <div className="cx83-interior-root cx83-interior-run2 cx83-work" data-testid="cx83-work-page">
      <InteriorHero title="See what changed in the real world." id="work-title">
        <p>Here is a verified CX83 implementation. Customer work appears only when it has been approved for publication.</p>
      </InteriorHero>
      <InteriorSection>
        <ContentNotice source={source} />
        <article id="cx83-connected-website" aria-labelledby="cx83-work-feature-title" className="cx83-work-feature">
          <p className="cx83-work-kicker">First party implementation | CX83 website | October 2026</p>
          <div className="cx83-work-feature-grid">
            <div>
              <h2 id="cx83-work-feature-title">A conversation became a verified website change.</h2>
              <p>The CX83 website needed consistent visual identity and a Contact experience that remained usable. An authorized owner request guided real changes to the site, not an AI generated suggestion alone.</p>
              <ol className="cx83-work-steps">
                <li><strong>Request</strong><span>Keep the original brand identity and improve real site pages while retaining the inquiry form.</span></li>
                <li><strong>Implementation</strong><span>Connected owner tools changed the actual CX83 code. The resulting pages and user journeys were reviewed.</span></li>
                <li><strong>Verification</strong><span>Automated checks passed and the application was deployed to password protected staging, where the code and running release were checked.</span></li>
              </ol>
              <Link className="cx83-interior-link" href="/#showcase-title">
                Watch the recorded website demonstration <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <figure className="cx83-work-figure">
              <Image src="/showcase/cx83-website-showcase-poster-v2.jpg" width={1920} height={1080}
                alt="Authentic poster for the recorded CX83 website update demonstration" />
              <figcaption>The original recording shows an actual CX83 website change. The video is on Home and is not a customer installation demonstration.</figcaption>
            </figure>
          </div>
          <div className="cx83-work-result">
            <h3>What was actually demonstrated</h3>
            <p>On October 10, 2026, the Services and Contact refinement passed 77 integration tests, 111 browser tests, TypeScript, lint and the production build. The merged application was verified on protected staging. This is CX83 internal implementation evidence, not a client testimonial, revenue claim or finished customer installer.</p>
            <details className="cx83-work-evidence">
              <summary>Read the dated engineering record</summary>
              <p>Interior Run 1, October 10, 2026. Repository: Mike-CX83/cx83_webapp, PR 37. Validated application commit <code>f67a118cb9c3438d1b8877276d5506b42dab9210</code>. Protected staging application deployment workflow <code>38105293745</code>. Authenticated page review passed later that evening and is recorded in the repository handoff. A documentation only receipt is not the same as the application version.</p>
            </details>
          </div>
        </article>
        {projects.items.length ? (
          <section aria-labelledby="published-projects-title" className="cx83-work-published">
            <h2 id="published-projects-title">Published projects</h2>
            <div className="cx83-work-list">
              {projects.items.map((project) => (
                <article key={project.slug}>
                  <p className="cx83-work-kicker">{project.status || 'Project'}</p>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <Link className="cx83-interior-link" href={'/work/projects/' + project.slug}>
                    View the project <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
        {caseStudies.items.length ? (
          <section aria-labelledby="published-cases-title" className="cx83-work-published">
            <h2 id="published-cases-title">Published case studies</h2>
            <div className="cx83-work-list">
              {caseStudies.items.map((study) => (
                <article key={study.slug}>
                  <h3>{study.title}</h3>
                  <p>{study.summary}</p>
                  <Link className="cx83-interior-link" href={'/work/case-studies/' + study.slug}>
                    Read the case study <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
        {!projects.items.length && !caseStudies.items.length ? (
          <p className="cx83-work-publication-note">No customer projects or case studies have been approved for publication here yet.</p>
        ) : null}
        <div className="cx83-interior-closing">
          <div>
            <h2>Have a similar challenge?</h2>
            <p>We can discuss a scoped improvement to your website or connected workflow.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </InteriorSection>
    </div>
  )
}
