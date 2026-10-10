import type { Metadata } from 'next'

import { InquiryForm } from '@/components/site/InquiryForm'
import { Section } from '@/components/site/Section'
import { loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Tell CX83 Labs about your business, a process you want to improve, or a software project you have in mind.',
}

const steps = [
  {
    number: '01',
    title: 'Tell us what is happening',
    detail: 'A process, a bottleneck, or an idea is enough to begin.',
  },
  {
    number: '02',
    title: 'Explore what makes sense',
    detail: 'We can look at the tools you have and what needs connecting or building.',
  },
  {
    number: '03',
    title: 'Choose the next step',
    detail: 'If there is a fit, we can define a practical scope together.',
  },
]

export default async function ContactPage() {
  const site = await loadSiteCopy()

  return (
    <div className="cx83-contact">
      <section aria-labelledby="contact-title" className="cx83-contact-hero">
        <div className="cx83-container cx83-contact-hero-inner">
          <p className="cx83-contact-kicker">CX83 Labs / Let&apos;s connect</p>
          <h1 id="contact-title">
            Let&apos;s make your business <span>work better.</span>
          </h1>
          <p className="cx83-contact-lead">
            Tell us what takes too much time, what feels disconnected, or what you want to build.
            You do not need a technical plan to start the conversation.
          </p>
          <a className="cx83-action cx83-action-primary cx83-contact-hero-link" href="#contact-form">
            Tell us about your project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <Section className="cx83-contact-section">
        <div className="cx83-contact-layout">
          <aside aria-label="Getting in touch" className="cx83-contact-info">
            <p className="cx83-home-kicker">A good place to start</p>
            <h2>One problem is enough.</h2>
            <p className="cx83-contact-info-intro">
              CX83 helps businesses connect their software, reduce repetitive work,
              and create useful AI and automation systems. Start wherever the friction is.
            </p>

            <div className="cx83-contact-steps">
              {steps.map((step) => (
                <div className="cx83-contact-step" key={step.number}>
                  <span aria-hidden="true">{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {site.copy.contactEmail ? (
              <div className="cx83-contact-direct">
                <p className="cx83-contact-direct-label">Prefer email?</p>
                <a href={`mailto:${site.copy.contactEmail}`}>{site.copy.contactEmail} <span aria-hidden="true">↗</span></a>
              </div>
            ) : null}

            {site.copy.schedulingUrl ? (
              <a className="cx83-contact-schedule" href={site.copy.schedulingUrl}>
                {site.copy.schedulingLabel} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </aside>

          <div aria-labelledby="contact-form-title" className="cx83-contact-form-card" id="contact-form">
            <div className="cx83-contact-form-intro">
              <p className="cx83-contact-form-kicker">Project inquiry or general question</p>
              <h2 id="contact-form-title">Tell us what you have in mind.</h2>
              <p>Share a few details and we can follow up about what makes sense for your business.</p>
            </div>
            <InquiryForm />
            <p className="cx83-contact-form-note">
              Your details are stored by CX83 to review and respond to your inquiry, not shared with the public Cat assistant. Please leave passwords, patient information, and other sensitive records out of your message.
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
