import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/utilities/ui'

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <section className={cn('py-16 md:py-24', className)} id={id}><div className="cx83-container">{children}</div></section>
}

export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="cx83-shared-page-hero">
      <div className="cx83-container py-16 md:py-24">
        {eyebrow ? <p className="cx83-shared-eyebrow mb-5 text-xs font-bold tracking-[0.14em] uppercase">{eyebrow}</p> : null}
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl">{title}</h1>
        {children ? <div className="cx83-shared-hero-description mt-6 max-w-2xl text-lg leading-8">{children}</div> : null}
      </div>
    </section>
  )
}

export function ContentNotice({ source }: { source: 'payload' | 'unavailable' }) {
  if (source === 'payload') return null
  return <p className="mb-8 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">Development content. PostgreSQL is not connected, so this page is showing the local fallback instead of published Payload content.</p>
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="cx83-shared-text-link font-semibold" href={href}>{children}</Link>
}
