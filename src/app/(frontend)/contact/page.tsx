import type { Metadata } from 'next'

import { InquiryForm } from '@/components/site/InquiryForm'
import { PageHero, Section } from '@/components/site/Section'
import { loadSiteCopy } from '@/content/load'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact CX83 Labs about a project or a general question.',
}

export default async function ContactPage() {
  const site = await loadSiteCopy()

  return (
    <>
      <PageHero eyebrow="Contact" title="Tell CX83 Labs what you want to change.">
        <p>Use one form for a general question or a project inquiry. Submissions are stored for the site owner in Payload.</p>
      </PageHero>
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="text-sm leading-7 text-muted-foreground">
            {site.copy.contactEmail ? (
              <p>
                Email:{' '}
                <a className="text-foreground underline-offset-4 hover:underline" href={`mailto:${site.copy.contactEmail}`}>
                  {site.copy.contactEmail}
                </a>
              </p>
            ) : (
              <p>A public email address has not been added in Site settings.</p>
            )}
            {site.copy.schedulingUrl ? (
              <p className="mt-4">
                <a className="text-foreground underline-offset-4 hover:underline" href={site.copy.schedulingUrl}>
                  {site.copy.schedulingLabel}
                </a>
              </p>
            ) : (
              <p className="mt-4">Scheduling link placeholder. Add the real link in Site settings when one exists.</p>
            )}
          </div>
          <InquiryForm />
        </div>
      </Section>
    </>
  )
}
