import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/utilities/ui'

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section className={cn('py-16 md:py-24', className)} id={id}>
      <div className="cx83-container">{children}</div>
    </section>
  )
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
}) {
  return (
    <Section className="border-b border-border pt-20 pb-14 md:pt-28">
      {eyebrow ? (
        <p className="mb-4 text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">{title}</h1>
      {children ? <div className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{children}</div> : null}
    </Section>
  )
}

export function ContentNotice({ source }: { source: 'payload' | 'unavailable' }) {
  if (source === 'payload') return null

  return (
    <p className="mb-8 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      Development content. PostgreSQL is not connected, so this page is showing the local fallback
      instead of published Payload content.
    </p>
  )
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="font-medium text-primary underline-offset-4 hover:underline" href={href}>
      {children}
    </Link>
  )
}
