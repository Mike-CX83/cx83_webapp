import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { BrandStudioSpotlight } from '@/components/site/BrandStudioSpotlight'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { softwareProducts } from '@/content/softwareCatalog'

import '../interior-run2.css'

export const metadata: Metadata = {
  title: 'Software',
  description: 'Explore the Connected Website Platform and Client Brand Studio in development at CX83 Labs.',
}

export default function SoftwareCatalogPage() {
  return (
    <div className="cx83-interior-root cx83-software cx83-interior-run2" data-testid="cx83-software-index">
      <InteriorHero title="Software that puts you in control." id="software-title">
        <p>Explore two CX83 products in development. Scoped services are available to discuss now, while customer software packages are being prepared and tested.</p>
      </InteriorHero>
      <InteriorSection>
        <div className="cx83-software-grid">
          {softwareProducts.map((product) => (
            <article className="cx83-software-card" key={product.slug}>
              <figure className="cx83-software-card-visual">
                {product.slug === 'connected-websites' ? (
                  <Image src="/showcase/cx83-website-showcase-poster-v2.jpg" width={1920} height={1080}
                    alt="Poster from a recorded CX83 website change demonstration" />
                ) : (
                  <Image className="cx83-software-card-symbol" src="/brand/symbol-showcase.svg" width={160} height={160}
                    alt="CX83 brand symbol created with Client Brand Studio" />
                )}
                <figcaption>{product.slug === 'connected-websites'
                  ? 'Actual CX83 website demonstration'
                  : 'Original CX83 branding created with Client Brand Studio.'}</figcaption>
              </figure>
              <div className="cx83-software-card-copy">
                <span className="cx83-software-status">{product.releaseStatus}</span>
                <h2>{product.name}</h2>
                <p>{product.shortDescription}</p>
                <Link className="cx83-interior-link" href={'/software/' + product.slug}>
                  Explore {product.slug === 'connected-websites' ? 'Connected Websites' : 'Client Brand Studio'}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        <BrandStudioSpotlight variant="catalog" />
        <div className="cx83-interior-closing">
          <div>
            <h2>Have a project that cannot wait?</h2>
            <p>We can discuss a scoped website, AI setup or integration without promising a packaged software release.</p>
          </div>
          <Link className="cx83-action cx83-action-primary" href="/contact">
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </InteriorSection>
    </div>
  )
}
