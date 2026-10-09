import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ContentNotice, Section } from '@/components/site/Section'
import { loadProjects, loadServices, loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CX83 Labs',
  description: 'AI Systems, Automation, and Business Integration. Connect your tools, simplify repetitive work, and build software around your business.',
}

const process = [
  {
    title: 'Understand the work',
    description: 'Start with the process, the people, and the point where things slow down. Decide what actually needs to change.',
  },
  {
    title: 'Connect or build',
    description: 'Use the tools that already fit. Connect them where possible, and build something custom when the problem calls for it.',
  },
  {
    title: 'Test and hand over',
    description: 'Check the complete workflow, document how it works, and make the next steps clear before expanding it.',
  },
]

export default async function HomePage() {
  const [site, services, projects] = await Promise.all([loadSiteCopy(), loadServices(), loadProjects()])

  return (
    <div className="cx83-home" data-testid="cx83-homepage">
      <section className="cx83-home-hero" aria-labelledby="home-title">
        <div className="cx83-home-banner" aria-label="CX83 Labs banner">
          <Image
            src="/brand/cx83-labs-hero.avif"
            alt="CX83 Labs illuminated logo in electric blue, silver, and violet"
            width={960}
            height={319}
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
            className="block h-auto w-full"
            data-testid="homepage-banner"
          />
        </div>
        <div className="cx83-container cx83-home-hero-copy">
          <div>
            <p className="cx83-home-eyebrow">{site.copy.tagline}</p>
            <h1 id="home-title">Systems for work that should not stay manual.</h1>
          </div>
          <div className="cx83-home-hero-intro">
            <p>{site.copy.overview}</p>
            <div className="cx83-home-actions">
              <Link className="cx83-action cx83-action-primary" href="/contact">
                Start a conversation <span aria-hidden="true">↗</span>
              </Link>
              <Link className="cx83-action cx83-action-quiet" href="/services">
                Explore services
              </Link>
            </div>
            <p className="cx83-home-note">Start with one useful improvement. Build from there.</p>
          </div>
        </div>
      </section>

      <Section id="services">
        <ContentNotice source={site.source} />
        <div className="cx83-home-section-heading">
          <div>
            <p className="cx83-home-kicker">01 / What we do</p>
            <h2>Less friction.<br />More useful systems.</h2>
          </div>
          <p>AI is one part of the answer. The real work is making your information, applications, and processes work together.</p>
        </div>
        <ContentNotice source={services.source} />
        {services.items.length ? (
          <div className="cx83-home-card-grid">
            {services.items.slice(0, 6).map((service, index) => (
              <article className="cx83-home-service-card" key={service.slug} data-testid="service-card">
                <span className="cx83-home-card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{service.name}</h3>
                <p>{service.shortDescription}</p>
                <Link className="cx83-home-text-link" href={`/services/${service.slug}`}>
                  Explore this service <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Describe the workflow you want to improve, and we can define the right starting point together.</p>
        )}
      </Section>

      <Section className="cx83-home-process" id="approach">
        <div className="cx83-home-section-heading">
          <div>
            <p className="cx83-home-kicker">02 / How we work</p>
            <h2>Start with the problem.<br />Keep the solution practical.</h2>
          </div>
          <p>A clear scope, a working system, and an understandable handoff. No need to rebuild your entire business to make progress.</p>
        </div>
        <ol className="cx83-home-process-grid">
          {process.map((step, index) => (
            <li key={step.title}>
              <span className="cx83-home-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {projects.items.length ? (
        <Section id="work">
          <div className="cx83-home-section-heading">
            <div>
              <p className="cx83-home-kicker">Inside the work</p>
              <h2>Systems taking shape.</h2>
            </div>
            <Link className="cx83-home-text-link" href="/work">View the work <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="cx83-home-card-grid">
            {projects.items.slice(0, 3).map((project) => (
              <article className="cx83-home-service-card" key={project.slug}>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <Link className="cx83-home-text-link" href="/work">Explore the project <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <Section id="start">
        <div className="cx83-home-contact">
          <div>
            <p className="cx83-home-eyebrow">Your next useful step</p>
            <h2>What could work better<br />in your business?</h2>
            <p>Tell me what is slow, disconnected, or still being done by hand. We can start there.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">
            Tell me about your project <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </Section>
    </div>
  )
}
