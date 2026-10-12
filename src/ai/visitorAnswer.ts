export const CAT_CONTACT = '[Contact CX83](/contact#contact-form)'
export const CAT_EMAIL = '[hello@cx83labs.com](mailto:hello@cx83labs.com)'
export const CAT_FALLBACK = 'I could not complete a useful answer. Please try a shorter question, or use ' + CAT_CONTACT + '. You can also email ' + CAT_EMAIL + '.'

export function safeAssistantHref(href: string | undefined): string | null {
  if (!href) return null
  if (href.toLowerCase() === 'mailto:hello@cx83labs.com') return 'mailto:hello@cx83labs.com'
  try {
    const url = new URL(href, 'https://cx83labs.com')
    if (url.protocol !== 'https:' || !['cx83labs.com', 'www.cx83labs.com'].includes(url.hostname) || url.username || url.password || url.port) return null
    if (!/^\/(?:$|(?:contact|services|software|about|work|how-it-works|posts|search)(?:\/[a-z0-9-]+)*\/?$)/.test(url.pathname)) return null
    if (url.search && (url.pathname !== '/contact' || !/^\?context=(websites-and-business-tools|automation-and-integrations|ai-setup-and-workflows|connected-websites|client-brand-studio)$/.test(url.search))) return null
    return url.pathname + url.search + url.hash
  } catch { return null }
}

// Narrow classifier/serialization signatures, not ordinary explanations about safety.
export function isInternalAnswer(text: string): boolean {
  return /(?:^|\n)\s*(?:user\s+safety|safety\s+classification|debug|system\s+prompt|owner\s+guidance|providerMetadata)\s*:/i.test(text)
    || /<\/?(?:think|analysis|system|tool_call)>/i.test(text)
    || /^\s*\{\s*"(?:safety|classification|providerMetadata|system)"\s*:/i.test(text)
}

export function formatVisitorAnswer(text: string, finishReason: string): { text: string; rejected: boolean } {
  if (finishReason !== 'stop' || !text.trim() || text.length > 8000 || isInternalAnswer(text)) return { text: CAT_FALLBACK, rejected: true }
  let answer = text.trim()
  // Repair bare contact paths without touching a Markdown destination or label.
  answer = answer.replace(/(?<![\w\[\](])(?:https:\/\/(?:www\.)?cx83labs\.com)?\/contact(?:\?context=[a-z-]+)?(?:#contact-form)?/g, (path) => {
    const href = safeAssistantHref(path)
    return href ? '[Contact CX83](' + href + ')' : CAT_CONTACT
  })
  answer = answer.replace(/(?<![\w\[(])(?:mailto:)?hello@cx83labs\.com(?![\w\])])/gi, CAT_EMAIL)
  return { text: answer, rejected: false }
}

export function contactShortcut(question: string): string | null {
  if (question.length > 250 || !/\b(contact|email|reach|talk to someone)\b/i.test(question)) return null
  if (!/\b(how|where|who|someone|address|you|cx83)\b/i.test(question)) return null
  if (/\b(api|code|privacy|data|integrat\w*|automat\w*|not|don't|cannot)\b/i.test(question)) return null
  const path = /\b(website|web site)\b/i.test(question) ? '/contact?context=websites-and-business-tools#contact-form' : '/contact#contact-form'
  return 'You can use [Contact CX83](' + path + ') or email ' + CAT_EMAIL + '. Share what you want to build or improve, and the tools you currently use.'
}
