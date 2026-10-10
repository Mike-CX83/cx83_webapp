import Image from 'next/image'
import Link from 'next/link'

const footerNav = [
  { href: '/', label: 'Home' },
  { href: '/software', label: 'Software' },
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
]

export function SiteFooter({ siteName, email }: { siteName: string; email?: string }) {
  return (
    <footer className="cx83-site-footer">
      <div className="cx83-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link className="cx83-footer-brand inline-flex min-h-11 items-center text-sm font-bold tracking-[0.18em] uppercase" href="/" aria-label={siteName + ', Home'}>
            <Image src="/brand/logo-dark.svg" alt="CX83 Labs" loading="eager" width={1014} height={288} className="h-auto w-[11rem]" />
          </Link>
          <p className="cx83-footer-origin">Catalyst X83</p>
          <p className="mt-3 max-w-sm text-sm leading-7">AI systems, automation and business integration. Practical websites and connected software built around how work actually happens.</p>
          <p className="cx83-footer-purpose">Your software. Your AI. Your control.</p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="cx83-footer-heading">Explore</p>
          <ul className="mt-3 flex flex-col gap-1">
            {footerNav.map((item) => <li key={item.href}><Link className="cx83-footer-link" href={item.href}>{item.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <p className="cx83-footer-heading">Start a conversation</p>
          <Link className="cx83-footer-link mt-3" href="/contact">Tell us what you want to build <span aria-hidden="true">↗</span></Link>
          {email ? <a className="cx83-footer-link mt-1 break-all" href={'mailto:' + email}>{email}</a> : null}
          <p className="cx83-footer-assistant-note">CAT, our visitor assistant, can explain public offerings but cannot edit or administer this site.</p>
        </div>
      </div>
      <div className="cx83-footer-bottom border-t">
        <div className="cx83-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs">
          <span>© {new Date().getFullYear()} CX83 Labs. All rights reserved.</span>
          <Link className="cx83-footer-link" href="/">Back to home</Link>
        </div>
      </div>
    </footer>
  )
}
