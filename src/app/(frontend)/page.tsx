import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ContentNotice, Section } from '@/components/site/Section'
import { WebsiteDemoPlayer } from '@/components/site/WebsiteDemoPlayer'

import './cx83-showcase.css'
import { loadProjects, loadServices, loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CX83 Labs',
  description: 'CX83 connects websites and business tools to supported AI, so real updates can start with a simple conversation.',
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
    <div className="cx83-home cx83-showcase-home" data-testid="cx83-homepage">
      <section className="cx83-showcase-hero" aria-labelledby="home-title">
        <div className="cx83-container cx83-showcase-hero-grid">
          <div className="cx83-showcase-intro">
            <div className="cx83-showcase-identity">
              <Image
                alt="CX83 Labs illuminated original brand banner"
                className="block h-auto w-full"
                data-testid="homepage-banner"
                height={319}
                priority
                sizes="(min-width: 1024px) 440px, 85vw"
                src="/brand/cx83-labs-hero.avif"
                width={960}
              />
            </div>
            <p className="cx83-showcase-kicker">{site.copy.tagline}</p>
            <h1 id="home-title">
              Your website.<br />
              <span>Your AI.</span><br />
              Just ask.
            </h1>
            <p className="cx83-showcase-lead">
              CX83 connects your website to the AI tools you already use. Describe a change in everyday language,
              and the connected system can make real updates for you to review and publish.
            </p>
            <div className="cx83-showcase-actions">
              <a className="cx83-action cx83-action-primary" href="#website-demo">
                Watch a real website change <span aria-hidden="true">↘</span>
              </a>
              <Link className="cx83-action cx83-action-quiet" href="/contact">
                Start a conversation
              </Link>
            </div>
            <Link className="cx83-showcase-subnav" href="/services">Explore services <span aria-hidden="true">&nbsp;↗</span></Link>
            <p className="cx83-showcase-status">
              A real website, connected AI, and ordinary publishing controls. No imaginary one-click promises.
            </p>
          </div>
          <WebsiteDemoPlayer
            captions="/showcase/cx83-website-showcase-v2.en.vtt"
            poster="/showcase/cx83-website-showcase-poster-v2.jpg"
            source="/showcase/cx83-website-showcase-v2.mp4"
          >
            A real request, real website changes, and the resulting page.
          </WebsiteDemoPlayer>
        </div>
      </section>

      <Section className="cx83-showcase-proof-strip" id="how-it-works">
        <p className="cx83-home-kicker">How the website changes</p>
        <h2 className="cx83-showcase-proof-title">Describe it. Check it. Make it live.</h2>
        <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
          A conversation can lead to an actual website update, not just instructions about what to do next.
          The connected tools still use your access permissions and publishing process.
        </p>
        <ol className="cx83-showcase-proof-list">
          <li>
            <span>01 / Connect</span>
            <h3>Use the AI you already know.</h3>
            <p>Connect a supported AI platform to your website with the appropriate owner permissions.</p>
          </li>
          <li>
            <span>02 / Request</span>
            <h3>Ask for the change.</h3>
            <p>Tell your AI what should look or work differently. It can work on the actual site, not just suggest code.</p>
          </li>
          <li>
            <span>03 / Review</span>
            <h3>Test, then publish.</h3>
            <p>Check the change and publish through the workflow configured for your website.</p>
          </li>
        </ol>
      </Section>

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

      <Section className="cx83-showcase-roles" id="ai-roles">
        <p className="cx83-home-kicker">Two kinds of help, different permissions</p>
        <h2 className="cx83-showcase-proof-title">Your AI runs the tools.<br />Your customers get answers.</h2>
        <div className="cx83-showcase-role-grid">
          <article className="cx83-showcase-role-card">
            <p className="cx83-home-kicker">For your team</p>
            <h3>An AI connected to your website.</h3>
            <p>
              With authorized access, your AI can work on site content and code, run checks, and prepare real updates.
              You control the tools and publishing permissions it receives.
            </p>
          </article>
          <article className="cx83-showcase-role-card">
            <p className="cx83-home-kicker">For your visitors</p>
            <h3>An AI that helps your customers.</h3>
            <p>
              A separate customer-facing assistant can explain your services and help visitors find the right next step.
              It does not receive the website owner's editing permissions.
            </p>
          </article>
        </div>
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
