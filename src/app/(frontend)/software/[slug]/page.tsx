import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BrandStudioSpotlight } from '@/components/site/BrandStudioSpotlight'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { getSoftwareProduct, softwareProducts } from '@/content/softwareCatalog'
import { inquiryContextHref } from '@/forms/inquiryContext'

import '../../interior-run2.css'

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
  const connected = product.slug === 'connected-websites'

  return (
    <div className="cx83-interior-root cx83-interior-run2 cx83-software" data-testid="cx83-software-detail">
      <InteriorHero
        title={product.name}
        id="software-product-title"
        backHref="/software"
        backLabel="Back to Software"
      >
        <p>{product.shortDescription}</p>
      </InteriorHero>
      <InteriorSection>
        <p className="cx83-product-availability">
          <strong>{product.releaseStatus}.</strong> The customer installation package is not released. We can discuss a scoped project today.
        </p>
        {connected ? (
          <>
            <div className="cx83-product-opening">
              <div className="cx83-interior-reading">
                <h2>Ask for a real change through your connected AI.</h2>
                <p>With an authorized owner connection, a request can become an actual website update. The owner reviews the proposed change, and the configured checks and approvals govern publication.</p>
                <ol className="cx83-product-steps">
                  <li><strong>Describe</strong><span>Explain what needs to change in your own words.</span></li>
                  <li><strong>Review</strong><span>Inspect the update and its tests before approval.</span></li>
                  <li><strong>Publish</strong><span>Use the configured release workflow when the result is ready.</span></li>
                </ol>
              </div>
              <figure className="cx83-product-proof-visual">
                <Image src="/showcase/cx83-website-showcase-poster-v2.jpg" width={1920} height={1080}
                  alt="Poster frame from the recorded CX83 website change walkthrough" />
                <figcaption>Recorded first party demonstration on this website. It is not a customer installer preview.</figcaption>
                <Link className="cx83-interior-link" href="/#showcase-title">
                  Watch the real website demonstration <span aria-hidden="true">↗</span>
                </Link>
              </figure>
            </div>
            <div className="cx83-product-evidence-link">
              <h2>Demonstrated here, not yet packaged for customers.</h2>
              <p>Changes to this CX83 website have been reviewed, tested and deployed on protected staging. Customer hosting, installation and supported AI connections still require release qualification.</p>
              <Link className="cx83-interior-link" href="/work#cx83-connected-website">
                See the dated CX83 implementation record <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="cx83-interior-reading cx83-product-studio-intro">
              <h2>From existing artwork to coordinated drafts.</h2>
              <p>Studio uses a saved direction and authorized brand files to produce draft design materials for review. It does not replace the client&#39;s identity or publish files without human acceptance.</p>
            </div>
            <BrandStudioSpotlight variant="detail" />
            <section className="cx83-product-evidence-link" id="studio-review" aria-labelledby="studio-review-title">
              <h2 id="studio-review-title">Draft output still needs acceptance.</h2>
              <p>Visual quality, file compatibility, supported installation and customer packaging are still being evaluated. No approved customer output or retail release is presented here. The illustration above uses original CX83 source artwork only.</p>
            </section>
          </>
        )}
      </InteriorSection>
      <InteriorSection className="cx83-product-practical-section">
        <h2>Fit, setup and meaningful control.</h2>
        <dl className="cx83-product-facts">
          <div><dt>Who it helps</dt><dd>{product.audience}</dd></div>
          <div><dt>Setup and compatibility</dt><dd>{product.setup}</dd></div>
          <div><dt>Software and data</dt><dd>{product.ownership}</dd></div>
          <div><dt>Optional help</dt><dd>{product.support} Hosting, AI usage, third party fees and optional CX83 services are distinct from software licensing.</dd></div>
        </dl>
        <div className="cx83-interior-closing">
          <div>
            <h2>Want to discuss this product?</h2>
            <p>Tell us what you want to build or improve. We will distinguish what is demonstrated from what is still being prepared.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href={inquiryContextHref(product.slug)}>
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </InteriorSection>
    </div>
  )
}
