import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { Payload } from 'payload'

vi.mock('@/lib/payload', () => ({ getPayloadClient: vi.fn() }))

import { getPayloadClient } from '@/lib/payload'
import AboutPage from '@/app/(frontend)/about/page'
import { approvedAboutParagraphs, approvedAboutStory } from '@/content/aboutStory'
import { conversationStarters, publicNavigationKnowledge } from '@/content/assistantNavigation'
import { INQUIRY_CONTEXTS, inquiryContextHref } from '@/forms/inquiryContext'
import { buildApprovedKnowledge, buildSystemPrompt } from '@/ai/assistant'

const source = readFileSync('docs/CX83_ABOUT_STORY_APPROVED_2026_10_10.md', 'utf8')
const approved = source.trim().split(/\n\s*\n/).slice(1)
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim()

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe('Run 3 exact approved About publication', () => {
  it('retains every approved word and punctuation mark with owner-approved paragraph formatting', async () => {
    vi.mocked(getPayloadClient).mockResolvedValue(null)
    expect(approvedAboutParagraphs).toEqual(approved)
    render(await AboutPage())
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('About CX83 Labs')
    const paragraphs = [...screen.getByTestId('approved-about-story').querySelectorAll('p')]
    expect(normalize(paragraphs.map((p) => p.textContent || '').join(' '))).toBe(normalize(approved.join(' ')))
    expect(paragraphs).toHaveLength(5)
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/contact')
  })

  it('renders the same complete approved story from the actual CMS loader path', async () => {
    const findGlobal = vi.fn().mockResolvedValue({ siteName: 'CX83 Labs', founder: approvedAboutStory })
    vi.mocked(getPayloadClient).mockResolvedValue({ findGlobal } as unknown as Payload)
    render(await AboutPage())
    expect(findGlobal).toHaveBeenCalledWith({ slug: 'site-settings', depth: 0 })
    expect(normalize([...screen.getByTestId('approved-about-story').querySelectorAll('p')].map((p) => p.textContent || '').join(' '))).toBe(normalize(approved.join(' ')))
  })
})

describe('Cat static public guidance', () => {
  it('uses only exact public pathname keys and four self-contained prompts', () => {
    for (const path of ['/services', '/software/connected-websites', '/software/client-brand-studio', '/', '/about']) {
      expect(conversationStarters(path)).toHaveLength(4)
    }
    for (const path of ['/contact?message=private', '/services?email=private', '/admin', '__proto__']) {
      expect(conversationStarters(path)).toEqual(conversationStarters('/'))
      expect(conversationStarters(path).join(' ')).not.toContain('private')
    }
    expect(conversationStarters('/services')).not.toEqual(conversationStarters('/'))
  })

  it('shares all five validated context links and preserves public boundaries', async () => {
    vi.mocked(getPayloadClient).mockResolvedValue(null)
    const knowledge = await buildApprovedKnowledge()
    for (const item of INQUIRY_CONTEXTS) expect(knowledge).toContain(inquiryContextHref(item.token))
    for (const link of ['/#showcase-title', '/work#cx83-connected-website', '/how-it-works#customers', '/how-it-works#marketing', '/how-it-works#operations', '/about']) {
      expect(publicNavigationKnowledge).toContain(link)
    }
    expect(knowledge).toContain(approvedAboutStory)
    const prompt = buildSystemPrompt(knowledge, '')
    expect(prompt).toContain('one useful next link')
    expect(prompt).toContain('cannot access owner agents')
    expect(prompt).toContain('not available for purchase or customer installation')
    expect(prompt).not.toContain('founded in 2025')
  })
})
