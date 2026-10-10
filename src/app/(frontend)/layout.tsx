import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AssistantWidget } from '@/components/assistant/AssistantWidget'
import { AdminBar } from '@/components/AdminBar'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { loadNavigation, loadSiteCopy } from '@/content/load'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import './cx83-brand.css'
import './cx83-run2.css'
import './cx83-run3.css'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const [site, navigation] = await Promise.all([loadSiteCopy(), loadNavigation()])

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/brand/symbol-showcase.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-3" href="#content">
            Skip to content
          </a>
          <SiteHeader items={navigation} siteName={site.copy.siteName} />
          <main id="content">{children}</main>
          <SiteFooter email={site.copy.contactEmail} siteName={site.copy.siteName} />
          {process.env.CHATBOT_ENABLED === 'false' ? null : <AssistantWidget />}
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'CX83 Labs',
    template: '%s | CX83 Labs',
  },
  description: 'CX83 Labs focuses on AI systems, automation, software, and business integration.',
  openGraph: mergeOpenGraph(),
  robots: process.env.CX83_PUBLIC_LAUNCH_APPROVED === 'true' && !getServerSideURL().includes('staging.') ? undefined : { index: false, follow: false },
  twitter: {
    card: 'summary_large_image',
  },
}
