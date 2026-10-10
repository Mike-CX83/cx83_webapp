import Image from 'next/image'

const examples = [
  {
    id: 'customers',
    title: 'Customers',
    heading: 'From inquiry to follow up.',
    description:
      'Give each inquiry a place to land and a clear next step. Your team reviews the context before following up.',
    image: 'cx83-customer-connections',
    alt: 'Example customer workflow: WordPress inquiry to HubSpot, team review, then Gmail follow up or a Google Calendar reminder. ChatGPT helps summarize the inquiry and prepare a reply.',
    steps: [
      ['Capture', 'A WordPress inquiry becomes a customer record in HubSpot.'],
      ['Review', 'ChatGPT can summarize the inquiry and draft a reply. Your team chooses the next step.'],
      ['Follow up', 'Send through Gmail or schedule a reminder in Google Calendar.'],
    ],
    outcome: 'Leads captured. Follow ups organized.',
    overview: 'WordPress, HubSpot and Gmail help keep customer conversations connected.',
  },
  {
    id: 'marketing',
    title: 'Marketing',
    heading: 'From your ideas to approved posts.',
    description:
      'Use material you already have to prepare content, review it in your own voice and plan what goes out next.',
    image: 'cx83-marketing-connections',
    alt: 'Example marketing workflow: Google Drive content to ChatGPT drafts, human review and approval, then Buffer scheduling to Facebook, Instagram and LinkedIn.',
    steps: [
      ['Prepare', 'Start with your content in Google Drive. ChatGPT helps prepare a draft.'],
      ['Approve', 'You review, edit and approve the content before it goes out.'],
      ['Schedule', 'Buffer schedules approved posts for Facebook, Instagram and LinkedIn.'],
    ],
    outcome: 'Content prepared. Approved posts scheduled.',
    overview: 'Google Drive and ChatGPT help prepare content. Your approval comes before Buffer schedules posts.',
  },
  {
    id: 'operations',
    title: 'Operations',
    heading: 'See the work. Keep it moving.',
    description:
      'Bring scattered files, schedules and progress into view, so your team can find context and decide what needs attention.',
    image: 'cx83-operations-connections',
    alt: 'Example operations map: Google Drive files, Google Sheets tasks and Google Calendar dates connect to a workspace with ChatGPT assistance, a dashboard and team review of next steps.',
    steps: [
      ['Connect', 'Bring Google Drive files, Google Sheets tasks and Google Calendar dates into a connected workspace.'],
      ['Understand', 'Ask ChatGPT for context and draft updates. View work status in your dashboard.'],
      ['Decide', 'Your team reviews the next step and decides what happens.'],
    ],
    outcome: 'Files organized. Work status visible.',
    overview: 'Google Calendar, Sheets and Drive connect to a custom dashboard with ChatGPT assistance.',
  },
] as const

export function ConnectionOverview() {
  return (
    <figure className="cx83-connection-overview" data-testid="connection-overview">
      <Image
        src="/connections/cx83-connections-overview.webp"
        alt="You and your team direct ChatGPT and connected tools across three example branches: Customers, Marketing and Operations. Your team sets direction, reviews and approves."
        width={1536}
        height={1024}
        sizes="(min-width: 1280px) 1152px, calc(100vw - 48px)"
        className="cx83-connection-image"
      />
      <div className="cx83-connection-mobile-text">
        <p className="cx83-connection-team">You set the direction. Your team reviews and approves.</p>
        <ul className="cx83-connection-branches">
          {examples.map((example) => (
            <li key={example.id}>
              <h3>{example.title}</h3>
              <p>{example.overview}</p>
              <strong>{example.outcome}</strong>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="cx83-connection-note">
        Example connections. We choose and test tools for each client.
      </figcaption>
    </figure>
  )
}

export function ConnectionExamples() {
  return (
    <div className="cx83-connection-example-list">
      {examples.map((example, index) => (
        <article className="cx83-connection-example" id={example.id} key={example.id}>
          <div className="cx83-connection-example-heading">
            <div>
              <p className="cx83-run2-eyebrow">0{index + 1} / {example.title}</p>
              <h3>{example.heading}</h3>
            </div>
            <p>{example.description}</p>
          </div>
          <Image
            src={`/connections/${example.image}.webp`}
            alt={example.alt}
            width={1536}
            height={1024}
            sizes="(min-width: 1280px) 1152px, calc(100vw - 48px)"
            className="cx83-connection-image"
          />
          <ol className="cx83-connection-steps cx83-connection-mobile-text">
            {example.steps.map(([label, text]) => (
              <li key={label}><strong>{label}</strong><p>{text}</p></li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  )
}
