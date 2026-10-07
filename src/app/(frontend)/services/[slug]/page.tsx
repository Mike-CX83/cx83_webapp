import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ContentNotice, PageHero, Section } from '@/components/site/Section'
import { loadServices } from '@/content/load'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const services = await loadServices()
  const service = services.items.find((item) => item.slug === slug)

  return { title: service?.name || 'Service', description: service?.shortDescription }
}

export default async function ServicePage({ params }: Args) {
  const { slug } = await params
  const services = await loadServices()
  const service = services.items.find((item) => item.slug === slug)
  if (!service) notFound()

  return (
    <>
      <PageHero eyebrow="Service" title={service.name}>
        <p>{service.shortDescription}</p>
      </PageHero>
      <Section>
        <ContentNotice source={services.source} />
        <p className="max-w-3xl leading-8 text-muted-foreground">{service.description}</p>
        {service.capabilities.length ? (
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {service.capabilities.map((item) => (
              <li className="rounded-2xl border border-border bg-card px-4 py-4" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          className="mt-8 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          href={service.callToActionUrl || '/contact'}
        >
          {service.callToActionLabel || 'Start a conversation'}
        </Link>
      </Section>
    </>
  )
}
