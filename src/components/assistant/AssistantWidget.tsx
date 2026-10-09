'use client'

import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/ai-sdk'
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import { useEffect, useState } from 'react'
import remarkGfm from 'remark-gfm'

export function AssistantWidget() {
  const [session, setSession] = useState(0)

  return <AssistantSession key={session} onReset={() => setSession((value) => value + 1)} />
}

function AssistantSession({ onReset }: { onReset: () => void }) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: '/api/chat' }),
  })
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'unknown' | 'live' | 'unconfigured'>('unknown')
  const [statusDetail, setStatusDetail] = useState('Checking assistant status.')

  useEffect(() => {
    let cancelled = false
    fetch('/api/assistant-status')
      .then((response) => response.json())
      .then((result: { configured?: boolean; configurationError?: string | null }) => {
        if (cancelled) return
        if (result.configured) {
          setStatus('live')
          setStatusDetail('Connected through the server.')
          return
        }
        setStatus('unconfigured')
        setStatusDetail(result.configurationError || 'The selected AI provider is not configured.')
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('unconfigured')
          setStatusDetail('Assistant status could not be checked.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <button
        aria-controls="cx83-assistant"
        aria-expanded={open}
        className="cx83-assistant-launcher fixed right-4 bottom-4 z-50 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground cx83-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? 'Close chat' : 'Ask CX83'}
      </button>
      {open ? (
        <section
          aria-label="CX83 assistant"
          className="cx83-assistant-panel fixed inset-x-3 bottom-20 z-50 flex h-[min(36rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card cx83-shadow md:inset-x-auto md:right-4 md:w-[24rem]"
          id="cx83-assistant"
          role="dialog"
        >
          <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">CX83 assistant</p>
              <p className="text-xs text-muted-foreground">{status === 'unknown' ? 'Checking assistant status.' : statusDetail}</p>
            </div>
            <button
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              onClick={onReset}
              type="button"
            >
              Reset
            </button>
          </header>
          <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
            <ThreadPrimitive.Viewport className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <ThreadPrimitive.Empty>
                <p className="text-sm leading-6 text-muted-foreground">
                  Ask what CX83 Labs builds, describe a business problem, or ask how to start a project.
                </p>
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages
                components={{
                  UserMessage: UserMessage,
                  AssistantMessage: AssistantMessage,
                }}
              />
              <ThreadPrimitive.If running>
                <p className="text-xs text-muted-foreground">CX83 is responding.</p>
              </ThreadPrimitive.If>
            </ThreadPrimitive.Viewport>
            <ComposerPrimitive.Root className="border-t border-border p-3">
              <ComposerPrimitive.Input
                aria-label="Message"
                className="field max-h-32 min-h-12 resize-y"
                placeholder="Ask about a service or a project"
                rows={2}
              />
              <div className="mt-2 flex justify-end gap-2">
                <ThreadPrimitive.If running>
                  <ComposerPrimitive.Cancel className="rounded-md border border-border px-3 py-2 text-sm" type="button">
                    Stop
                  </ComposerPrimitive.Cancel>
                </ThreadPrimitive.If>
                <ThreadPrimitive.If running={false}>
                  <ComposerPrimitive.Send className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">
                    Send
                  </ComposerPrimitive.Send>
                </ThreadPrimitive.If>
              </div>
            </ComposerPrimitive.Root>
          </ThreadPrimitive.Root>
        </section>
      ) : null}
    </AssistantRuntimeProvider>
  )
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="ml-8 rounded-2xl bg-secondary px-3 py-2 text-sm">
      <MessagePrimitive.Content />
    </MessagePrimitive.Root>
  )
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="mr-6 text-sm leading-6">
      <MessagePrimitive.Content components={{ Text: AssistantMarkdown }} />
      <MessagePrimitive.Error>
        <p className="mt-2 text-xs text-destructive" role="alert">
          The assistant could not complete that reply.
        </p>
      </MessagePrimitive.Error>
    </MessagePrimitive.Root>
  )
}

function AssistantMarkdown() {
  return <MarkdownTextPrimitive className="prose prose-sm max-w-none" remarkPlugins={[remarkGfm]} />
}
