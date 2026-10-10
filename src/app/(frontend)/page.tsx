import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ContentNotice, Section } from '@/components/site/Section'
import { WebsiteDemoPlayer } from '@/components/site/WebsiteDemoPlayer'
import { WebsiteProofPanel } from '@/components/site/WebsiteProofPanel'
import { showcaseMediaReady } from '@/content/showcaseMedia'

import './cx83-showcase.css'
import { loadServices, loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CX83 Labs',
  description:
    'CX83 connects websites and business tools to supported AI, so real updates can start with a simple conversation.',
}

const process = [
  {
    title: 'Understand the work',
    description:
      'Start with the process, the people, and the point where things slow down. Decide what actually needs to change.',
  },
  {
    title: 'Connect or build',
    description:
      'Use the tools that already fit. Connect them where possible, and build something custom when the problem calls for it.',
  },
  {
    title: 'Test and hand over',
    description:
      'Check the complete workflow, document how it works, and make the next steps clear before expanding it.',
  },
]

export default async function HomePage() {
  const [site, services] = await Promise.all([loadSiteCopy(), loadServices()])
  const summaries = [
    { title: 'AI systems', slug: 'ai-setup-and-workflows' },
    { title: 'Automation and business integration', slug: 'automation-and-integrations' },
    { title: 'Software', slug: 'websites-and-business-tools' },
  ].map((group) => ({
    ...group,
    service: services.items.find((service) => service.slug === group.slug),
  }))

  return (
    <div className="cx83-home cx83-showcase-home" data-testid="cx83-homepage">
      <section className="cx83-home-hero" aria-labelledby="home-title">
        <div className="cx83-home-banner" aria-label="CX83 Labs banner">
          <Image
            src="/brand/cx83-labs-hero.avif"
            alt="CX83 Labs illuminated logo in electric blue, silver, and violet"
            width={960}
            height={319}
            sizes="(min-width: 768px) 720px, 100vw"
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
            </div>
            <p className="cx83-home-note">Start with one useful improvement. Build from there.</p>
          </div>
        </div>
      </section>

      <section className="cx83-showcase-hero" aria-labelledby="showcase-title">
        <div className="cx83-container cx83-showcase-hero-grid">
          <div className="cx83-showcase-intro">
            <p className="cx83-showcase-kicker">Real CX83 website demonstration</p>
            <h2 id="showcase-title">
              Your website. <span>Your AI.</span>{' '}
              Just ask.
            </h2>
            <p className="cx83-showcase-lead">
              See how a request made in ChatGPT becomes an actual change to the CX83 website, using
              approved connections, real checks, and a verified staging result.
            </p>
          </div>
          {showcaseMediaReady ? (
            <WebsiteDemoPlayer
              captions="/showcase/cx83-website-showcase-v2.en.vtt"
              poster="/showcase/cx83-website-showcase-poster-v2.jpg"
              source="/showcase/cx83-website-showcase-v2.mp4"
            >
              Requested through ChatGPT, changed in real software, then checked before publishing.
            </WebsiteDemoPlayer>
          ) : (
            <WebsiteProofPanel />
          )}
        </div>
      </section>

      <Section id="services">
        <ContentNotice source={site.source} />
        <div className="cx83-home-section-heading">
          <div>
            <p className="cx83-home-kicker">01 / What we do</p>
            <h2>
              Less friction.
              <br />
              More useful systems.
            </h2>
          </div>
          <p>
            AI is one part of the answer. The real work is making your information, applications,
            and processes work together.
          </p>
        </div>
        <ContentNotice source={services.source} />
        <div className="cx83-home-card-grid">
          {summaries.map(({ title, slug, service }, index) => (
            <article className="cx83-home-service-card" key={slug} data-testid="service-card">
              <span className="cx83-home-card-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{title}</h3>
              <p>
                {service?.shortDescription ||
                  services.items[index]?.shortDescription ||
                  'Describe the workflow you want to improve, and we can define the right starting point together.'}
              </p>
            </article>
          ))}
        </div>
        <Link className="cx83-home-text-link" href="/services">
          Explore services <span aria-hidden="true">↗</span>
        </Link>
      </Section>

      <Section className="cx83-home-process" id="approach">
        <div className="cx83-home-section-heading">
          <div>
            <p className="cx83-home-kicker">02 / How we work</p>
            <h2>
              Start with the problem.
              <br />
              Keep the solution practical.
            </h2>
          </div>
          <p>
            A clear scope, a working system, and an understandable handoff. No need to rebuild your
            entire business to make progress.
          </p>
        </div>
        <ol className="cx83-home-process-grid">
          {process.map((step, index) => (
            <li key={step.title}>
              <span className="cx83-home-step-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
        <Link className="cx83-home-text-link" href="/how-it-works">
          How it works <span aria-hidden="true">↗</span>
        </Link>
      </Section>

      <Section id="start">
        <div className="cx83-home-contact">
          <div>
            <p className="cx83-home-eyebrow">Your next useful step</p>
            <h2>
              What could work better
              <br />
              in your business?
            </h2>
            <p>
              Tell us what is slow, disconnected, or still being done by hand. We can start there.
            </p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </Section>
    </div>
  )
}
