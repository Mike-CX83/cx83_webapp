'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

type FieldName = 'name' | 'email' | 'organization' | 'inquiryType' | 'message'

const initial = {
  name: '',
  email: '',
  organization: '',
  inquiryType: 'project',
  message: '',
}

export function InquiryForm() {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrors({})
    setMessage('')

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const result = await response.json()

      if (!response.ok) {
        setStatus('error')
        setErrors(result.errors || {})
        setMessage(result.error || 'The inquiry was not saved.')
        return
      }

      setStatus('success')
      setMessage(result.message || 'Your inquiry was saved.')
      setValues(initial)
    } catch {
      setStatus('error')
      setMessage('The inquiry could not be sent.')
    }
  }

  function update(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  if (status === 'success') {
    return (
      <p className="rounded-lg border border-border bg-card px-4 py-4 text-sm" role="status">
        {message}
      </p>
    )
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={onSubmit}>
      <Field error={errors.name} label="Name" name="name">
        <input
          className="field"
          id="name"
          name="name"
          onChange={(event) => update('name', event.target.value)}
          required
          value={values.name}
        />
      </Field>
      <Field error={errors.email} label="Email" name="email">
        <input
          className="field"
          id="email"
          name="email"
          onChange={(event) => update('email', event.target.value)}
          required
          type="email"
          value={values.email}
        />
      </Field>
      <Field error={errors.organization} label="Organization" name="organization">
        <input
          className="field"
          id="organization"
          name="organization"
          onChange={(event) => update('organization', event.target.value)}
          value={values.organization}
        />
      </Field>
      <Field error={errors.inquiryType} label="Inquiry" name="inquiryType">
        <select
          className="field"
          id="inquiryType"
          name="inquiryType"
          onChange={(event) => update('inquiryType', event.target.value)}
          value={values.inquiryType}
        >
          <option value="general">General contact</option>
          <option value="project">Project inquiry</option>
        </select>
      </Field>
      <Field error={errors.message} label="Message" name="message">
        <textarea
          className="field min-h-36"
          id="message"
          name="message"
          onChange={(event) => update('message', event.target.value)}
          required
          value={values.message}
        />
      </Field>
      {status === 'error' && message ? (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
      <Button disabled={status === 'submitting'} type="submit">
        {status === 'submitting' ? 'Sending' : 'Send inquiry'}
      </Button>
    </form>
  )
}

function Field({
  children,
  error,
  label,
  name,
}: {
  children: ReactNode
  error?: string
  label: string
  name: string
}) {
  return (
    <label className="grid gap-2 text-sm" htmlFor={name}>
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="text-destructive">{error}</span> : null}
    </label>
  )
}
