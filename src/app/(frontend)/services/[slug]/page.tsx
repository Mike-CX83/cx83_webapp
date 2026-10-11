import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ContentNotice } from '@/components/site/Section'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { loadServices } from '@/content/load'
import { serviceInquiryHref, servicePresentation } from '@/content/servicePresentation'

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
  const presentation = servicePresentation[slug]

  return (
    <div className="cx83-interior-root" data-testid="cx83-service-detail">
      <InteriorHero
        backHref="/services"
        backLabel="Back to Services"
        id="service-title"
        title={service.name}
      >
        <p>{service.shortDescription}</p>
      </InteriorHero>
      <InteriorSection>
        <ContentNotice source={services.source} />
        <div className="cx83-service-overview">
          <section aria-labelledby="service-fit" className="cx83-interior-reading">
            <h2 id="service-fit">Who this helps</h2>
            {presentation ? <p className="cx83-service-fit">{presentation.fit}</p> : null}
            <p>{service.description}</p>
          </section>
          {service.capabilities.length ? (
            <section aria-labelledby="service-deliverables" className="cx83-service-deliverables">
              <h2 id="service-deliverables">What you can expect</h2>
              <ul>
                {service.capabilities.map((item, index) => (
                  <li key={item}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        {presentation ? (
          <section aria-labelledby="service-example" className="cx83-service-example">
            <div>
              <h2 id="service-example">A useful example</h2>
              <p>{presentation.example}</p>
              {presentation.exampleHref && presentation.exampleLabel ? (
                <Link className="cx83-interior-link" href={presentation.exampleHref}>
                  {presentation.exampleLabel} <span aria-hidden="true">↗</span>
                </Link>
              ) : null}
              {presentation.exampleSteps ? (
                <ol className="cx83-service-example-steps" aria-label="Illustrative AI process">
                  {presentation.exampleSteps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              ) : null}
            </div>
          </section>
        ) : null}
        <section aria-labelledby="service-scope" className="cx83-service-scope">
          <h2 id="service-scope">A clear scope and an understandable handoff</h2>
          {presentation ? <p>{presentation.scope}</p> : null}
          <p>
            Setup and implementation have an agreed scope. Hosting, AI usage, third party subscriptions
            and software licensing are separate where needed. Ongoing CX83 help is optional and agreed
            separately, so you can choose the support that fits.
          </p>
        </section>
        <div className="cx83-interior-closing">
          <div>
            <h2>{service.callToActionLabel || 'Start with one useful improvement.'}</h2>
            <p>Share the task or problem you have in mind. You do not need a technical plan.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href={serviceInquiryHref(slug, service.callToActionUrl)}>
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </InteriorSection>
    </div>
  )
}

