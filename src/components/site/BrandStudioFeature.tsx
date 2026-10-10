import Image from 'next/image'
import Link from 'next/link'

const workflow = [
  { label: '01 / Supply', title: 'Your brief and original artwork', detail: 'Begin with your real business identity, colors and design requirements.' },
  { label: '02 / Direct', title: 'Creative direction through AI', detail: 'A connected AI submits the design choices through the Studio workflow.' },
  { label: '03 / Generate', title: 'Files created by the software', detail: 'Studio assembles coordinated draft assets and guides for actual review.' },
] as const

export function BrandStudioFeature() {
  return (
    <div className="cx83-studio-feature" data-testid="cx83-brand-studio-feature">
      <div className="cx83-studio-feature-copy">
        <p className="cx83-run2-kicker">Software spotlight / In development</p>
        <h2>One brand. A connected set of materials.</h2>
        <p>Client Brand Studio is software that builds from supplied source art rather than recreating a logo from a chat prompt. CX83 is testing a 0.8.4 development build; final visual acceptance and customer packaging are still pending.</p>
        <ol className="cx83-studio-workflow">
          {workflow.map((step) => (
            <li key={step.label}>
              <span>{step.label}</span>
              <div><h3>{step.title}</h3><p>{step.detail}</p></div>
            </li>
          ))}
        </ol>
        <Link className="cx83-action cx83-action-primary" href="/software/client-brand-studio">
          Explore Client Brand Studio <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="cx83-studio-feature-visual" aria-label="Real CX83 brand artwork and a conceptual Studio workflow">
        <div className="cx83-studio-visual-top">
          <span>Client Brand Studio</span>
          <span>0.8.4 / Development</span>
        </div>
        <div className="cx83-studio-visual-art">
          <Image
            alt="Original CX83 Labs outlined wordmark artwork"
            className="cx83-studio-visual-logo"
            src="/brand/logo-light.svg"
            width={1014}
            height={288}
          />
          <p>Supplied identity stays intact</p>
        </div>
        <div className="cx83-studio-visual-swatches" aria-label="CX83 brand colors">
          <span title="Midnight" /><span title="Electric Blue" /><span title="Violet" /><span title="Silver" />
        </div>
        <p className="cx83-studio-visual-caption">
          Real CX83 identity artwork and approved palette shown in a conceptual software preview.
          This is not a screenshot of a generated customer file or an approved product release.
        </p>
      </div>
    </div>
  )
}
