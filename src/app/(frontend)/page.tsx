import type { Metadata } from 'next'
import Image from 'next/image'

import { ContentNotice, PageHero, Section, TextLink } from '@/components/site/Section'
import { loadProjects, loadServices, loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CX83 Labs',
  description: 'CX83 Labs focuses on AI systems, automation, software, and business integration.',
}

export default async function HomePage() {
  const [site, services, projects] = await Promise.all([loadSiteCopy(), loadServices(), loadProjects()])

  return (
    <>
      <section aria-label="CX83 Labs banner" className="w-full bg-[#080E22]">
        <Image
          src="/brand/cx83-labs-hero.avif"
          alt="CX83 Labs illuminated logo in electric blue, silver, and violet"
          width={960}
          height={319}
          sizes="100vw"
          priority
          className="block h-auto w-full"
        />
      </section>
      <PageHero eyebrow="CX83 Labs" title="Systems for work that should not stay manual.">
        <p>{site.copy.tagline}</p>
      </PageHero>
      <Section>
        <ContentNotice source={site.source} />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">What CX83 Labs does</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{site.copy.overview}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Capabilities
            </h2>
            <ul className="mt-4 grid gap-3">
              {site.copy.capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section className="border-t border-border" id="services">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Services</h2>
          <TextLink href="/services">All services</TextLink>
        </div>
        <ContentNotice source={services.source} />
        <div className="grid gap-4 md:grid-cols-2">
          {services.items.slice(0, 4).map((service) => (
            <article className="rounded-2xl border border-border bg-card p-6" key={service.slug}>
              <h3 className="text-lg font-semibold">{service.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.shortDescription}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section className="border-t border-border" id="work">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Selected work</h2>
          <TextLink href="/work">Work</TextLink>
        </div>
        {projects.items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.items.slice(0, 2).map((project) => (
              <article className="rounded-2xl border border-border bg-card p-6" key={project.slug}>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.summary}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Published projects will appear here. None are published yet.</p>
        )}
      </Section>
      <Section className="border-t border-border">
        <div className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground md:px-10">
          <h2 className="text-3xl font-semibold tracking-tight">Start with the problem, not a tool list.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-primary-foreground/80">
            Describe what is slow, disconnected, or still being done by hand. CX83 Labs can help decide whether
            software, automation, or an assistant is the right next step.
          </p>
          <TextLink href="/contact">
            <span className="mt-6 inline-flex rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground">
              Contact CX83 Labs
            </span>
          </TextLink>
        </div>
      </Section>
    </>
  )
}
