import Image from 'next/image'
import Link from 'next/link'

/** Authentic CX83 source artwork, clearly not an exported customer draft or UI screenshot. */
export function BrandStudioSpotlight() {
  return (
    <section aria-labelledby="studio-spotlight-title" className="cx83-studio-spotlight" data-testid="brand-studio-spotlight">
      <div className="cx83-studio-spotlight-copy">
        <p className="cx83-run2-eyebrow">Client Brand Studio / development build 0.8.4</p>
        <h3 id="studio-spotlight-title">Start with your actual brand. Make everything feel connected.</h3>
        <p>Supply your original artwork and direction. Your connected AI can guide Studio while the software generates coordinated draft files for review.</p>
        <ol className="cx83-studio-steps">
          <li><strong>01</strong><span>Provide the existing logo and brief</span></li>
          <li><strong>02</strong><span>Guide creative choices through supported AI</span></li>
          <li><strong>03</strong><span>Review generated materials before release</span></li>
        </ol>
        <Link className="cx83-run2-text-link" href="/software/client-brand-studio">Explore Client Brand Studio <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="cx83-studio-artwork" aria-label="Authentic CX83 source symbol and color roles">
        <div className="cx83-studio-artwork-inner">
          <Image src="/brand/symbol-showcase.svg" alt="Original CX83 geometric brand symbol" width={160} height={160} />
          <div><Image className="cx83-studio-logo" src="/brand/logo-light.svg" alt="Authentic CX83 Labs logo" width={1014} height={288} /><span>Source brand identity, not a generated replacement</span></div>
        </div>
        <div className="cx83-studio-swatch-row" aria-hidden="true"><span /><span /><span /><span /></div>
        <p className="cx83-studio-artwork-note">Authentic CX83 source artwork. Editorial illustration, not a Studio screenshot or approved customer export.</p>
      </div>
    </section>
  )
}
