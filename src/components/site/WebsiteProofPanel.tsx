import Link from 'next/link'

const evidence = [
  {
    label: 'Before',
    title: 'Useful components, inconsistent presentation',
    detail: 'CX83 already had a Next.js and Payload website, real service routes and a working inquiry storage path. The public design and CAT experience needed a coherent identity.',
  },
  {
    label: 'Request',
    title: 'Make the real CX83 website work and look like CX83',
    detail: 'The owner directed connected AI work on the authentic logo, dark-first pages, accessible mobile navigation and a separate visitor assistant, while protecting the original homepage banner.',
  },
  {
    label: 'After',
    title: 'Source changed, checked and deployed to staging',
    detail: 'The updated website passed its integration and browser tests, retained the complete original homepage hero, and shipped to password-protected staging with an exact source receipt.',
  },
] as const

/**
 * First-party, source-backed demonstration until the approved MP4,
 * poster, caption and media rights can actually be reviewed.
 */
export function WebsiteProofPanel() {
  return (
    <figure className="cx83-showcase-player" id="website-proof" data-testid="cx83-proof-panel">
      <div className="cx83-showcase-proof-feature cx83-run2-proof-feature">
        <div className="cx83-run2-proof-heading">
          <p className="cx83-showcase-kicker">A real CX83 website change</p>
          <span className="cx83-run2-proof-status">Staging verified / Oct 9, 2026</span>
        </div>
        <h2>One request. Real website updates.</h2>
        <p className="cx83-showcase-proof-intro">
          The CX83 site you are viewing was improved through connected AI and actual website development tools.
          This is a documented first-party build, not a simulated customer installation.
        </p>
        <ol className="cx83-run2-proof-timeline">
          {evidence.map((item, index) => (
            <li key={item.label}>
              <span className="cx83-run2-proof-index">{String(index + 1).padStart(2, '0')} / {item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </li>
          ))}
        </ol>
        <div className="cx83-run2-proof-metrics" aria-label="Run 1 verified checks">
          <div><strong>29</strong><span>Integration tests passed</span></div>
          <div><strong>46</strong><span>Browser tests passed</span></div>
          <div><strong>1</strong><span>Original banner protected</span></div>
        </div>
        <div className="cx83-run2-proof-links">
          <Link href="/services" className="cx83-showcase-proof-explore">
            Explore the updated website <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/how-it-works" className="cx83-showcase-proof-explore">
            See how it connects <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <figcaption className="cx83-showcase-player-caption">
        <span className="cx83-showcase-player-caption-label">Verified first-party build</span>
        Run 1 staging source cdae3ebab225. Original showcase video remains withheld until genuine media and captions are accepted.
      </figcaption>
    </figure>
  )
}
