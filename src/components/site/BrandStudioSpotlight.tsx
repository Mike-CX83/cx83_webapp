import Image from 'next/image'
import Link from 'next/link'

type Props = { variant: 'catalog' | 'detail' }

/** Only the approved CX83 source artwork is pictured, never a fictional Studio export. */
export function BrandStudioSpotlight({ variant }: Props) {
  if (variant === 'catalog') {
    return (
      <aside className="cx83-studio-spotlight cx83-studio-spotlight-compact" data-testid="brand-studio-spotlight">
        <Image src="/brand/symbol-showcase.svg" width={80} height={80} alt="Original CX83 brand symbol" />
        <div>
          <h3>Keep the identity you already have.</h3>
          <p>Studio begins with supplied source artwork. This symbol is an editorial example, not a generated customer file.</p>
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
        <p className="cx83-run2-eyebrow">Development demonstration, not a customer release</p>
        <h3 id="studio-spotlight-title">Your artwork guides the drafts.</h3>
        <p>Bring your existing logo and a clear brief. Studio is being developed to produce coordinated draft materials for human review through supported connected AI instructions.</p>
        <ol className="cx83-studio-steps">
          <li><strong>01</strong><span>Provide authorized source artwork and a brief</span></li>
          <li><strong>02</strong><span>Guide drafts through a supported workflow</span></li>
          <li><strong>03</strong><span>Review the actual files before delivery</span></li>
        </ol>
        <Link className="cx83-run2-text-link" href="#studio-review">
          Read the review and release limits <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="cx83-studio-artwork" aria-label="Original CX83 source identity used as an editorial example">
        <div className="cx83-studio-artwork-inner">
          <Image src="/brand/symbol-showcase.svg" alt="Original CX83 geometric brand symbol" width={160} height={160} />
          <div>
            <Image className="cx83-studio-logo" src="/brand/logo-dark.svg" alt="Authentic CX83 Labs logo" width={1014} height={288} />
            <span>Source artwork supplied for the example, not a generated replacement</span>
          </div>
        </div>
        <div className="cx83-studio-swatch-row" aria-hidden="true"><span /><span /><span /><span /></div>
        <p className="cx83-studio-artwork-note">Authentic CX83 source artwork. Editorial illustration, not a Studio interface screenshot or approved customer output.</p>
      </div>
    </section>
  )
}
