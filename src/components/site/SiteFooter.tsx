import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'

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
    <footer className="cx83-site-footer cx83-footer-refined">
      <div className="cx83-container cx83-footer-grid">
        <div className="cx83-footer-identity">
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
                  <span>{item.label}</span>
                  <ArrowUpRight aria-hidden="true" className="cx83-footer-arrow" size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="cx83-footer-contact">
          <p className="cx83-footer-heading">Contact</p>
          {email ? (
            <a className="cx83-footer-link cx83-footer-email" href={'mailto:' + email}>
              <Mail aria-hidden="true" size={16} />
              <span>{email}</span>
            </a>
          ) : null}
        </div>
      </div>
      <div className="cx83-footer-bottom border-t">
        <div className="cx83-container cx83-footer-copyright text-xs">
          <span>© {new Date().getFullYear()} CX83 Labs. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
