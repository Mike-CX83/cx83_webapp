import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHero, Section } from '@/components/site/Section'
import { softwareProducts } from '@/content/softwareCatalog'

import './software.css'

export const metadata: Metadata = {
  title: 'Software',
  description: 'Explore the connected website platform and Client Brand Studio in development at CX83 Labs.',
}

export default function SoftwareCatalogPage() {
  return (
    <div className="cx83-software">
      <PageHero eyebrow="Software from CX83 Labs" title="Tools you can make your own.">
        <p>We are building software that puts more control in the hands of the people who use it. Start with the idea. Ask for a change. Let connected tools do real work.</p>
      </PageHero>
      <Section>
        <div className="cx83-software-intro">
          <div>
            <p className="cx83-software-eyebrow">What we are building</p>
            <h2>Practical software, built for everyday people.</h2>
          </div>
          <p>These products are in active development. You can explore how they work today, but we are not offering customer downloads or checkout until the packages are ready.</p>
        </div>
        <div className="cx83-software-grid">
          {softwareProducts.map((product, index) => (
            <article className="cx83-software-card" key={product.slug}>
              <div className="cx83-software-card-top">
                <span className="cx83-software-number">0{index + 1} / CX83 SOFTWARE</span>
                <span className="cx83-software-status">{product.releaseStatus}</span>
              </div>
              <p className="cx83-software-card-label">{product.label}</p>
              <h3>{product.name}</h3>
              <p className="cx83-software-card-summary">{product.shortDescription}</p>
              <div className="cx83-software-card-actions">
                <Link className="cx83-software-detail-link" href={`/software/${product.slug}`}>
                  Explore the product <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section className="cx83-software-next">
        <div className="cx83-software-contact">
          <div>
            <p className="cx83-software-eyebrow">Need something now?</p>
            <h2>Tell us what you want to build.</h2>
            <p>We already help businesses create connected systems, workflows, and websites through scoped projects.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
      </Section>
    </div>
  )
}
