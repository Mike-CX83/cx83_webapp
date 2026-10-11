import type { Metadata } from 'next'

import { InquiryForm } from '@/components/site/InquiryForm'
import { InteriorHero, InteriorSection } from '@/components/site/InteriorPage'
import { loadSiteCopy } from '@/content/load'
import { parseInquiryContext } from '@/forms/inquiryContext'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Tell CX83 Labs about your business, a process you want to improve, or a software project you have in mind.',
}

type Args = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ContactPage({ searchParams }: Args) {
  const [site, query] = await Promise.all([loadSiteCopy(), searchParams])
  const initialContext = parseInquiryContext(query.context)

  return (
    <div className="cx83-interior-root cx83-contact cx83-contact-refined">
      <InteriorHero id="contact-title" title="Let’s make your business work better.">
        <p>Tell us what takes too much time, what feels disconnected, or what you want to build. One problem is enough to start.</p>
      </InteriorHero>
      <InteriorSection className="cx83-contact-section">
        <div className="cx83-contact-layout">
          <div aria-labelledby="contact-form-title" className="cx83-contact-form-card" id="contact-form">
            <div className="cx83-contact-form-intro">
              <h2 id="contact-form-title">Tell us what you have in mind.</h2>
            </div>
            <InquiryForm initialContext={initialContext} />
            <p className="cx83-contact-form-note">
              Your details are stored by CX83 to review and respond to your inquiry, not shared with the public Cat assistant. Please leave passwords, patient information, and other sensitive records out of your message.
            </p>
          </div>
          <aside aria-labelledby="contact-next-title" className="cx83-contact-info">
            <h2 id="contact-next-title">What happens next</h2>
            <p>
              We review your inquiry and the tools or process involved. If there is a fit, we can
              define a useful next step and a practical scope together.
            </p>
            <p>You can ask a general question or begin with one specific improvement.</p>
            {site.copy.contactEmail ? (
              <div className="cx83-contact-direct">
                <p className="cx83-contact-direct-label">Prefer email?</p>
                <a href={'mailto:' + site.copy.contactEmail}>
                  {site.copy.contactEmail} <span aria-hidden="true">↗</span>
                </a>
              </div>
            ) : null}
          </aside>
        </div>
      </InteriorSection>
    </div>
  )
}

