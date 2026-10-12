import { describe, expect, it } from 'vitest'

import { getSoftwareProduct, softwareProducts } from '../../src/content/softwareCatalog'
import { inquiryContextHref, parseInquiryContext } from '../../src/forms/inquiryContext'

describe('Interior Run 2 public software contracts', () => {
  it('retains exactly the two planned products without pretending a release', () => {
    expect(softwareProducts.map((item) => item.slug)).toEqual(['connected-websites', 'client-brand-studio'])
    for (const product of softwareProducts) {
      expect(getSoftwareProduct(product.slug)).toBe(product)
      expect(product.releaseStatus).toBe('In development')
      expect(product.shortDescription.length).toBeGreaterThan(20)
      expect(product.setup).toMatch(/not.*releas|not.*approv/i)
      expect(product.benefits.length).toBeGreaterThan(0)
    }
    expect(getSoftwareProduct('nonexistent')).toBeUndefined()
  })

  it('links each product to the validated Run 1 Contact context and software category', () => {
    for (const product of softwareProducts) {
      const context = parseInquiryContext(product.slug)
      expect(context).not.toBeNull()
      expect(context?.inquiryType).toBe('software')
      expect(context?.label).toBe(product.name === 'CX83 Connected Website Platform' ? 'Connected Website Platform' : product.name)
      expect(inquiryContextHref(product.slug)).toBe('/contact?context=' + product.slug + '#contact-form')
    }
  })
})
