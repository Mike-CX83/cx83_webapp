import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { loadProjects } from '@/content/load'

import '../../../interior-run2.css'

export const dynamic = 'force-dynamic'
type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const projects = await loadProjects()
  const project = projects.items.find((item) => item.slug === slug)
  return { title: project?.title || 'Project', description: project?.summary }
}

export default async function ProjectPage({ params }: Args) {
  const { slug } = await params
  const projects = await loadProjects()
  const project = projects.items.find((item) => item.slug === slug)
  if (!project) notFound()

  return (
    <div className="cx83-interior-root cx83-interior-run2 cx83-work-detail">
      <InteriorHero title={project.title} backHref="/work" backLabel="Back to Work" id="project-title">
        <p>{project.summary}</p>
      </InteriorHero>
      <InteriorSection>
        <div className="cx83-interior-reading">
          <h2>About this project</h2>
          <p>{project.description}</p>
        </div>
        {project.technologies.length ? (
          <p className="cx83-work-detail-note"><strong>Technology:</strong> {project.technologies.join(', ')}</p>
        ) : null}
        {project.links.length ? (
          <ul className="cx83-work-detail-links">
            {project.links.map((link) => (
              <li key={link.url}>
                <a className="cx83-interior-link" href={link.url} rel="noreferrer" target="_blank">{link.label}</a>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="cx83-interior-closing">
          <div><h2>Want to explore a similar project?</h2><p>Describe the outcome you need and the tools already involved.</p></div>
          <Link className="cx83-action cx83-action-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
      </InteriorSection>
    </div>
  )
}
