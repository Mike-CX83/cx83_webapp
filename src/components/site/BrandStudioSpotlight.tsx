import Image from 'next/image'
import Link from 'next/link'

type Props = { variant: 'catalog' | 'detail' }

/** The owner confirms that this original CX83 branding was created through Client Brand Studio. The customer product remains in development. */
export function BrandStudioSpotlight({ variant }: Props) {
  if (variant === 'catalog') {
    return (
      <aside className="cx83-studio-spotlight cx83-studio-spotlight-compact" data-testid="brand-studio-spotlight">
        <Image src="/brand/symbol-showcase.svg" width={80} height={80} alt="CX83 brand symbol created with Client Brand Studio" />
        <div>
          <h3>Build a brand that feels like yours.</h3>
          <p>This is authentic CX83 branding created through our own Client Brand Studio. Start with existing artwork or your own creative direction, then develop consistent branded materials that reflect your business.</p>
        </div>
        <Link className="cx83-interior-link" href="/software/client-brand-studio">
          See the Studio details <span aria-hidden="true">↗</span>
        </Link>
      </aside>
    )
  }

  return (
    <section aria-labelledby="studio-spotlight-title" className="cx83-studio-spotlight" data-testid="brand-studio-spotlight">
      <div className="cx83-studio-spotlight-copy">
        <p className="cx83-run2-eyebrow">Authentic CX83 Studio work</p>
        <h3 id="studio-spotlight-title">Shape a consistent identity.</h3>
        <p>Start with your existing artwork or a creative direction. Studio helps you develop coordinated branded materials for review through supported connected AI instructions.</p>
        <ol className="cx83-studio-steps">
          <li><strong>01</strong><span>Provide existing artwork or describe your creative direction</span></li>
          <li><strong>02</strong><span>Guide drafts through a supported workflow</span></li>
          <li><strong>03</strong><span>Review the actual files before delivery</span></li>
        </ol>
        <Link className="cx83-run2-text-link" href="#studio-review">
          See the product status <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="cx83-studio-artwork" aria-label="Authentic CX83 branding created through Client Brand Studio">
        <div className="cx83-studio-artwork-inner">
          <Image src="/brand/symbol-showcase.svg" alt="CX83 geometric symbol created with Client Brand Studio" width={160} height={160} />
          <div>
            <Image className="cx83-studio-logo" src="/brand/logo-dark.svg" alt="CX83 Labs logo created with Client Brand Studio" width={1014} height={288} />
            <span>Original CX83 branding created with Client Brand Studio</span>
          </div>
        </div>
        <div className="cx83-studio-swatch-row" aria-hidden="true"><span /><span /><span /><span /></div>
        <p className="cx83-studio-artwork-note">Original CX83 branding created through our Client Brand Studio. The customer software remains in development.</p>
      </div>
    </section>
  )
}
