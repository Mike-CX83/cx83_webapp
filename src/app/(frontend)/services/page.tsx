import type { Metadata } from 'next'
import Link from 'next/link'

import { ContentNotice, PageHero, Section } from '@/components/site/Section'
import { loadServices } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Services from CX83 Labs.',
}

export default async function ServicesPage() {
  const services = await loadServices()

  return (
    <>
      <PageHero eyebrow="Services" title="Practical systems, built for a real operation.">
        <p>Websites, automation, and AI tools designed around the way your business works.</p>
      </PageHero>
      <Section>
        <ContentNotice source={services.source} />
        <div className="grid gap-4 lg:grid-cols-2">
          {services.items.map((service) => (
            <article className="cx83-shared-card flex flex-col" key={service.slug}>
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{service.shortDescription}</p>
              {service.capabilities.length ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {service.capabilities.map((item) => (
                    <li className="rounded-full border border-border px-3 py-1 text-xs" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold" href={`/services/${service.slug}`}>
                Read {service.name}
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
