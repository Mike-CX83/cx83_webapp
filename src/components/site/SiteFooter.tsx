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
      <div className="cx83-container cx83-footer-grid">
        <div>
          <Link
            className="cx83-footer-brand inline-flex min-h-11 items-center text-sm font-bold tracking-[0.18em] uppercase"
            href="/"
            aria-label={siteName + ', Home'}
          >
            <Image
              src="/brand/logo-dark.svg"
              alt="CX83 Labs"
              loading="eager"
              width={1014}
              height={288}
              className="h-auto w-[11rem]"
            />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-7">
            AI systems, automation and business integration.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="cx83-footer-heading">Explore</p>
          <ul className="cx83-footer-nav">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link className="cx83-footer-link" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="cx83-footer-heading">Contact</p>
          {email ? (
            <a className="cx83-footer-link mt-1 break-all" href={'mailto:' + email}>
              {email}
            </a>
          ) : null}
        </div>
      </div>
      <div className="cx83-footer-bottom border-t">
        <div className="cx83-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs">
          <span>© {new Date().getFullYear()} CX83 Labs. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
