import type { Metadata } from 'next'
import Link from 'next/link'

import { ContentNotice } from '@/components/site/Section'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { loadServices } from '@/content/load'
import { servicePresentation } from '@/content/servicePresentation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Build a useful website or business tool, connect repetitive work, or make AI useful in everyday tasks with CX83 Labs.',
}

export default async function ServicesPage() {
  const services = await loadServices()
  const order = Object.keys(servicePresentation)
  const items = [...services.items].sort((a, b) => {
    const aIndex = order.indexOf(a.slug)
    const bIndex = order.indexOf(b.slug)
    return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex)
  })

  return (
    <div className="cx83-interior-root" data-testid="cx83-services-index">
      <InteriorHero id="services-title" title="Practical help for the way you work.">
        <p>Build something useful, connect the tools you already have, or make AI part of a repeatable process.</p>
      </InteriorHero>
      <InteriorSection>
        <ContentNotice source={services.source} />
        <div className="cx83-service-choices">
          {items.map((service) => {
            const presentation = servicePresentation[service.slug]
            return (
              <article className="cx83-service-choice" key={service.slug}>
                <h2>{service.name}</h2>
                <div className="cx83-service-choice-copy">
                  {presentation ? <p className="cx83-service-problem">{presentation.problem}</p> : null}
                  <p>{service.shortDescription}</p>
                </div>
                <Link className="cx83-interior-link" href={'/services/' + service.slug}>
                  {presentation?.linkLabel || 'Read ' + service.name}
                  <span aria-hidden="true">↗</span>
                </Link>
              </article>
            )
          })}
        </div>
        <div className="cx83-interior-closing">
          <div>
            <h2>Not sure where to start?</h2>
            <p>Tell us what is slow, disconnected, or difficult to manage. One useful improvement is enough to begin.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </InteriorSection>
    </div>
  )
}

