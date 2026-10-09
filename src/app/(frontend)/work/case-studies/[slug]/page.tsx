import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHero, Section } from '@/components/site/Section'
import { loadCaseStudies } from '@/content/load'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ slug: string }> }

const fields = [
  ['Problem', 'problem'],
  ['Context', 'context'],
  ['Approach', 'approach'],
  ['System designed', 'systemDesigned'],
  ['Technology', 'technology'],
  ['Outcome', 'outcome'],
  ['Lessons', 'lessons'],
] as const

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const studies = await loadCaseStudies()
  const study = studies.items.find((item) => item.slug === slug)
  return { title: study?.title || 'Case study', description: study?.summary }
}

export default async function CaseStudyPage({ params }: Args) {
  const { slug } = await params
  const studies = await loadCaseStudies()
  const study = studies.items.find((item) => item.slug === slug)
  if (!study) notFound()

  return (
    <>
      <PageHero eyebrow="Case study" title={study.title}>
        <p>{study.summary}</p>
      </PageHero>
      <Section>
        <div className="grid gap-8">
          {fields.map(([label, key]) =>
            study[key] ? (
              <section className="cx83-shared-card" key={key}>
                <h2 className="text-xl font-semibold">{label}</h2>
                <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{study[key]}</p>
              </section>
            ) : null,
          )}
        </div>
      </Section>
    </>
  )
}
