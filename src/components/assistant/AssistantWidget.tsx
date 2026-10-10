'use client'

import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/ai-sdk'
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import remarkGfm from 'remark-gfm'

const starters = [
  'How can AI update a website?',
  'What is Client Brand Studio?',
  'Can CX83 connect my current tools?',
  'How do I start a project?',
] as const

// The URL fragment preserves an Ask CAT request made while React is still hydrating.
function clearCatHash() {
  if (window.location.hash === '#ask-cat') {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
  }
}

export function AssistantWidget() {
  const [session, setSession] = useState(0)
  const [open, setOpen] = useState(false)

  return (
    <AssistantSession
      key={session}
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset: () => void
}) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: '/api/chat' }),
  })
  const launcherRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<'checking' | 'configured' | 'unavailable'>('checking')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/assistant-status', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('CAT status check failed')
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
    const openFromNavigation = () => onOpenChange(true)
    const openFromHash = () => {
      if (window.location.hash === '#ask-cat') onOpenChange(true)
    }
    window.addEventListener('cx83:open-cat', openFromNavigation)
    window.addEventListener('hashchange', openFromHash)
    // Header events can fire before this component finishes hydrating.
    openFromHash()
    return () => {
      window.removeEventListener('cx83:open-cat', openFromNavigation)
      window.removeEventListener('hashchange', openFromHash)
    }
  }, [onOpenChange])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
        clearCatHash()
        launcherRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, onOpenChange])

  const close = () => {
    onOpenChange(false)
    clearCatHash()
    launcherRef.current?.focus()
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <button
        ref={launcherRef}
        aria-controls="cx83-assistant"
        aria-expanded={open}
        aria-label={open ? 'Close CAT' : 'Ask CAT'}
        className="cx83-assistant-launcher"
        onClick={() => {
          if (open) clearCatHash()
          onOpenChange(!open)
        }}
        type="button"
      >
        <Image src="/brand/symbol-showcase.svg" alt="" aria-hidden="true" width={25} height={25} />
        <span>{open ? 'Close CAT' : 'Ask CAT'}</span>
      </button>
      {open ? (
        <section
          aria-label="CAT, CX83 Labs AI Assistant"
          aria-labelledby="cx83-assistant-title"
          aria-modal="false"
          className="cx83-assistant-panel"
          id="cx83-assistant"
          role="dialog"
        >
          <header className="cx83-cat-header">
            <span className="cx83-cat-symbol">
              <Image src="/brand/symbol-showcase.svg" alt="" aria-hidden="true" width={37} height={37} />
            </span>
            <div className="cx83-cat-heading">
              <p className="cx83-cat-eyebrow">Catalyst X83</p>
              <h2 id="cx83-assistant-title">CAT <span> / CX83 Labs AI Assistant</span></h2>
              <p className="cx83-cat-status" role="status">
                <span aria-hidden="true" className={'cx83-cat-status-dot cx83-cat-status-' + status} />
                {status === 'checking' ? 'Checking connection' : status === 'configured' ? 'Assistant configured' : 'Assistant temporarily unavailable'}
              </p>
            </div>
            <button ref={closeRef} aria-label="Close CAT" className="cx83-cat-close" onClick={close} type="button">×</button>
          </header>
          <ThreadPrimitive.Root className="cx83-cat-thread">
            <ThreadPrimitive.Viewport className="cx83-cat-messages">
              <ThreadPrimitive.Empty>
                <div className="cx83-cat-welcome">
                  <p className="cx83-cat-welcome-label">Welcome to CX83</p>
                  <h3>What can we help you explore?</h3>
                  <p>Hi, I’m CAT. I can explain our website, the software we are developing, and how CX83 connects business tools. I cannot change this website or access private business data.</p>
                  <div aria-label="Conversation starters" className="cx83-cat-starters">
                    {starters.map((prompt) => (
                      <ThreadPrimitive.Suggestion className="cx83-cat-starter" key={prompt} prompt={prompt} send>
                        {prompt} <span aria-hidden="true">↗</span>
                      </ThreadPrimitive.Suggestion>
                    ))}
                  </div>
                  {status === 'unavailable' ? <p className="cx83-cat-unavailable" role="status">CAT cannot respond right now. You can still reach CX83 through the contact page.</p> : null}
                </div>
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
              <ThreadPrimitive.If running>
                <p className="cx83-cat-typing" role="status">CAT is composing a reply…</p>
              </ThreadPrimitive.If>
            </ThreadPrimitive.Viewport>
            <ComposerPrimitive.Root className="cx83-cat-composer">
              <ComposerPrimitive.Input
                aria-label="Message CAT"
                className="cx83-cat-input"
                placeholder="Ask CAT about CX83…"
                rows={2}
              />
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
          </ThreadPrimitive.Root>
          <footer className="cx83-cat-footer">
            <span>CAT shares public information, not account access.</span>
            <Link href="/contact" onClick={() => onOpenChange(false)}>Contact CX83 <span aria-hidden="true">↗</span></Link>
          </footer>
        </section>
      ) : null}
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
      <MessagePrimitive.Error>
        <p className="cx83-cat-unavailable" role="alert">
          CAT could not complete that reply. Please retry, or contact CX83 using the link below.
        </p>
      </MessagePrimitive.Error>
    </MessagePrimitive.Root>
  )
}

function AssistantMarkdown() {
  return <MarkdownTextPrimitive className="prose prose-sm prose-invert max-w-none" remarkPlugins={[remarkGfm]} />
}
