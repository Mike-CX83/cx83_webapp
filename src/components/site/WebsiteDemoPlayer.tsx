import type { ReactNode } from 'react'

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
    </figure>
  )
}
