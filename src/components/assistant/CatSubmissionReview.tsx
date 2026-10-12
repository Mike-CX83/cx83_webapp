'use client'

import { useEffect, useRef, useState } from 'react'
import { minimizeDiagnosticText } from '@/ai/catPrivacy'

export type CatReview = { type: 'report'; question: string; answer: string } | { type: 'plan'; draft: string } | { type: 'privacy' }

export function CatSubmissionReview({ review, onCancel, onDraft }: { review: CatReview; onCancel: () => void; onDraft: () => void }) {
  const [details, setDetails] = useState('')
  const [plan, setPlan] = useState(review.type === 'plan' ? review.draft.slice(0, 4500) : '')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [includeExchange, setIncludeExchange] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [notice, setNotice] = useState('')
  const request = useRef<{ fingerprint: string; id: string } | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [review.type, status])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!confirmed || status === 'saving' || review.type === 'privacy') return
    const body = review.type === 'report'
      ? { confirmed, details, includeExchange, ...(includeExchange ? { question: minimizeDiagnosticText(review.question), answer: minimizeDiagnosticText(review.answer) } : {}) }
      : { confirmed, plan, name, email, organization }
    const fingerprint = JSON.stringify(body)
    if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() }
    setStatus('saving'); setNotice('')
    try {
      const response = await fetch(review.type === 'report' ? '/api/cat-reports' : '/api/cat-plans', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, requestId: request.current.id }),
        signal: AbortSignal.timeout(30_000),
      })
      const result = await response.json()
      if (!response.ok || result.saved !== true) throw new Error(result.error || 'The submission was not saved. Please retry.')
      setStatus('saved'); setNotice(result.message)
    } catch (error) {
      setStatus('idle')
      setNotice(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'We could not confirm the save. Retry without editing to avoid a duplicate.')
    }
  }

  if (review.type === 'privacy') return (
    <div className="cx83-cat-review">
      <h3 ref={heading} tabIndex={-1}>Chat privacy</h3>
      <p>Your messages and recent conversation context are sent to our configured AI provider to answer you. Avoid passwords, patient records, financial account details and other sensitive information.</p>
      <p>CX83 does not save a general chat archive in this application. A problem report saves your optional note, plus the selected question and answer only if you choose to attach them. Common contact details and credentials are removed from attached text; remove any other sensitive information yourself before sending.</p>
      <p>Reports expire after 30 days. Submitted preliminary project plans and optional contact details expire after 90 days. They are available only to authorized CX83 reviewers. Expired contents are hidden on read and removed during the next retention cleanup. Server backups have a separate rotation cycle.</p>
      <p>The AI provider processes chat messages under its own data policies. We do not promise that provider or server backup retention matches these application periods.</p>
      <p>To discuss your submission or request removal, email <a href="mailto:hello@cx83labs.com">hello@cx83labs.com</a>.</p>
      <button className="cx83-cat-review-button" onClick={onCancel} type="button">Back to chat</button>
    </div>
  )
  if (status === 'saved') return (
    <div className="cx83-cat-review" role="status">
      <h3 ref={heading} tabIndex={-1}>{review.type === 'report' ? 'Report saved' : 'Plan saved'}</h3>
      <p>{notice}</p>
      <p>{review.type === 'report' ? 'Thank you for helping improve Cat.' : 'A saved plan is an inquiry. CX83 must separately agree to scope, pricing and timing.'}</p>
      <button className="cx83-cat-review-button" onClick={onCancel} type="button">Back to chat</button>
    </div>
  )
  return (
    <form className="cx83-cat-review" onSubmit={submit} aria-busy={status === 'saving'}>
      <h3 ref={heading} tabIndex={-1}>{review.type === 'report' ? 'Report a problem' : 'Review your preliminary plan'}</h3>
      <p>{review.type === 'report' ? 'Flag an incorrect or unusual answer for CX83 to review. Do not include sensitive information.' : 'Review and edit before submitting. Include your goal, current tools, requirements, constraints and open questions. Budget and timeline preferences are yours, and require CX83 agreement.'}</p>
      {review.type === 'report' ? <>
        <label>Details (optional)<textarea value={details} maxLength={1000} rows={3} onChange={(e) => { setDetails(e.target.value); setConfirmed(false) }} disabled={status === 'saving'} /></label>
        <label className="cx83-cat-check"><input type="checkbox" checked={includeExchange} onChange={(e) => { setIncludeExchange(e.target.checked); setConfirmed(false) }} disabled={status === 'saving'} /> Attach this question and answer</label>
        {includeExchange ? <div className="cx83-cat-exchange-preview"><strong>Preview of attached exchange</strong><p>{minimizeDiagnosticText(review.question)}</p><p>{minimizeDiagnosticText(review.answer)}</p></div> : null}
      </> : <>
        <button className="cx83-cat-inline-action" type="button" disabled={status === 'saving'} onClick={onDraft}>Ask Cat to draft a plan</button>
        <label>Preliminary project plan<textarea value={plan} required minLength={20} maxLength={4500} rows={8} placeholder="Goal, current tools, requirements, constraints, and open questions" onChange={(e) => { setPlan(e.target.value); setConfirmed(false) }} disabled={status === 'saving'} /></label>
        <label>Name (optional)<input value={name} maxLength={120} onChange={(e) => { setName(e.target.value); setConfirmed(false) }} disabled={status === 'saving'} autoComplete="name" /></label>
        <label>Email (optional)<input value={email} type="email" maxLength={200} onChange={(e) => { setEmail(e.target.value); setConfirmed(false) }} disabled={status === 'saving'} autoComplete="email" /></label>
        <label>Organization (optional)<input value={organization} maxLength={160} onChange={(e) => { setOrganization(e.target.value); setConfirmed(false) }} disabled={status === 'saving'} autoComplete="organization" /></label>
        <p>Without contact details, CX83 can review the plan but cannot reply to you directly.</p>
      </>}
      <p className="cx83-cat-review-note">{review.type === 'report' ? 'Reports expire after 30 days. Attaching an exchange is optional.' : 'Plans and contact details expire after 90 days.'} Only authorized CX83 reviewers can access submissions.</p>
      <label className="cx83-cat-check"><input type="checkbox" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} disabled={status === 'saving'} /> {review.type === 'report' ? 'I confirm this report may be sent to CX83.' : 'I reviewed this plan and confirm it may be sent to CX83.'}</label>
      {notice ? <p role="alert">{notice}</p> : null}
      <div className="cx83-cat-review-actions">
        <button type="button" onClick={onCancel} disabled={status === 'saving'}>Cancel</button>
        <button className="cx83-cat-review-button" type="submit" disabled={!confirmed || status === 'saving'}>{status === 'saving' ? 'Saving…' : review.type === 'report' ? 'Send report' : 'Submit preliminary plan'}</button>
      </div>
    </form>
  )
}
