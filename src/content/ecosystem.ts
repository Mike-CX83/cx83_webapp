// CX83 Connected Ecosystem: educational graph data, not an authorization configuration.
// Labels document the verified state of this website, not universal provider compatibility.
export type EcosystemStatus = 'demonstrated' | 'supported' | 'example' | 'inDevelopment'
export type ConnectionStatus = 'verified' | 'illustrative'
export type ProviderGroup = 'people' | 'ai' | 'cx83' | 'web' | 'engineering' | 'automation' | 'records' | 'communications' | 'documents' | 'control' | 'visitor'
export interface EcosystemNode {
  id: string
  name: string
  category: ProviderGroup
  logo?: string
  relationship: 'firstParty' | 'thirdParty' | 'concept'
  status: EcosystemStatus
  permission: string
  description: string
  technical: string
  x: number
  y: number
}
export interface EcosystemEdge {
  id: string
  from: string
  to: string
  action: string
  status: ConnectionStatus
}
export interface EcosystemScenario {
  id: string
  title: string
  status: 'verified' | 'illustrative' | 'inDevelopment'
  path: string[]
  captions: string[]
  outcome: string
  evidence?: string
}
export const ecosystemStatusLabels: Record<EcosystemStatus, string> = {
  demonstrated: 'Demonstrated on CX83',
  supported: 'Verified configuration',
  example: 'Example integration',
  inDevelopment: 'In development',
}
export const ecosystemNodes: EcosystemNode[] = [
  { id: 'owner', name: 'Business owner', category: 'people', relationship: 'firstParty', status: 'demonstrated', permission: 'Controls which accounts, tools and approvals may be used.', description: 'A business owner makes a request and chooses what the connected system may change.', technical: 'Owner identity, consent and scoped access.', x: 10, y: 19 },
  { id: 'chatgpt', name: 'ChatGPT', category: 'ai', logo: '/integrations/openai.svg', relationship: 'thirdParty', status: 'demonstrated', permission: 'Only explicitly connected, authorized website and repository tools.', description: 'The owner can ask ChatGPT to work on the actual CX83 website with approved tools.', technical: 'Connected owner assistant invokes registered tools with authorization.', x: 29, y: 19 },
  { id: 'claude', name: 'Claude', category: 'ai', logo: '/integrations/claude.svg', relationship: 'thirdParty', status: 'example', permission: 'Would need a separately verified, authorized integration.', description: 'Another AI platform that could be configured for selected tasks; not this demonstrated route.', technical: 'Provider-specific configuration and tool access must be validated.', x: 29, y: 48 },
  { id: 'gemini', name: 'Gemini', category: 'ai', logo: '/integrations/googlegemini.svg', relationship: 'thirdParty', status: 'example', permission: 'Separate credentials and verification are required.', description: 'An illustrative AI alternative, not proof of a connected owner workflow.', technical: 'Not an automatic router between AI providers.', x: 10, y: 48 },
  { id: 'cx83', name: 'CX83 Labs', category: 'cx83', logo: '/brand/symbol-showcase.svg', relationship: 'firstParty', status: 'demonstrated', permission: 'Executes approved operations with service-specific scope.', description: 'The connection layer directs authorized requests to the right content or engineering tools.', technical: 'Scoped website tools, version control and operational boundaries.', x: 49, y: 48 },
  { id: 'github', name: 'GitHub', category: 'engineering', logo: '/integrations/github.svg', relationship: 'thirdParty', status: 'demonstrated', permission: 'Only the repositories and operations granted to the owner AI.', description: 'Real source changes are recorded and reviewed with a verifiable commit history.', technical: 'Private repository, scoped GitHub App permissions and pull requests.', x: 70, y: 19 },
  { id: 'nextjs', name: 'Next.js', category: 'web', logo: '/integrations/nextdotjs.svg', relationship: 'thirdParty', status: 'demonstrated', permission: 'Runs the application; it is not an account connection.', description: 'The current CX83 website is a real Next.js application backed by Payload.', technical: 'React, TypeScript, Next.js App Router.', x: 90, y: 19 },
  { id: 'payload', name: 'Website CMS', category: 'web', relationship: 'firstParty', status: 'demonstrated', permission: 'Authorized editorial and content operations, not blanket administrator access.', description: 'Payload provides the current website content, forms, and controlled page operations.', technical: 'Payload CMS with PostgreSQL backing.', x: 70, y: 48 },
  { id: 'checks', name: 'Checks and review', category: 'control', relationship: 'firstParty', status: 'demonstrated', permission: 'Build checks do not themselves grant production publishing access.', description: 'Automated tests, build and review precede the protected staging release.', technical: 'TypeScript, lint, integration tests, browser tests and CI.', x: 90, y: 48 },
  { id: 'staging', name: 'Protected staging', category: 'control', relationship: 'firstParty', status: 'demonstrated', permission: 'Password protected; separate approval required for public production.', description: 'The deployed test site is checked against the exact source revision.', technical: 'GitHub Actions, verified checkout SHA and authenticated health checks.', x: 90, y: 79 },
  { id: 'postgres', name: 'PostgreSQL', category: 'records', logo: '/integrations/postgresql.svg', relationship: 'thirdParty', status: 'demonstrated', permission: 'The website accesses its own configured database.', description: 'The existing site stores authorized CMS data and saved form submissions in PostgreSQL.', technical: 'Database is a system of record; not every styling edit writes data.', x: 10, y: 79 },
  { id: 'drive', name: 'Google Drive', category: 'documents', logo: '/integrations/googledrive.svg', relationship: 'thirdParty', status: 'example', permission: 'Requires authorization for the correct customer account and files.', description: 'An example destination for a reviewed document workflow, not part of the actual website edit.', technical: 'Scopes, file selection and destination approval.', x: 29, y: 79 },
  { id: 'gmail', name: 'Gmail', category: 'communications', logo: '/integrations/gmail.svg', relationship: 'thirdParty', status: 'example', permission: 'Website originated notification delivery is not yet configured.', description: 'A possible form notification destination; saved inquiries do not prove sent mail.', technical: 'Dedicated website OAuth and independent provider receipt still required.', x: 49, y: 79 },
  { id: 'n8n', name: 'n8n', category: 'automation', logo: '/integrations/n8n.svg', relationship: 'thirdParty', status: 'example', permission: 'Optional workflow account, triggers and destinations require setup.', description: 'Can join business systems in a configured automation but is not required for a site change.', technical: 'Optional workflow runner with audited credentials and retry policy.', x: 70, y: 79 },
  { id: 'wordpress', name: 'WordPress', category: 'web', logo: '/integrations/wordpress.svg', relationship: 'thirdParty', status: 'example', permission: 'Requires a separately authorized customer WordPress site.', description: 'An example CMS that can be operated through a supported, approved connector.', technical: 'Not the CMS powering the CX83 demonstration website.', x: 90, y: 19 },
  { id: 'studio', name: 'Client Brand Studio', category: 'cx83', logo: '/brand/symbol-showcase.svg', relationship: 'firstParty', status: 'inDevelopment', permission: 'No public installer, approved purchase or production release.', description: 'A CX83 brand material workflow in development, not an available customer release.', technical: 'Separate review, asset provenance and release gate.', x: 49, y: 48 },
  { id: 'visitor', name: 'Website visitor', category: 'visitor', relationship: 'concept', status: 'demonstrated', permission: 'Public pages and ordinary contact form.', description: 'A public visitor can ask questions without granting owner authority.', technical: 'Unauthenticated public visitor session.', x: 10, y: 48 },
  { id: 'cat', name: 'Visitor CAT', category: 'visitor', logo: '/brand/symbol-showcase.svg', relationship: 'firstParty', status: 'demonstrated', permission: 'Approved public website information only, no owner editing tools.', description: 'CAT guides visitors to public CX83 information and contact routes.', technical: 'Public assistant role isolated from source editing, private records and deployment.', x: 49, y: 48 },
  { id: 'public', name: 'Public guidance', category: 'visitor', relationship: 'firstParty', status: 'demonstrated', permission: 'Approved public descriptions and links.', description: 'Visitors can learn about CX83 services and the development status of software.', technical: 'Public content and visitor interaction only.', x: 70, y: 48 },
  { id: 'contact', name: 'Contact path', category: 'visitor', relationship: 'firstParty', status: 'demonstrated', permission: 'Ordinary validated inquiry submission only.', description: 'A visitor can submit an inquiry. Storage does not establish delivery of an email.', technical: 'Form validation, saved submission, distinct notification state.', x: 90, y: 48 },
]
export const ecosystemEdges: EcosystemEdge[] = [
  { id: 'owner-chatgpt', from: 'owner', to: 'chatgpt', action: 'Ask for a change', status: 'verified' },
  { id: 'chatgpt-cx83', from: 'chatgpt', to: 'cx83', action: 'Invoke approved tools', status: 'verified' },
  { id: 'cx83-github', from: 'cx83', to: 'github', action: 'Update actual code', status: 'verified' },
  { id: 'github-nextjs', from: 'github', to: 'nextjs', action: 'Build tracked source', status: 'verified' },
  { id: 'nextjs-checks', from: 'nextjs', to: 'checks', action: 'Review and test', status: 'verified' },
  { id: 'checks-staging', from: 'checks', to: 'staging', action: 'Authorized staging release', status: 'verified' },
  { id: 'cx83-payload', from: 'cx83', to: 'payload', action: 'Update authorized content', status: 'verified' },
  { id: 'payload-checks', from: 'payload', to: 'checks', action: 'Validate the result', status: 'illustrative' },
  { id: 'visitor-contact', from: 'visitor', to: 'contact', action: 'Send an inquiry', status: 'verified' },
  { id: 'visitor-cat', from: 'visitor', to: 'cat', action: 'Ask a public question', status: 'verified' },
  { id: 'cat-public', from: 'cat', to: 'public', action: 'Use public information', status: 'verified' },
  { id: 'public-contact', from: 'public', to: 'contact', action: 'Open contact route', status: 'verified' },
  { id: 'contact-postgres', from: 'contact', to: 'postgres', action: 'Save inquiry', status: 'verified' },
  { id: 'postgres-n8n', from: 'postgres', to: 'n8n', action: 'Possible workflow trigger', status: 'illustrative' },
  { id: 'n8n-gmail', from: 'n8n', to: 'gmail', action: 'Possible notification', status: 'illustrative' },
  { id: 'cx83-drive', from: 'cx83', to: 'drive', action: 'Work with permitted files', status: 'illustrative' },
  { id: 'drive-checks', from: 'drive', to: 'checks', action: 'Human review', status: 'illustrative' },
  { id: 'owner-cx83', from: 'owner', to: 'cx83', action: 'Submit approved brand inputs', status: 'illustrative' },
  { id: 'cx83-studio', from: 'cx83', to: 'studio', action: 'Prepare brand drafts', status: 'illustrative' },
  { id: 'studio-checks', from: 'studio', to: 'checks', action: 'Owner review and acceptance', status: 'illustrative' },
]
export const ecosystemScenarios: EcosystemScenario[] = [
  { id: 'website', title: 'Trace a website update', status: 'verified', path: ['owner', 'chatgpt', 'cx83', 'github', 'nextjs', 'checks', 'staging'], captions: ['Owner describes a real request', 'ChatGPT uses a connected owner session', 'CX83 tools apply the approved operation', 'GitHub records the source change', 'Next.js builds the real website', 'Tests and review verify the change', 'Protected staging is inspected'], outcome: 'A real CX83 website update, verified on protected staging.', evidence: '/how-it-works#real-proof' },
  { id: 'service', title: 'Update a service page', status: 'illustrative', path: ['owner', 'chatgpt', 'cx83', 'payload', 'checks', 'staging'], captions: ['Owner asks to revise a service', 'AI checks approved content', 'CX83 selects authorized operations', 'The website CMS stores the content', 'The page is reviewed and checked', 'An approved release makes it visible'], outcome: 'An explained CMS change path, not a separate documented end to end recording.' },
  { id: 'inquiry', title: 'Route a customer inquiry', status: 'illustrative', path: ['visitor', 'contact', 'postgres', 'n8n', 'gmail'], captions: ['A visitor submits a validated form', 'The site saves a real submission', 'The database stores the authorized record', 'An optional automation could run', 'Email requires separate website credentials and delivery proof'], outcome: 'CX83 stores inquiries today. Notification automation and email delivery remain unverified.' },
  { id: 'documents', title: 'Work with business files', status: 'illustrative', path: ['owner', 'chatgpt', 'cx83', 'drive', 'checks'], captions: ['Owner asks for a document task', 'Approved AI identifies the permitted work', 'A scoped connector handles the task', 'A selected file destination is accessed', 'Human review confirms the result'], outcome: 'A possible document workflow after account authorization and review.' },
  { id: 'studio', title: 'Explore Client Brand Studio', status: 'inDevelopment', path: ['owner', 'cx83', 'studio', 'checks'], captions: ['Owner supplies approved brand files', 'CX83 processes the accepted brief', 'Studio creates reviewable drafts', 'Owner reviews output before any release'], outcome: 'Client Brand Studio is in development; no public installer, purchase or release is available.' },
  { id: 'cat', title: 'Ask visitor CAT', status: 'verified', path: ['visitor', 'cat', 'public', 'contact'], captions: ['A visitor opens CAT', 'CAT responds within its public role', 'CAT explains approved CX83 information', 'The visitor can choose a public contact path'], outcome: 'CAT cannot read private records or edit or deploy the owner website.' },
]
export function findNode(id: string) { return ecosystemNodes.find((node) => node.id === id) }
export function findEdge(from: string, to: string) { return ecosystemEdges.find((edge) => edge.from === from && edge.to === to) }
