'use client'

import Link from 'next/link'
import { useState } from 'react'

const fallbackNav = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader({
  siteName,
  items,
}: {
  siteName: string
  items: { href: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const nav = items.length ? items : fallbackNav

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="cx83-container flex h-16 items-center justify-between gap-4">
        <Link className="text-sm font-semibold tracking-[0.18em] uppercase" href="/">
          {siteName}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link className="text-sm text-muted-foreground hover:text-foreground" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          aria-controls="mobile-navigation"
          aria-expanded={open}
          className="rounded-md border border-border px-3 py-2 text-sm md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open ? (
        <nav aria-label="Mobile" className="border-t border-border md:hidden" id="mobile-navigation">
          <div className="cx83-container flex flex-col py-3">
            {nav.map((item) => (
              <Link
                className="rounded-md px-2 py-3 text-base hover:bg-secondary"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
