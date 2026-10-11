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
    'Can I start a brand without existing artwork?',
    'How do I ask about Client Brand Studio?',
  ],
}

export function conversationStarters(pathname: string): readonly string[] {
  return Object.hasOwn(routeStarters, pathname) ? routeStarters[pathname] : defaultStarters
}

export const publicNavigationKnowledge = [
  'Public routes: / (Home), /services (service selection), /software (two products in development), /about (approved company story), /work (evidence), /contact (human inquiry).',
  'How it works: /how-it-works. Illustrative examples: /how-it-works#customers, /how-it-works#marketing, /how-it-works#operations. Ownership: /how-it-works#ownership. FAQ: /how-it-works#questions.',
  'Actual CX83 website demonstration video: /#showcase-title. Real CX83 website update: /work#cx83-connected-website. More details: /how-it-works#real-proof.',
  'The CX83 internal website demonstrates authorized owner requests, implementation, review and protected staging. It is not a customer release or proof of automatic email delivery. Workflow diagrams are illustrative.',
  'Connected Website Platform: /software/connected-websites. Client Brand Studio: /software/client-brand-studio. Both remain in development, with no download, trial, checkout or customer installer.',
  'The displayed CX83 branding is authentic work created through Client Brand Studio, as confirmed by the CX83 owner. Visitors can begin with existing artwork or their own creative direction. Client Brand Studio remains in development and is not released for customer installation.',
  ...INQUIRY_CONTEXTS.map((context) => {
    const prefix = context.inquiryType === 'software' ? '/software/' : '/services/'
    return context.label + ': detail ' + prefix + context.token + '; specific human inquiry ' + inquiryContextHref(context.token)
  }),
  'Use the specific inquiry URL for a named service or product. Use /contact for an undecided general inquiry. Ask Cat means public information; Start a conversation means a human inquiry.',
  'Notes at /posts and /search cover published articles only, not all website pages. They are not primary navigation destinations.',
].join('\n')
