export type SoftwareProduct = {
  slug: 'connected-websites' | 'client-brand-studio'
  name: string
  label: string
  shortDescription: string
  overview: string
  benefits: readonly { title: string; description: string }[]
  audience: string
  setup: string
  ownership: string
  support: string
  releaseStatus: 'In development'
  lastVerified: string
}

/**
 * CX83's public software catalog. Status is deliberately not a checkout
 * entitlement or product release assertion. Only approved distributions
 * should receive an actual download or Buy link.
 */
export const softwareProducts: readonly SoftwareProduct[] = [
  {
    slug: 'connected-websites',
    name: 'CX83 Connected Website Platform',
    label: 'Websites that work with your AI',
    shortDescription: 'A website you can improve by talking to the AI you already use.',
    overview:
      'We are building a packaged website and web application foundation that can connect to supported AI tools. Once configured with the right permissions, the owner can ask for real software changes, review the results, and publish through their established workflow.',
    benefits: [
      { title: 'A real website you control', description: 'Own and operate your site instead of depending on a developer for every routine edit.' },
      { title: 'Changes through conversation', description: 'Describe what you want to change through a supported connected AI platform.' },
      { title: 'Testing and publishing', description: 'Changes can be checked before they are published, with the permissions you define.' },
      { title: 'A separate visitor assistant', description: 'Your website can also answer public questions without exposing owner editing privileges.' },
    ],
    audience: 'Business owners who want an easier way to manage and improve their own digital tools.',
    setup: 'Supported hosting, installation packages and connected AI setup are being documented and tested. A customer installer is not yet released.',
    ownership: 'The plan is customer controlled software, with hosting and data responsibilities documented for each supported release.',
    support: 'Setup guidance, update compatibility and support options will be defined for the first supported customer edition.',
    releaseStatus: 'In development',
    lastVerified: 'October 9, 2026',
  },
  {
    slug: 'client-brand-studio',
    name: 'Client Brand Studio',
    label: 'Your brand, organized in one system',
    shortDescription: 'Turn existing artwork or a creative direction into consistent branded materials.',
    overview:
      'Client Brand Studio is a separate CX83 software project. It is being developed so an AI assistant can work with your saved brief, existing artwork or new creative direction, then generate coordinated brand files, guides and design materials for review. The software performs the actual generation rather than relying on an AI to manually recreate every file.',
    benefits: [
      { title: 'Start with artwork or a new idea', description: 'Develop an existing identity or use your creative direction to guide a new one.' },
      { title: 'Make materials match', description: 'Coordinate brand treatments, messaging and visual rules from a single saved brief.' },
      { title: 'Let the software do the work', description: 'Have an AI submit design direction through the Studio workflow and generate actual draft files.' },
      { title: 'Review before release', description: 'Outputs and application compatibility undergo testing and human acceptance before customer delivery.' },
    ],
    audience: 'Businesses and creators who want their real brand to look consistent across files and digital spaces.',
    setup: 'A development workflow and automated tests exist, but operating system compatibility, review requirements and the customer installer have not been approved.',
    ownership: 'Customers need appropriate rights to any artwork they provide. Distribution rights and licensing terms will be published with a verified release.',
    support: 'Supported operating systems, office document compatibility and installation guidance remain part of release qualification.',
    releaseStatus: 'In development',
    lastVerified: 'October 9, 2026',
  },
]

export function getSoftwareProduct(slug: string): SoftwareProduct | undefined {
  return softwareProducts.find((product) => product.slug === slug)
}
