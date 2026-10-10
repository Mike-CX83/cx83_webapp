import type { ReactNode } from 'react'
import Link from 'next/link'

type Props = {
  source: string
  poster: string
  captions: string
  children?: ReactNode
}

export function WebsiteDemoPlayer({ source, poster, captions, children }: Props) {
  return (
    <figure className="cx83-showcase-player" id="website-demo">
      <div className="cx83-showcase-player-shell">
        <video
          aria-label="CX83 Labs real website change demonstration"
          className="cx83-showcase-video"
          controls
          playsInline
          poster={poster}
          preload="none"
        >
          <source src={source} type="video/mp4" />
          <track default kind="captions" label="English captions" src={captions} srcLang="en" />
          Your browser does not support embedded video.
        </video>
      </div>
      <figcaption className="cx83-showcase-player-caption">
        <span className="cx83-showcase-player-caption-label">Real website change</span>
        {children}
      </figcaption>
      <details className="cx83-showcase-video-transcript">
        <summary>Read the video sequence and source evidence</summary>
        <ol>
          <li><strong>Before:</strong> The CX83 Contact page needed the same visual identity as the updated website.</li>
          <li><strong>Request:</strong> The owner asked ChatGPT to apply the existing brand colors and layout.</li>
          <li><strong>Action:</strong> The authorized CX83 development connection performed actual website work.</li>
          <li><strong>After:</strong> The Contact page showed the refreshed design and retained its inquiry form.</li>
          <li><strong>Verification:</strong> Actual CX83 website releases were tested and deployed to protected staging. This is a first party demonstration, not a customer deployment.</li>
        </ol>
        <Link href="/how-it-works#real-proof" className="cx83-showcase-proof-explore">
          Read the evidence record <span aria-hidden="true">↗</span>
        </Link>
        <p>The video is an edited, captioned demonstration. Third party provider accounts and publishing require explicit permission.</p>
      </details>
    </figure>
  )
}
