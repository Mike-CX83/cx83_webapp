import { INQUIRY_CONTEXTS, inquiryContextHref } from '@/forms/inquiryContext'

const defaultStarters = [
  'How can AI update a website?',
  'What is Client Brand Studio?',
  'Can CX83 connect my current tools?',
  'How do I start a project?',
] as const

// Exact public pathname keys only. No search parameters, fields or private state.
const routeStarters: Record<string, readonly string[]> = {
  '/services': [
    'Which CX83 service fits my business?',
    'Can CX83 connect my current tools?',
    'What does an AI setup include?',
    'How do I discuss a website project?',
  ],
  '/software/connected-websites': [
    'How does the Connected Website Platform work?',
    'Is the Connected Website Platform available?',
    'Where can I see the real website demonstration?',
    'How do I ask about Connected Websites?',
  ],
  '/software/client-brand-studio': [
    'What does Client Brand Studio do?',
    'Is Client Brand Studio available?',
    'Is the Studio illustration an actual output?',
    'How do I ask about Client Brand Studio?',
  ],
}

export function conversationStarters(pathname: string): readonly string[] {
  return Object.hasOwn(routeStarters, pathname) ? routeStarters[pathname] : defaultStarters
}

export const publicNavigationKnowledge = [
  'Public routes: / (Home), /services (service selection), /software (two products in development), /about (approved company story), /work (evidence), /contact (human inquiry).',
  'How it works: /how-it-works. Illustrative examples: /how-it-works#customers, /how-it-works#marketing, /how-it-works#operations. Ownership: /how-it-works#ownership. FAQ: /how-it-works#questions.',
  'Actual website demonstration video: /#showcase-title. Substantial dated CX83 internal implementation evidence: /work#cx83-connected-website. Historical proof pointer: /how-it-works#real-proof.',
  'The CX83 internal website demonstrates authorized owner requests, implementation, review and protected staging. It is not a customer release or proof of automatic email delivery. Workflow diagrams are illustrative.',
  'Connected Website Platform: /software/connected-websites. Client Brand Studio: /software/client-brand-studio. Both remain in development, with no download, trial, checkout or customer installer.',
  'The Studio source artwork illustration is an editorial example, not an actual generated customer output or interface screenshot.',
  ...INQUIRY_CONTEXTS.map((context) => {
    const prefix = context.inquiryType === 'software' ? '/software/' : '/services/'
    return context.label + ': detail ' + prefix + context.token + '; specific human inquiry ' + inquiryContextHref(context.token)
  }),
  'Use the specific inquiry URL for a named service or product. Use /contact for an undecided general inquiry. Ask Cat means public information; Start a conversation means a human inquiry.',
  'Notes at /posts and /search cover published articles only, not all website pages. They are not primary navigation destinations.',
].join('\n')
