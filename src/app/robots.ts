import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * The root metadata convention is required for /robots.txt. A page-group
 * robots file is not served by this Next.js application during CI.
 * Protected staging remains excluded until separately authorized for launch.
 */
export default function robots(): MetadataRoute.Robots {
  const siteURL = getServerSideURL()
  const allowPublicIndex = process.env.CX83_PUBLIC_LAUNCH_APPROVED === 'true' && !siteURL.includes('staging.')
  return {
    rules: {
      userAgent: '*',
      ...(allowPublicIndex ? { allow: '/', disallow: ['/admin', '/api'] } : { disallow: '/' }),
    },
    sitemap: siteURL + '/sitemap.xml',
  }
}
