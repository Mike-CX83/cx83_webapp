import Link from 'next/link'

/**
 * Authentic, text-based proof while the source video package is not available.
 * This refers to changes documented in CX83's October 9 staging PR and CI.
 */
export function WebsiteProofPanel() {
  return (
    <figure className="cx83-showcase-player" id="website-proof" data-testid="cx83-proof-panel">
      <div className="cx83-showcase-proof-feature">
        <p className="cx83-showcase-kicker">Built on the website you are viewing</p>
        <h2>One request. Real website updates.</h2>
        <p className="cx83-showcase-proof-intro">
          CX83&apos;s own pages were updated through an AI connected to the actual application.
          The result is the site you can explore here.
        </p>
        <ol className="cx83-showcase-proof-stages">
          <li><span>01 / THE REQUEST</span><p>Bring the real CX83 identity and interactions together across the website.</p></li>
          <li><span>02 / THE CHANGE</span><p>Apply shared logos, page layouts, working links, and responsive navigation.</p></li>
          <li><span>03 / THE RESULT</span><p>Run automated checks and publish the verified update to the staging website.</p></li>
        </ol>
        <Link href="/services" className="cx83-showcase-proof-explore">
          Explore the updated website <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <figcaption className="cx83-showcase-player-caption">
        <span className="cx83-showcase-player-caption-label">CX83 real build</span>
        Website update documented October 9, 2026. Video walkthrough to follow.
      </figcaption>
    </figure>
  )
}
