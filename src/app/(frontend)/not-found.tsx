import Link from 'next/link'
import { PageHero, Section } from '@/components/site/Section'

export default function NotFound() {
  return (
    <div className="cx83-run3-not-found">
      <PageHero eyebrow="Page not found / 404" title="That page is not here.">
        <p>The link may have changed, or the page may not exist. The CX83 website and Cat are still available.</p>
      </PageHero>
      <Section>
        <nav aria-label="Find your way" className="cx83-run3-not-found-links">
          <Link className="cx83-action cx83-action-primary" href="/">Return home <span aria-hidden="true">↗</span></Link>
          <Link className="cx83-action cx83-action-quiet" href="/software">Explore software</Link>
          <Link className="cx83-action cx83-action-quiet" href="/contact">Contact CX83</Link>
        </nav>
      </Section>
    </div>
  )
}
