import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHero, Section } from '@/components/site/Section'
import { loadProjects } from '@/content/load'

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
    <>
      <PageHero eyebrow="Project" title={project.title}>
        <p>{project.summary}</p>
      </PageHero>
      <Section>
        <p className="max-w-3xl leading-8 text-muted-foreground">{project.description}</p>
        {project.technologies.length ? (
          <p className="mt-6 text-sm">Technology: {project.technologies.join(', ')}</p>
        ) : null}
        {project.links.length ? (
          <ul className="mt-6 grid gap-2">
            {project.links.map((link) => (
              <li key={link.url}>
                <a className="underline-offset-4 hover:underline" href={link.url} rel="noreferrer" target="_blank">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>
    </>
  )
}
