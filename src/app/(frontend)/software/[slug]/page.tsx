import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHero, Section } from '@/components/site/Section'
import { getSoftwareProduct, softwareProducts } from '@/content/softwareCatalog'
import { BrandStudioSpotlight } from '@/components/site/BrandStudioSpotlight'

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

      {product.slug === 'client-brand-studio' ? (
        <Section className="cx83-run2-product-story">
          <p className="cx83-run2-eyebrow">Actual development stage</p>
          <h2 className="cx83-run2-section-title">A working draft engine, still awaiting release acceptance.</h2>
          <p className="cx83-run2-lead">Development build 0.8.4 produces draft materials from supplied artwork and a saved brief. Human visual approval, full Office compatibility and customer packaging still need acceptance.</p>
          <BrandStudioSpotlight />
        </Section>
      ) : (
        <Section className="cx83-run2-product-story">
          <p className="cx83-run2-eyebrow">Actual example: this CX83 website</p>
          <h2 className="cx83-run2-section-title">A change request became real, tested pages.</h2>
          <p className="cx83-run2-lead">This existing website uses connected owner tools. The October 9 update changed the actual brand presentation, public Cat assistant and About page, then passed checks before staging publication.</p>
          <div className="cx83-run2-verified-path">
            <div><span>01 / Request</span><h3>Describe the change</h3><p>Keep the original banner and improve the identity and visitor interface.</p></div>
            <div><span>02 / Verify</span><h3>Run the tests</h3><p>29 integration and 46 browser tests passed at the verified Run 1 gate.</p></div>
            <div><span>03 / Deploy</span><h3>Publish to staging</h3><p>Application commit cdae3eba passed the staging health and password gate.</p></div>
          </div>
          <Link className="cx83-run2-text-link" href="/how-it-works#real-proof">See the real site workflow <span aria-hidden="true">↗</span></Link>
          <p className="cx83-run2-caveat">This is first-party site evidence, not a released installer or one-click commercial setup.</p>
        </Section>
      )}
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
