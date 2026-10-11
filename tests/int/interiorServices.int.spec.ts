import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'

vi.mock('@/lib/payload', () => ({ getPayloadClient: vi.fn() }))

import { getPayloadClient } from '@/lib/payload'
import { loadServices } from '@/content/load'

const canonicalSlugs = ['ai-setup-and-workflows', 'automation-and-integrations', 'websites-and-business-tools']

describe('Interior service content sources', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps the same three service routes when PostgreSQL is unavailable', async () => {
    vi.mocked(getPayloadClient).mockResolvedValue(null)
    const result = await loadServices()
    expect(result.source).toBe('unavailable')
    expect(result.items.map((service) => service.slug).sort()).toEqual([...canonicalSlugs].sort())
    expect(result.items.every((service) => service.name && service.description && service.capabilities.length === 3)).toBe(true)
  })

  it('preserves published CMS content instead of replacing it with fallback copy', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [{
        name: 'CMS service title',
        slug: canonicalSlugs[0],
        shortDescription: 'Approved CMS summary.',
        description: 'Approved CMS detail copy.',
        capabilities: [{ item: 'First approved deliverable' }, { item: 'Second approved deliverable' }, { item: 'Third approved deliverable' }],
        image: null,
        callToAction: { label: 'Approved CMS invitation', url: '/contact' },
      }],
    })
    vi.mocked(getPayloadClient).mockResolvedValue({ find } as unknown as Payload)
    const result = await loadServices()
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'services', draft: false, overrideAccess: false }))
    expect(result.source).toBe('payload')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      name: 'CMS service title',
      slug: canonicalSlugs[0],
      shortDescription: 'Approved CMS summary.',
      description: 'Approved CMS detail copy.',
      capabilities: ['First approved deliverable', 'Second approved deliverable', 'Third approved deliverable'],
      callToActionLabel: 'Approved CMS invitation',
      callToActionUrl: '/contact',
    })
  })
})
