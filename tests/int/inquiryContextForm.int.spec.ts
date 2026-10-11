import { createElement } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InquiryForm } from '@/components/site/InquiryForm'
import { parseInquiryContext } from '@/forms/inquiryContext'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function fillVisitor() {
  fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Synthetic Visitor' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'visitor@example.invalid' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: 'Keep my exact typed message.' } })
}

describe('inquiry form query updates', () => {
  it('updates the interest on the same mounted form and preserves visitor text', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Synthetic ambiguous save'))
    vi.stubGlobal('fetch', fetchMock)
    const view = render(createElement(InquiryForm, { initialContext: parseInquiryContext('websites-and-business-tools') }))
    fillVisitor()
    const messageInput = screen.getByRole('textbox', { name: 'Message' })
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('could not confirm the save'))

    for (const [token, category] of [
      ['automation-and-integrations', 'services'],
      ['ai-setup-and-workflows', 'services'],
      ['connected-websites', 'software'],
      ['client-brand-studio', 'software'],
    ]) {
      view.rerender(createElement(InquiryForm, { initialContext: parseInquiryContext(token) }))
      expect(screen.getByRole('textbox', { name: 'Message' })).toBe(messageInput)
      expect((messageInput as HTMLTextAreaElement).value).toBe('Keep my exact typed message.')
      expect((screen.getByLabelText('What can we help with?') as HTMLSelectElement).value).toBe(category)
      expect((screen.getByLabelText('Specific interest (optional)') as HTMLSelectElement).value).toBe(token)
      expect(screen.queryByRole('alert')).toBeNull()
    }
    view.rerender(createElement(InquiryForm, { initialContext: null }))
    expect((screen.getByLabelText('What can we help with?') as HTMLSelectElement).value).toBe('general')
    expect((screen.getByLabelText('Specific interest (optional)') as HTMLSelectElement).value).toBe('')
    expect((messageInput as HTMLTextAreaElement).value).toBe('Keep my exact typed message.')
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const first = JSON.parse(fetchMock.mock.calls[0][1].body)
    const second = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(second.requestId).not.toBe(first.requestId)
    expect(second.context).toBeUndefined()
    expect(second.message).toBe(first.message)
  })

  it('opens a fresh form when a new Contact query follows a saved inquiry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ saved: true })))
    const view = render(createElement(InquiryForm, { initialContext: parseInquiryContext('connected-websites') }))
    fillVisitor()
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Inquiry saved'))
    view.rerender(createElement(InquiryForm, { initialContext: parseInquiryContext('client-brand-studio') }))
    expect(screen.queryByRole('status')).toBeNull()
    expect((screen.getByLabelText('Specific interest (optional)') as HTMLSelectElement).value).toBe('client-brand-studio')
    expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('')
  })

  it('ignores a pending response from the previous Contact query', async () => {
    let finish: ((response: Response) => void) | undefined
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { finish = resolve })))
    const view = render(createElement(InquiryForm, { initialContext: parseInquiryContext('connected-websites') }))
    fillVisitor()
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }))
    expect((screen.getByRole('button', { name: 'Saving inquiry…' }) as HTMLButtonElement).disabled).toBe(true)
    view.rerender(createElement(InquiryForm, { initialContext: parseInquiryContext('ai-setup-and-workflows') }))
    await act(async () => { finish?.(Response.json({ saved: true })) })
    expect(screen.queryByRole('status')).toBeNull()
    expect((screen.getByLabelText('Specific interest (optional)') as HTMLSelectElement).value).toBe('ai-setup-and-workflows')
    expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('Keep my exact typed message.')
  })
})
