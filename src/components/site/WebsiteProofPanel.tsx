import Link from 'next/link'

/** Verified first-party staging record, not invented footage or client results. */
export function WebsiteProofPanel() {
  return (
    <figure className="cx83-showcase-player" id="website-proof" data-testid="cx83-proof-panel">
      <div className="cx83-showcase-proof-feature">
        <p className="cx83-showcase-kicker">A real change to the site you are viewing</p>
        <h2>Before. Request. After.</h2>
        <p className="cx83-showcase-proof-intro">
          CX83 updated this actual website through ChatGPT using authorized, connected CX83 website tools. The source changes were tested and deployed to protected staging. This is a documented first-party build, not a simulated customer installation.
        </p>
        <ol className="cx83-showcase-proof-stages">
          <li><span>01 / BEFORE</span><p>The interior pages and assistant needed consistent CX83 identity, navigation and release language.</p></li>
          <li><span>02 / REQUEST</span><p>Preserve the original homepage banner, unify the page design and create the Cat visitor experience.</p></li>
          <li><span>03 / AFTER</span><p>The actual website changed, passed automated checks and deployed to protected staging with its original banner intact.</p></li>
        </ol>
        <div className="cx83-run2-proof-metrics">
          <span><strong>29</strong> integration tests</span>
          <span><strong>46</strong> browser tests</span>
          <span><strong>October 9, 2026</strong> verified staging</span>
        </div>
        <div className="cx83-run2-proof-actions">
          <Link href="/services" className="cx83-showcase-proof-explore">Explore the updated website <span aria-hidden="true">↗</span></Link>
          <Link href="/how-it-works#real-proof" className="cx83-showcase-proof-explore">Read the evidence record <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <figcaption className="cx83-showcase-player-caption">
        <span className="cx83-showcase-player-caption-label">Source-backed proof</span>
        First-party staging verification. The original walkthrough video still awaits actual source files and captions.
      </figcaption>
    </figure>
  )
}
