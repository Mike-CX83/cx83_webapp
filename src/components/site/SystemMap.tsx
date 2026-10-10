'use client'

import Link from 'next/link'
import { useState } from 'react'

const layers = [
  {
    id: 'business-owner',
    lane: 'owner',
    title: 'Business owner',
    explanation: 'A person decides what should change and which tools the connected AI may use.',
    example: 'Ask to update an actual website page or connect an existing business workflow.',
    access: 'The owner chooses access and retains control of publishing and accounts.',
  },
  {
    id: 'connected-ai',
    lane: 'owner',
    title: 'Connected owner AI',
    explanation: 'A supported AI service turns a conversation into a request for permitted software actions.',
    example: 'Describe a new contact section without writing instructions for a developer.',
    access: 'The AI can request only actions exposed through its approved connection.',
  },
  {
    id: 'authorized-tools',
    lane: 'owner',
    title: 'Authorized website tools',
    explanation: 'The actual software tools can read or change allowed parts of a website, run checks and prepare a deployment.',
    example: 'Edit an approved page, validate the result and save the change in version control.',
    access: 'Each connection has its own permissions. CAT does not have these tools.',
  },
  {
    id: 'review-and-release',
    lane: 'owner',
    title: 'Review and publish',
    explanation: 'Checks, version history and publishing controls turn a proposed change into a traceable website result.',
    example: 'The CX83 Run 1 source was tested and deployed to its protected staging environment.',
    access: 'Deployment, hosting and business records remain subject to the owner and provider access rules.',
  },
  {
    id: 'website-visitor',
    lane: 'visitor',
    title: 'Website visitor',
    explanation: 'A visitor explores the public site and asks questions without an owner account.',
    example: 'Read about CX83 software, services or how a connected website works.',
    access: 'Public website content only.',
  },
  {
    id: 'cat-assistant',
    lane: 'visitor',
    title: 'CAT assistant',
    explanation: 'CAT is the separate CX83 visitor assistant for public questions and finding the right page.',
    example: 'Ask CAT what Client Brand Studio is or how to start a project.',
    access: 'Approved public information and the inquiry path, never owner editing, admin or deployment privileges.',
  },
  {
    id: 'public-contact',
    lane: 'visitor',
    title: 'Public answers and contact',
    explanation: 'Visitors can follow real links or submit a business inquiry through the existing website form.',
    example: 'Move from a question to the Contact CX83 page.',
    access: 'The inquiry is stored in the site system. Outbound notification delivery is a separate launch task.',
  },
] as const

type LayerId = (typeof layers)[number]['id']

export function SystemMap() {
  const [selected, setSelected] = useState<LayerId>('authorized-tools')
  const active = layers.find((layer) => layer.id === selected) ?? layers[2]

  return (
    <div className="cx83-system-map" data-testid="cx83-system-map">
      <div className="cx83-system-map-heading">
        <div>
          <p className="cx83-run2-kicker">Inside the CX83 system</p>
          <h2>One website. Two different AI roles.</h2>
        </div>
        <p>Choose any step to see what it does, a practical example, and its access boundary. The two paths stay separate.</p>
      </div>
      <div className="cx83-system-lanes">
        {(['owner', 'visitor'] as const).map((lane) => (
          <section aria-label={lane === 'owner' ? 'Owner software pathway' : 'Visitor assistance pathway'} className="cx83-system-lane" key={lane}>
            <div className="cx83-system-lane-heading">
              <span className={lane === 'owner' ? 'cx83-system-lane-indicator' : 'cx83-system-lane-indicator cx83-system-lane-indicator-violet'} />
              <div>
                <h3>{lane === 'owner' ? 'For the business owner' : 'For website visitors'}</h3>
                <p>{lane === 'owner' ? 'Authorized operations' : 'Public assistance only'}</p>
              </div>
            </div>
            <ol className="cx83-system-nodes">
              {layers.filter((layer) => layer.lane === lane).map((layer, index) => (
                <li key={layer.id}>
                  <button
                    aria-pressed={selected === layer.id}
                    className="cx83-system-node"
                    data-layer={layer.id}
                    onClick={() => setSelected(layer.id)}
                    type="button"
                  >
                    <span className="cx83-system-node-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span>{layer.title}</span>
                    <span className="cx83-system-node-arrow" aria-hidden="true">↗</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <section className="cx83-system-detail" aria-labelledby="cx83-system-current-title" aria-live="polite" data-testid="cx83-system-detail">
        <p className="cx83-run2-kicker">Selected layer</p>
        <h3 id="cx83-system-current-title">{active.title}</h3>
        <p>{active.explanation}</p>
        <dl className="cx83-system-detail-grid">
          <div>
            <dt>For example</dt>
            <dd>{active.example}</dd>
          </div>
          <div>
            <dt>What it can access</dt>
            <dd>{active.access}</dd>
          </div>
        </dl>
      </section>
      <details className="cx83-system-technical">
        <summary>Technical details and optional tool types</summary>
        <p>
          A connected owner AI may use a scoped CMS or source repository connection, approved workflow automation,
          version control, checks and deployment. Optional existing providers can include GitHub, n8n, databases,
          email, document workflows or file systems. No particular third party is automatically included or required.
          The visitor-facing CAT path uses approved public information and contact links, not an owner credential.
        </p>
      </details>
      <div className="cx83-system-map-footer">
        <p>Illustrative customer architecture, based on CX83&apos;s real website workflow. Not a claim that every integration is shipped as a package.</p>
        <Link className="cx83-run2-link" href="/how-it-works">Explore the complete approach <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  )
}
