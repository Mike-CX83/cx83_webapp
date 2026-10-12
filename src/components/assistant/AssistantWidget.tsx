'use client'

import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/ai-sdk'
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { conversationStarters } from '@/content/assistantNavigation'
import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react'
import remarkGfm from 'remark-gfm'
import { safeAssistantHref } from '@/ai/visitorAnswer'
import { CatSubmissionReview, type CatReview } from './CatSubmissionReview'

const CatReportContext = createContext<(id: string) => void>(() => undefined)
const CatNavigationContext = createContext<() => void>(() => undefined)
function publicText(content: readonly { type: string; text?: string }[]): string {
  return content.filter((part) => part.type === 'text').map((part) => part.text || '').join('\n')
}

export function AssistantWidget() {
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const [session, setSession] = useState(0)
  const [open, setOpen] = useState(false)

  return (
    <AssistantSession
      key={session}
      returnFocusRef={returnFocusRef}
      open={open}
      onOpenChange={setOpen}
      onReset={() => setSession((value) => value + 1)}
    />
  )
}

function AssistantSession({
  open,
  onOpenChange,
  onReset,
  returnFocusRef,
}: {
  returnFocusRef: { current: HTMLElement | null }
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset: () => void
}) {
  const pathname = usePathname()
  const starters = conversationStarters(pathname)
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: '/api/chat' }),
  })
  const launcherRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<'checking' | 'configured' | 'unavailable'>('checking')
  const [review, setReview] = useState<CatReview | null>(null)
  const openReport = (id: string) => {
    const messages = runtime.thread.getState().messages
    const index = messages.findIndex((message) => message.id === id)
    const answer = messages[index]
    if (!answer || answer.role !== 'assistant') return
    const question = messages.slice(0, index).reverse().find((message) => message.role === 'user')
    setReview({ type: 'report', question: question ? publicText(question.content) : '', answer: publicText(answer.content) })
  }
  const openPlan = () => {
    const messages = runtime.thread.getState().messages
    const last = [...messages].reverse().find((message) => message.role === 'assistant')
    setReview({ type: 'plan', draft: last ? publicText(last.content) : '' })
  }
  const draftPlan = () => {
    setReview(null)
    runtime.thread.append({ role: 'user', content: [{ type: 'text', text: 'Help me draft a preliminary project plan using our conversation. Include goal, current tools, requirements, constraints and open questions. If information is missing, ask one useful question first. Do not invent CX83 prices or delivery promises.' }] })
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/assistant-status', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Cat status check failed')
        return response.json()
      })
      .then((result: { configured?: boolean; enabled?: boolean }) => {
        setStatus(result.configured && result.enabled ? 'configured' : 'unavailable')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('unavailable')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const openFromNavigation = () => {
      delete document.documentElement.dataset.cx83CatRequested
      if (!open && document.activeElement instanceof HTMLElement) returnFocusRef.current = document.activeElement
      onOpenChange(true)
    }
    window.addEventListener('cx83:open-cat', openFromNavigation)
    if (document.documentElement.dataset.cx83CatRequested === 'true') openFromNavigation()
    return () => window.removeEventListener('cx83:open-cat', openFromNavigation)
  }, [onOpenChange, open, returnFocusRef])

  const restoreFocus = useCallback(() => {
    const target = returnFocusRef.current
    if (target?.isConnected && target.getClientRects().length) target.focus()
    else {
      const menu = document.querySelector<HTMLButtonElement>('.cx83-site-menu-button')
      if (menu?.getClientRects().length) menu.focus()
      else launcherRef.current?.focus()
    }
  }, [returnFocusRef])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
        restoreFocus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, onOpenChange, restoreFocus])

  const close = () => {
    onOpenChange(false)
    restoreFocus()
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <CatReportContext.Provider value={openReport}>
      <CatNavigationContext.Provider value={() => onOpenChange(false)}>
      <button
        ref={launcherRef}
        aria-controls="cx83-assistant"
        aria-expanded={open}
        aria-label={open ? 'Close Cat' : 'Ask Cat'}
        className="cx83-assistant-launcher"
        onClick={(event) => {
          if (open) close()
          else {
            returnFocusRef.current = event.currentTarget
            onOpenChange(true)
          }
        }}
        type="button"
      >
        <Image src="/brand/symbol-showcase.svg" alt="" aria-hidden="true" width={25} height={25} />
        <span>{open ? 'Close Cat' : 'Ask Cat'}</span>
      </button>
      {(
        <section
          aria-label="Cat, the CX83 Labs AI assistant"
          aria-modal="false"
          className="cx83-assistant-panel"
          id="cx83-assistant"
          role="dialog"
          style={open ? undefined : { display: 'none' }}
          aria-hidden={!open}
        >
          <header className="cx83-cat-header">
            <span className="cx83-cat-symbol">
              <Image src="/brand/symbol-showcase.svg" alt="" aria-hidden="true" width={37} height={37} />
            </span>
            <div className="cx83-cat-heading">
              <h2 id="cx83-assistant-title">Cat <span> / CX83 Labs AI Assistant</span></h2>
              <p className="cx83-cat-status" role="status">
                <span aria-hidden="true" className={'cx83-cat-status-dot cx83-cat-status-' + status} />
                {status === 'checking' ? 'Checking connection' : status === 'configured' ? 'Assistant configured' : 'Assistant temporarily unavailable'}
              </p>
            </div>
            <button ref={closeRef} aria-label="Close Cat" className="cx83-cat-close" onClick={close} type="button">×</button>
          </header>
          {review ? <CatSubmissionReview key={review.type} review={review} onCancel={() => setReview(null)} onDraft={draftPlan} /> : <ThreadPrimitive.Root className="cx83-cat-thread">
            <ThreadPrimitive.Viewport className="cx83-cat-messages" turnAnchor="top" scrollToBottomOnInitialize={false}>
              <ThreadPrimitive.Empty>
                <div className="cx83-cat-welcome">
                  <p className="cx83-cat-welcome-label">Welcome to CX83</p>
                  <h3>What can we help you explore?</h3>
                  <p>Hi, I’m Cat. I can help you explore our services, learn about the software we’re building, and understand how CX83 connects business tools. Choose a topic below or ask me anything about CX83.</p>
                  <div aria-label="Conversation starters" className="cx83-cat-starters">
                    {starters.map((prompt) => (
                      <ThreadPrimitive.Suggestion className="cx83-cat-starter" key={prompt} prompt={prompt} send>
                        {prompt} <span aria-hidden="true">↗</span>
                      </ThreadPrimitive.Suggestion>
                    ))}
                  </div>
                  {status === 'unavailable' ? <p className="cx83-cat-unavailable" role="status">Cat cannot respond right now. You can still reach CX83 through the contact page.</p> : null}
                </div>
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
              <ThreadPrimitive.If running>
                <p className="cx83-cat-typing" role="status">Cat is composing a reply…</p>
              </ThreadPrimitive.If>
            </ThreadPrimitive.Viewport>
            <ComposerPrimitive.Root className="cx83-cat-composer">
              <ComposerPrimitive.Input
                aria-label="Message Cat"
                className="cx83-cat-input"
                placeholder="Ask Cat about CX83…"
                rows={2}
                maxLength={2000}
              />
              <p className="cx83-cat-review-note">AI processes this chat. Avoid sensitive information. CX83 saves only submissions you choose to send.</p>
              <div className="cx83-cat-composer-actions">
                <button className="cx83-cat-reset" onClick={onReset} type="button">New conversation</button>
                <ThreadPrimitive.If running>
                  <ComposerPrimitive.Cancel className="cx83-cat-stop" type="button">Stop</ComposerPrimitive.Cancel>
                </ThreadPrimitive.If>
                <ThreadPrimitive.If running={false}>
                  <ComposerPrimitive.Send className="cx83-cat-send">Send <span aria-hidden="true">↗</span></ComposerPrimitive.Send>
                </ThreadPrimitive.If>
              </div>
            </ComposerPrimitive.Root>
          </ThreadPrimitive.Root>}
          <footer className="cx83-cat-footer">
            <span className="cx83-cat-footer-intro">Have a project in mind? We would like to hear about it.</span>
            <button className="cx83-cat-inline-action" onClick={() => setReview({ type: 'privacy' })} type="button">Chat privacy</button>
            <button className="cx83-cat-inline-action" onClick={openPlan} type="button">Review and send a plan</button>
            <Link href="/contact" onClick={() => onOpenChange(false)}>Contact CX83 <span aria-hidden="true">↗</span></Link>
          </footer>
        </section>
      )}
      </CatNavigationContext.Provider>
      </CatReportContext.Provider>
    </AssistantRuntimeProvider>
  )
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="cx83-cat-user-message">
      <MessagePrimitive.Content />
    </MessagePrimitive.Root>
  )
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="cx83-cat-assistant-message">
      <MessagePrimitive.Content components={{ Text: AssistantMarkdown }} />
      <CatReportAction />
      <MessagePrimitive.Error>
        <p className="cx83-cat-unavailable" role="alert">
          Cat could not complete that reply. Please retry, or contact CX83 using the link below.
        </p>
      </MessagePrimitive.Error>
    </MessagePrimitive.Root>
  )
}

function CatReportAction() {
  const report = useContext(CatReportContext)
  const id = useAuiState((state) => state.message.id)
  return <ThreadPrimitive.If running={false}><button className="cx83-cat-report-action" onClick={() => report(id)} type="button">Report a problem</button></ThreadPrimitive.If>
}

function AssistantMarkdown() {
  const close = useContext(CatNavigationContext)
  return <MarkdownTextPrimitive className="prose prose-sm prose-invert max-w-none" remarkPlugins={[remarkGfm]} components={{
    a: ({ href, children }) => {
      const safe = safeAssistantHref(href)
      return safe?.startsWith('/') ? <Link href={safe} onClick={close}>{children}</Link> : safe ? <a href={safe}>{children}</a> : <span>{children}</span>
    },
  }} />
}

