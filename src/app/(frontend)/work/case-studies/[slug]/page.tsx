import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { loadCaseStudies } from '@/content/load'

import '../../../interior-run2.css'

export const dynamic = 'force-dynamic'
type Args = { params: Promise<{ slug: string }> }

const fields = [
  ['Problem', 'problem'], ['Context', 'context'], ['Approach', 'approach'],
  ['System designed', 'systemDesigned'], ['Technology', 'technology'],
  ['Outcome', 'outcome'], ['Lessons', 'lessons'],
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
    <div className="cx83-interior-root cx83-interior-run2 cx83-work-detail">
      <InteriorHero title={study.title} backHref="/work" backLabel="Back to Work" id="case-study-title">
        <p>{study.summary}</p>
      </InteriorHero>
      <InteriorSection>
        <div className="cx83-work-detail-fields">
          {fields.map(([label, key]) =>
            study[key] ? (
              <section key={key} aria-label={label}>
                <h2>{label}</h2><p>{study[key]}</p>
              </section>
            ) : null,
          )}
        </div>
        <div className="cx83-interior-closing">
          <div><h2>Have a problem worth solving?</h2><p>Share the practical outcome you are looking for.</p></div>
          <Link className="cx83-action cx83-action-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
      </InteriorSection>
    </div>
  )
}
