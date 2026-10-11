import Link from 'next/link'
import type { ReactNode } from 'react'

import './interior.css'

export function InteriorHero({
  title,
  children,
  backHref,
  backLabel,
  id,
}: {
  title: string
  children?: ReactNode
  backHref?: string
  backLabel?: string
  id?: string
}) {
  return (
    <section aria-labelledby={id} className="cx83-interior-hero">
      <div className="cx83-container cx83-interior-hero-inner">
        {backHref && backLabel ? (
          <Link className="cx83-interior-return" href={backHref}>
            <span aria-hidden="true">←</span> {backLabel}
          </Link>
        ) : null}
        <h1 className="cx83-interior-heading" id={id}>{title}</h1>
        {children ? <div className="cx83-interior-lead">{children}</div> : null}
      </div>
    </section>
  )
}

export function InteriorSection({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={'cx83-interior-body ' + className}>
      <div className="cx83-container">{children}</div>
    </section>
  )
}

