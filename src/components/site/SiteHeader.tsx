'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const fallbackNav = [
  { href: '/', label: 'Home' },
  { href: '/software', label: 'Software' },
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader({ siteName, items }: { siteName: string; items: { href: string; label: string }[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const mobileNav = useRef<HTMLElement>(null)
  const nav = items.length ? [...fallbackNav.filter((item) => item.href === '/' || item.href === '/how-it-works'), ...items.filter((item) => item.href !== '/' && item.href !== '/how-it-works')] : fallbackNav
  const active = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
  const menuId = 'cx83-mobile-navigation'

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    mobileNav.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const openCat = () => {
    setOpen(false)
    // Preserve the request until the separately hydrated Cat widget is listening.
    document.documentElement.dataset.cx83CatRequested = 'true'
    window.dispatchEvent(new Event('cx83:open-cat'))
  }

  return (
    <header className="cx83-site-header sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="cx83-container flex h-[4.75rem] items-center justify-between gap-5">
        <Link className="cx83-site-wordmark inline-flex min-h-11 items-center rounded-md text-sm font-bold tracking-[0.18em] uppercase" href="/" aria-label={siteName + ', Home'} onClick={() => setOpen(false)}>
          <Image src="/brand/logo-light.svg" alt="CX83 Labs" width={1014} height={288} priority className="cx83-logo-light h-auto w-[8.75rem] sm:w-[10.5rem]" />
          <Image src="/brand/logo-dark.svg" alt="" aria-hidden="true" width={1014} height={288} className="cx83-logo-dark h-auto w-[8.75rem] sm:w-[10.5rem]" />
        </Link>
        <div className="hidden items-center gap-3 lg:flex">
          <nav aria-label="Primary" className="flex items-center gap-1">
            {nav.map((item) => (
              <Link aria-current={active(item.href) ? 'page' : undefined} className="cx83-site-nav-link" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="cx83-site-cat-button" onClick={openCat} type="button">Ask Cat <span aria-hidden="true">↗</span></button>
        </div>
        <button
          ref={menuButton}
          aria-label="Menu"
          title={open ? 'Close navigation' : 'Open navigation'}
          aria-controls={menuId}
          aria-expanded={open}
          className="cx83-site-menu-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border lg:hidden"
          onClick={() => {
            setOpen(!open)
            if (open) menuButton.current?.focus()
          }}
          type="button"
        >
          <span aria-hidden="true" className={open ? 'cx83-menu-icon cx83-menu-icon-open' : 'cx83-menu-icon'}>
            <span /><span /><span />
          </span>
        </button>
      </div>
      <nav
        ref={mobileNav}
        aria-label="Mobile"
        className={open ? 'cx83-site-mobile-nav border-t border-border lg:hidden' : 'hidden'}
        id={menuId}
      >
        <div className="cx83-container flex flex-col py-3">
          {nav.map((item) => (
            <Link aria-current={active(item.href) ? 'page' : undefined} className="cx83-site-mobile-link" href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <button className="cx83-site-cat-button cx83-mobile-cat" onClick={openCat} type="button">Ask Cat <span aria-hidden="true">↗</span></button>
        </div>
      </nav>
    </header>
  )
}
