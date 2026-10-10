'use client'

import { useState } from 'react'

const layers = [
  { id: 'owner', number: '01', lane: 'owner', label: 'Business owner', heading: 'A real request starts with the owner.', explanation: 'The owner describes the change and chooses what the connected AI is allowed to use.', example: '“Please improve my services page and check the links.”', access: 'May authorize specific accounts, tools and publishing steps.', boundary: 'A chat request never overrides access controls.', technical: 'Owner identity, access scopes, approval rules.' },
  { id: 'ai', number: '02', lane: 'owner', label: 'Connected AI', heading: 'Your supported AI turns an idea into a task.', explanation: 'A configured owner AI can call allowed tools that work with the actual website.', example: 'ChatGPT reads the current page and prepares an authorized change.', access: 'Only its configured tools and permissions.', boundary: 'It is not automatically a site administrator.', technical: 'Authenticated connectors, model interface, role separation.' },
  { id: 'tools', number: '03', lane: 'owner', label: 'Authorized tools', heading: 'The software does the real work.', explanation: 'An approved content or code operation actually happens through a website tool rather than being simulated in chat.', example: 'An authorized edit updates source or published CMS content.', access: 'Specific CMS or code operations enabled for the owner.', boundary: 'Private records, billing and deployment need their own permission.', technical: 'MCP, application APIs, CMS and version history.' },
  { id: 'workflows', number: '04', lane: 'owner', label: 'Business workflows', heading: 'Connect the apps you already use.', explanation: 'Optional approved integrations can pass work between the website and business systems.', example: 'A form stores a record and may trigger an approved workflow.', access: 'Only the external accounts configured by the business.', boundary: 'Email, signing and payments are not included automatically.', technical: 'Optional n8n, API integrations and systems of record.' },
  { id: 'checks', number: '05', lane: 'owner', label: 'Checks and staging', heading: 'Verification separates a request from a release.', explanation: 'Version control, tests, build and deployment checks make the published result traceable.', example: 'This site passed checks before deployment to password-protected staging.', access: 'The assigned build and staging deployment identity.', boundary: 'Passing tests does not authorize a public production launch.', technical: 'Git, TypeScript, Playwright, CI, build SHA and health checks.' },
  { id: 'control', number: '06', lane: 'owner', label: 'Your accounts and data', heading: 'Keep control of your working systems.', explanation: 'The product direction is supported customer-controlled software, accounts and hosting.', example: 'Keep your approved hosting and records as the systems of record.', access: 'Customer-defined data, access and hosting controls.', boundary: 'Actual rights, compatibility, upgrades and external fees require release terms.', technical: 'Hosting, backups, licenses, secrets management and maintenance.' },
  { id: 'cat', number: '07', lane: 'visitor', label: 'Visitor CAT', heading: 'CAT helps visitors without owner access.', explanation: 'The CX83 visitor assistant answers from approved public information and points to contact.', example: '“What is Brand Studio?” CAT can describe its development status.', access: 'Approved public CX83 descriptions, links and inquiry guidance.', boundary: 'Cannot edit source, deploy, bill or read private inquiries.', technical: 'Public knowledge, server-side transport and visitor role boundary.' },
] as const

export function SystemsMap() {
  const [selected, setSelected] = useState<string>('ai')
  const active = layers.find((layer) => layer.id === selected) ?? layers[1]
  const renderButton = (layer: typeof layers[number]) => (
    <button
      aria-controls="cx83-systems-active-detail"
      aria-pressed={active.id === layer.id}
      className="cx83-systems-node"
      data-active={active.id === layer.id}
      data-testid="systems-layer"
      key={layer.id}
      onClick={() => setSelected(layer.id)}
      type="button"
    >
      <span className="cx83-systems-node-index" aria-hidden="true">{layer.number}</span>
      <span>{layer.label}</span>
      <span className="cx83-systems-node-arrow" aria-hidden="true">↗</span>
    </button>
  )
  return (
    <div className="cx83-systems-map" data-testid="systems-map">
      <div className="cx83-systems-lanes">
        <div className="cx83-systems-lane">
          <div className="cx83-systems-lane-heading">
            <h3>Owner AI: request to verified change</h3>
            <p>Scoped tools, real operations, checks and hosting choices</p>
          </div>
          <div className="cx83-systems-owner-nodes">{layers.filter((layer) => layer.lane === 'owner').map(renderButton)}</div>
        </div>
        <div className="cx83-systems-lane cx83-systems-visitor-lane">
          <div className="cx83-systems-lane-heading">
            <h3>Visitor CAT: public guidance</h3>
            <p>A separate assistant with no owner tools</p>
          </div>
          <div className="cx83-systems-visitor-node">{layers.filter((layer) => layer.lane === 'visitor').map(renderButton)}</div>
          <p className="cx83-systems-boundary">Permission boundary: CAT cannot edit, deploy or access customer records.</p>
        </div>
      </div>
      <div aria-live="polite" className="cx83-systems-active-detail" data-testid="systems-active-detail" id="cx83-systems-active-detail">
        <p className="cx83-systems-eyebrow">Selected layer / {active.number}</p>
        <h3>{active.heading}</h3>
        <p>{active.explanation}</p>
        <dl className="cx83-systems-detail-grid">
          <div><dt>Example</dt><dd>{active.example}</dd></div>
          <div><dt>Allowed access</dt><dd>{active.access}</dd></div>
          <div><dt>Boundary</dt><dd>{active.boundary}</dd></div>
        </dl>
        <details className="cx83-systems-technical">
          <summary>Technical detail for this layer</summary>
          <p>{active.technical}</p>
          <p>Examples such as GitHub, n8n, a CMS, email and payment services are optional third-party integrations, not included CX83 products.</p>
        </details>
      </div>
      <p className="cx83-systems-instructions">Choose a layer by mouse, touch or keyboard. This is a model of approved connections, not a claim every optional service is deployed.</p>
    </div>
  )
}
