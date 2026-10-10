import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      ...(process.env.CX83_PUBLIC_LAUNCH_APPROVED === 'true' && !getServerSideURL().includes('staging.')
        ? { allow: '/', disallow: ['/admin', '/api'] }
        : { disallow: '/' }),
    },
    sitemap: `${getServerSideURL()}/sitemap.xml`,
  }
}
