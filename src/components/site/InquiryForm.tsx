'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { validateInquiry, type InquiryErrors, type InquiryInput } from '@/forms/inquiry'
import { INQUIRY_CONTEXTS, parseInquiryContext, type InquiryContext } from '@/forms/inquiryContext'

const initial: InquiryInput = {
  name: '',
  email: '',
  organization: '',
  inquiryType: 'general',
  message: '',
}

type FieldName = Exclude<keyof InquiryInput, 'context'>

export function InquiryForm({ initialContext = null }: { initialContext?: InquiryContext | null }) {
  const incomingContext = parseInquiryContext(initialContext?.token)
  const incomingToken = incomingContext?.token ?? null
  const [previousIncomingToken, setPreviousIncomingToken] = useState(incomingToken)
  const [values, setValues] = useState<InquiryInput>(() => {
    const context = parseInquiryContext(initialContext?.token)
    return {
      ...initial,
      ...(context ? { inquiryType: context.inquiryType, context: context.token } : {}),
    }
  })
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const requestId = useRef<string | null>(null)
  const requestFingerprint = useRef<string | null>(null)
  const latestIncomingToken = useRef(incomingToken)
  const selectedContext = parseInquiryContext(values.context)

  useEffect(() => {
    if (latestIncomingToken.current !== incomingToken) {
      latestIncomingToken.current = incomingToken
      // A response to the previous Contact query cannot replace the new form.
      requestId.current = null
      requestFingerprint.current = null
    }
  }, [incomingToken])

  // A soft navigation can reuse this component with a different query. Adjust
  // the selection before rendering without remounting or clearing visitor text.
  if (previousIncomingToken !== incomingToken) {
    setPreviousIncomingToken(incomingToken)
    setValues((current) => ({
      ...current,
      inquiryType: incomingContext?.inquiryType || 'general',
      context: incomingContext?.token,
    }))
    setErrors({})
    setStatus('idle')
    setMessage('')
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    // Local validation prevents the prior asynchronous disabled-field race.
    // The same validation still runs on the server and cannot be bypassed.
    const checked = validateInquiry(values)
    setErrors(checked.errors)
    if (!checked.data) {
      setStatus('error')
      setMessage('Please correct the highlighted fields. Nothing has been sent.')
      return
    }

    setStatus('submitting')
    setMessage('')
    const fingerprint = JSON.stringify(checked.data)
    if (requestFingerprint.current !== fingerprint) requestId.current = null
    requestFingerprint.current = fingerprint
    requestId.current ||= crypto.randomUUID()
    const submissionId = requestId.current

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...checked.data, website, requestId: submissionId }),
      })
      const result = await response.json()
      if (requestId.current !== submissionId) return

      if (!response.ok || result.saved !== true) {
        setStatus('error')
        setErrors(result.errors || {})
        setMessage(result.error || 'The inquiry was not saved. Please try again.')
        return
      }
      setStatus('success')
      setMessage(result.message || 'Your inquiry was saved in the CX83 system.')
      setValues(initial)
    } catch {
      if (requestId.current !== submissionId) return
      setStatus('error')
      // Preserve the idempotency key: a retry does not create a second submission.
      setMessage('We could not confirm the save. Please retry using this form.')
    }
  }

  function update(name: FieldName, value: string) {
    // A changed inquiry is a new submission; a retry without edits keeps its old ID.
    requestId.current = null
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === 'inquiryType' && parseInquiryContext(current.context)?.inquiryType !== value
        ? { context: undefined }
        : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'inquiryType' ? { context: undefined } : {}),
    }))
  }

  function updateContext(value: string) {
    const context = parseInquiryContext(value)
    // Selecting or clearing an interest changes the submission fingerprint.
    requestId.current = null
    setValues((current) => ({
      ...current,
      context: context?.token,
      ...(context ? { inquiryType: context.inquiryType } : {}),
    }))
    setErrors((current) => ({ ...current, context: undefined, inquiryType: undefined }))
  }

  if (status === 'success') {
    return (
      <div className="cx83-inquiry-success" role="status">
        <strong>Inquiry saved</strong>
        <p>{message}</p>
        <p className="cx83-inquiry-small">Please keep a copy of any important details for your records.</p>
      </div>
    )
  }

  return (
    <form aria-busy={status === 'submitting'} className="grid gap-5" noValidate onSubmit={onSubmit}>
      <div className="cx83-inquiry-honeypot" aria-hidden="true">
        <label htmlFor="cx83-website-field">Leave this field empty</label>
        <input id="cx83-website-field" tabIndex={-1} autoComplete="off" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>
      <Field error={errors.name} label="Name" name="name">
        <input className="field" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} disabled={status === 'submitting'} maxLength={120} autoComplete="name" id="name" name="name" onChange={(event) => update('name', event.target.value)} required value={values.name} />
      </Field>
      <Field error={errors.email} label="Email" name="email">
        <input className="field" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} disabled={status === 'submitting'} maxLength={200} autoComplete="email" id="email" name="email" onChange={(event) => update('email', event.target.value)} required type="email" value={values.email} />
      </Field>
      <Field error={errors.organization} label="Organization (optional)" name="organization">
        <input className="field" aria-invalid={Boolean(errors.organization)} aria-describedby={errors.organization ? 'organization-error' : undefined} disabled={status === 'submitting'} maxLength={160} autoComplete="organization" id="organization" name="organization" onChange={(event) => update('organization', event.target.value)} value={values.organization} />
      </Field>
      <Field error={errors.inquiryType} label="What can we help with?" name="inquiryType">
        <select className="field" aria-invalid={Boolean(errors.inquiryType)} aria-describedby={errors.inquiryType ? 'inquiryType-error' : undefined} disabled={status === 'submitting'} id="inquiryType" name="inquiryType" onChange={(event) => update('inquiryType', event.target.value)} value={values.inquiryType}>
          <option value="general">General question</option>
          <option value="project">New project or website</option>
          <option value="services">Automation, integrations, or AI workflows</option>
          <option value="software">Software products</option>
        </select>
      </Field>
      <div className="cx83-inquiry-context">
        <Field error={errors.context} label="Specific interest (optional)" name="context">
          <select
            className="field"
            aria-invalid={Boolean(errors.context)}
            aria-describedby={errors.context ? 'context-help context-error' : 'context-help'}
            disabled={status === 'submitting'}
            id="context"
            name="context"
            onChange={(event) => updateContext(event.target.value)}
            value={values.context || ''}
          >
            <option value="">No specific interest</option>
            {INQUIRY_CONTEXTS.map((context) => (
              <option key={context.token} value={context.token}>{context.label}</option>
            ))}
          </select>
        </Field>
        <p className="cx83-inquiry-small" id="context-help">Choose an interest to include with your message, or leave this open.</p>
        {selectedContext ? (
          <div className="cx83-inquiry-context-summary">
            <p aria-live="polite">Selected interest: <strong>{selectedContext.label}</strong></p>
            <button aria-label="Remove selected interest" className="cx83-inquiry-context-clear" disabled={status === 'submitting'} onClick={() => updateContext('')} type="button">Remove</button>
          </div>
        ) : null}
      </div>
      <Field error={errors.message} label="Message" name="message">
        <textarea className="field min-h-36" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} disabled={status === 'submitting'} maxLength={5000} placeholder="What are you trying to build, connect, or make easier?" id="message" name="message" onChange={(event) => update('message', event.target.value)} required value={values.message} />
      </Field>
      {status === 'error' && message ? <p className="cx83-inquiry-error text-sm" role="alert">{message}</p> : null}
      <Button disabled={status === 'submitting'} type="submit">
        {status === 'submitting' ? 'Saving inquiry…' : 'Send inquiry'}
      </Button>
    </form>
  )
}

function Field({ children, error, label, name }: { children: ReactNode; error?: string; label: string; name: string }) {
  return (
    <label className="grid gap-2 text-sm" htmlFor={name}>
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="cx83-field-error" id={name + '-error'}>{error}</span> : null}
    </label>
  )
}
