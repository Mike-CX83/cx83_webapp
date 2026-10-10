import Link from 'next/link'

const principles = [
  {
    label: 'Your software',
    detail: 'A supported customer edition is intended to give you usable licensed application files and a documented way to keep operating it.',
  },
  {
    label: 'Your accounts and hosting',
    detail: 'Run on a supported customer-controlled environment, or choose an optional managed service with clearly defined responsibilities.',
  },
  {
    label: 'Your approved AI connection',
    detail: 'Authorize supported AI tools for the jobs you permit. Keep visitor assistance separate from privileged software operations.',
  },
  {
    label: 'Your next change',
    detail: 'Retain documented workflows, source history and the option to improve the system after the original setup.',
  },
] as const

export function OwnershipSection() {
  return (
    <div className="cx83-ownership" data-testid="cx83-ownership">
      <div className="cx83-ownership-intro">
        <div>
          <p className="cx83-run2-kicker">The CX83 product direction</p>
          <h2>Software you can keep. Systems you can grow.</h2>
        </div>
        <div>
          <p>Our goal is to build software businesses can control, operate and improve with their own supported tools, without a compulsory CX83 subscription solely to keep using an already licensed version.</p>
          <p>This is a product design principle, not a currently offered perpetual license or a promise of free hosting.</p>
        </div>
      </div>
      <div className="cx83-ownership-grid">
        {principles.map((principle, index) => (
          <article className="cx83-ownership-card" key={principle.label}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <h3>{principle.label}</h3>
            <p>{principle.detail}</p>
          </article>
        ))}
      </div>
      <div className="cx83-ownership-bottom">
        <p>Hosting, model usage, third-party APIs, updates and optional managed support may carry separate costs. Product licenses, compatibility and distribution terms will be confirmed before release.</p>
        <Link className="cx83-run2-link" href="/software/connected-websites">Explore the platform <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  )
}
