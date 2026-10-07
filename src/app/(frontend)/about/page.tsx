import type { Metadata } from 'next'

import { ContentNotice, PageHero, Section } from '@/components/site/Section'
import { loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About',
  description: 'About CX83 Labs.',
}

export default async function AboutPage() {
  const site = await loadSiteCopy()
  const sections = [
    ['Overview', site.copy.overview],
    ['Founder', site.copy.founder],
    ['Mission', site.copy.mission],
    ['Approach', site.copy.approach],
  ] as const

  return (
    <>
      <PageHero eyebrow="About" title={site.copy.siteName}>
        <p>{site.copy.tagline}</p>
      </PageHero>
      <Section>
        <ContentNotice source={site.source} />
        <div className="grid gap-10">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{body}</p>
            </section>
          ))}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight">Capabilities</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {site.copy.capabilities.map((item) => (
                <li className="rounded-2xl border border-border bg-card px-4 py-4" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Section>
    </>
  )
}
