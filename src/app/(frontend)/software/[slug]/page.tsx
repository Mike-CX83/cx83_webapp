import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHero, Section } from '@/components/site/Section'
import { getSoftwareProduct, softwareProducts } from '@/content/softwareCatalog'

import '../software.css'

type Args = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return softwareProducts.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = getSoftwareProduct(slug)
  return {
    title: product?.name || 'CX83 Software',
    description: product?.shortDescription || 'Software from CX83 Labs.',
  }
}

export default async function SoftwareDetailPage({ params }: Args) {
  const { slug } = await params
  const product = getSoftwareProduct(slug)
  if (!product) notFound()

  return (
    <div className="cx83-software">
      <PageHero eyebrow="CX83 Software" title={product.name}>
        <p>{product.shortDescription}</p>
      </PageHero>
      <Section>
        <Link className="cx83-shared-text-link cx83-software-back" href="/software">← All CX83 software</Link>
        <div className="cx83-software-detail-intro">
          <div>
            <p className="cx83-software-eyebrow">{product.label}</p>
            <h2>Built to make the work easier.</h2>
            <p>{product.overview}</p>
          </div>
          <aside className="cx83-software-detail-status" aria-label="Software availability">
            <span className="cx83-software-status">{product.releaseStatus}</span>
            <h3>Customer release not available yet.</h3>
            <p>Development is continuing. We will share verified packages, requirements, and availability when the release is ready.</p>
            <p className="cx83-software-updated">Verified {product.lastVerified}</p>
            <Link href="/contact" className="cx83-software-detail-link">Ask about this software <span aria-hidden="true">↗</span></Link>
          </aside>
        </div>
      </Section>
      <Section className="cx83-software-features">
        <p className="cx83-software-eyebrow">What we are working toward</p>
        <h2>Useful features, not complexity for its own sake.</h2>
        <div className="cx83-software-features-grid">
          {product.benefits.map((benefit, index) => (
            <article key={benefit.title} className="cx83-software-benefit">
              <span className="cx83-software-number">0{index + 1}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section>
        <p className="cx83-software-eyebrow">Before you install</p>
        <h2 className="cx83-software-detail-heading">What to expect from a supported release.</h2>
        <dl className="cx83-software-facts">
          <div><dt>Who it is for</dt><dd>{product.audience}</dd></div>
          <div><dt>Setup and compatibility</dt><dd>{product.setup}</dd></div>
          <div><dt>Software and data ownership</dt><dd>{product.ownership}</dd></div>
          <div><dt>Guidance and support</dt><dd>{product.support}</dd></div>
        </dl>
        <div className="cx83-software-detail-final">
          <h2>Want to talk through your project?</h2>
          <p>We can discuss a business website or automation project without waiting for a packaged software release.</p>
          <Link className="cx83-action cx83-action-primary" href="/contact">Contact CX83 Labs <span aria-hidden="true">↗</span></Link>
        </div>
      </Section>
    </div>
  )
}
