import type { Metadata } from 'next'
import Link from 'next/link'

import { ContentNotice, PageHero, Section } from '@/components/site/Section'
import { loadCaseStudies, loadProjects } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Projects and case studies from CX83 Labs.',
}

export default async function WorkPage() {
  const [projects, caseStudies] = await Promise.all([loadProjects(), loadCaseStudies()])
  const source = projects.source === 'unavailable' || caseStudies.source === 'unavailable' ? 'unavailable' : 'payload'

  return (
    <>
      <PageHero eyebrow="Work" title="Projects and case studies.">
        <p>See real projects and the systems we are building. We only share work that we can demonstrate.</p>
      </PageHero>
      <Section>
        <ContentNotice source={source} />
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        {projects.items.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {projects.items.map((project) => (
              <article className="cx83-shared-card" key={project.slug}>
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{project.status}</p>
                <h3 className="mt-2 text-xl font-semibold">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.summary}</p>
                <Link className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold" href={`/work/projects/${project.slug}`}>
                  View project
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="cx83-work-proof"><p>Customer projects are not published yet. You can explore real first-party evidence from the CX83 website itself instead.</p><Link href="/how-it-works#real-proof">View verified website demonstration</Link></div>
        )}
        <h2 className="mt-14 text-2xl font-semibold tracking-tight">Case studies</h2>
        {caseStudies.items.length ? (
          <div className="mt-6 grid gap-4">
            {caseStudies.items.map((study) => (
              <article className="rounded-2xl border border-border bg-card p-6" key={study.slug}>
                <h3 className="text-xl font-semibold">{study.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{study.summary}</p>
                <Link className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline" href={`/work/case-studies/${study.slug}`}>
                  Read case study
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">No customer case studies have been authorized for publication. We do not substitute illustrative client results.</p>
        )}
      </Section>
    </>
  )
}
