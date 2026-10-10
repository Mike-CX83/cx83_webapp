const questions = [
  {
    question: 'Can CX83 connect the software we already use?',
    answer: 'Often, yes. We first check whether your current tools have supported APIs or integration options. We explain any access limitations and provider fees before proposing a connection.',
  },
  {
    question: 'Can an AI actually update my website?',
    answer: 'With an authorized integration, the owner can request changes through a connected AI tool. The underlying workflow still needs permission checks, version control, tests and a configured publishing step. CAT, the visitor assistant on this website, cannot edit or deploy code.',
  },
  {
    question: 'Will we own the software?',
    answer: 'The direction for CX83 software is customer-controlled hosting and the ability to keep using an appropriately licensed copy. The exact distribution rights and supported environments will be set in each approved product release. There is no customer installer available yet.',
  },
  {
    question: 'Is continued CX83 support required?',
    answer: 'Not as a blanket promise or requirement. For supported releases, CX83 intends to separate the product license from optional setup, managed hosting, updates, maintenance and support. Third-party platforms and AI providers may charge their own fees.',
  },
  {
    question: 'How does a project begin?',
    answer: 'Tell us what is difficult or what you would like to build. We look at your existing process, identify a useful first scope, explain the access and approval boundaries, and decide together whether to move forward. You do not need a technical specification.',
  },
]

export function Cx83FAQ() {
  return (
    <section aria-labelledby="cx83-faq-title" className="cx83-faq">
      <p className="cx83-run2-eyebrow">Frequently asked questions</p>
      <h2 className="cx83-run2-section-title" id="cx83-faq-title">Good questions before you start.</h2>
      <p className="cx83-run2-lead">What is possible today, what is still in development and what remains under your control.</p>
      <div className="cx83-faq-list">
        {questions.map(({ question, answer }) => (
          <details key={question} className="cx83-faq-item">
            <summary>{question}<span aria-hidden="true" className="cx83-faq-plus">+</span></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
