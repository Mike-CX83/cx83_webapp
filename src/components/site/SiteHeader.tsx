'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const fallbackNav = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader({ siteName, items }: { siteName: string; items: { href: string; label: string }[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const nav = items.length ? items : fallbackNav
  const active = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
  const menuId = 'cx83-mobile-navigation'

  return (
    <header className="cx83-site-header sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="cx83-container flex h-[4.75rem] items-center justify-between gap-5">
        <Link className="cx83-site-wordmark inline-flex min-h-11 items-center rounded-md text-sm font-bold tracking-[0.18em] uppercase" href="/" aria-label={siteName + ', Home'} onClick={() => setOpen(false)}>
          {siteName}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-2 md:flex">
          {nav.map(item => (
            <Link aria-current={active(item.href) ? 'page' : undefined} className="cx83-site-nav-link" href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>
        <button aria-controls={menuId} aria-expanded={open} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} className="cx83-site-menu-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold md:hidden" onClick={() => setOpen(!open)} type="button">
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <nav aria-label="Mobile" className={open ? 'cx83-site-mobile-nav border-t border-border md:hidden' : 'hidden'} id={menuId}>
        <div className="cx83-container flex flex-col py-3">
          {nav.map(item => (
            <Link aria-current={active(item.href) ? 'page' : undefined} className="cx83-site-mobile-link" href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
