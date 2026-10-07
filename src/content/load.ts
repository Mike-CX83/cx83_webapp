import { getPayloadClient } from '@/lib/payload'

import { developmentAbout, developmentServices } from './development'

export type ContentSource = 'payload' | 'unavailable'

export type ServiceCard = {
  name: string
  slug: string
  shortDescription: string
  description: string
  capabilities: string[]
  imageUrl?: string | null
  imageAlt?: string | null
  callToActionLabel?: string | null
  callToActionUrl?: string | null
}

export type ProjectCard = {
  title: string
  slug: string
  summary: string
  description: string
  technologies: string[]
  status?: string | null
  links: { label: string; url: string }[]
}

export type CaseStudyCard = {
  title: string
  slug: string
  summary: string
  problem?: string | null
  context?: string | null
  approach?: string | null
  systemDesigned?: string | null
  technology?: string | null
  outcome?: string | null
  lessons?: string | null
}

export type SiteCopy = typeof developmentAbout

type UploadValue = {
  url?: string | null
  alt?: string | null
} | null

function textList(value: unknown, key: string): string[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const item = (entry as Record<string, unknown>)[key]
    return typeof item === 'string' && item.trim() ? [item.trim()] : []
  })
}

export async function loadServices(): Promise<{ source: ContentSource; items: ServiceCard[] }> {
  const payload = await getPayloadClient()
  if (!payload) {
    return { source: 'unavailable', items: developmentServices }
  }

  const result = await payload.find({
    collection: 'services',
    draft: false,
    limit: 50,
    overrideAccess: false,
    depth: 1,
  })

  const items = result.docs.map((doc) => {
    const image = doc.image as UploadValue
    const callToAction = doc.callToAction as { label?: string | null; url?: string | null } | null

    return {
      name: doc.name,
      slug: doc.slug || '',
      shortDescription: doc.shortDescription,
      description: doc.description,
      capabilities: textList(doc.capabilities, 'item'),
      imageUrl: image && typeof image === 'object' ? image.url : null,
      imageAlt: image && typeof image === 'object' ? image.alt : null,
      callToActionLabel: callToAction?.label,
      callToActionUrl: callToAction?.url,
    }
  })

  return { source: 'payload', items }
}

export async function loadProjects(): Promise<{ source: ContentSource; items: ProjectCard[] }> {
  const payload = await getPayloadClient()
  if (!payload) return { source: 'unavailable', items: [] }

  const result = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 50,
    overrideAccess: false,
  })

  return {
    source: 'payload',
    items: result.docs.map((doc) => ({
      title: doc.title,
      slug: doc.slug || '',
      summary: doc.summary,
      description: doc.description,
      technologies: textList(doc.technologies, 'name'),
      status: doc.status,
      links: Array.isArray(doc.links)
        ? doc.links.flatMap((link) => {
            if (!link?.label || !link.url) return []
            return [{ label: link.label, url: link.url }]
          })
        : [],
    })),
  }
}

export async function loadCaseStudies(): Promise<{ source: ContentSource; items: CaseStudyCard[] }> {
  const payload = await getPayloadClient()
  if (!payload) return { source: 'unavailable', items: [] }

  const result = await payload.find({
    collection: 'case-studies',
    draft: false,
    limit: 50,
    overrideAccess: false,
  })

  return {
    source: 'payload',
    items: result.docs.map((doc) => ({
      title: doc.title,
      slug: doc.slug || '',
      summary: doc.summary || '',
      problem: doc.problem,
      context: doc.context,
      approach: doc.approach,
      systemDesigned: doc.systemDesigned,
      technology: doc.technology,
      outcome: doc.outcome,
      lessons: doc.lessons,
    })),
  }
}

export async function loadNavigation(): Promise<{ href: string; label: string }[]> {
  const payload = await getPayloadClient()
  if (!payload) return []

  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const items = Array.isArray(header.navItems) ? header.navItems : []

  return items.flatMap((item) => {
    const link = item?.link
    if (!link?.label || !link.url || link.type === 'reference') return []
    return [{ href: link.url, label: link.label }]
  })
}

export async function loadSiteCopy(): Promise<{ source: ContentSource; copy: SiteCopy }> {
  const payload = await getPayloadClient()
  if (!payload) return { source: 'unavailable', copy: developmentAbout }

  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })

  return {
    source: 'payload',
    copy: {
      siteName: settings.siteName || developmentAbout.siteName,
      tagline: settings.tagline || developmentAbout.tagline,
      overview: settings.overview || developmentAbout.overview,
      founder: settings.founder || developmentAbout.founder,
      mission: settings.mission || developmentAbout.mission,
      approach: settings.approach || developmentAbout.approach,
      capabilities: textList(settings.capabilities, 'item').length
        ? textList(settings.capabilities, 'item')
        : developmentAbout.capabilities,
      contactEmail: settings.contactEmail || '',
      schedulingUrl: settings.schedulingUrl || '',
      schedulingLabel: settings.schedulingLabel || developmentAbout.schedulingLabel,
    },
  }
}
