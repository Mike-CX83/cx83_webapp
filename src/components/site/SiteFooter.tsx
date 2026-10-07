import Link from 'next/link'

export function SiteFooter({
  siteName,
  email,
}: {
  siteName: string
  email?: string
}) {
  return (
    <footer className="border-t border-border">
      <div className="cx83-container flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] uppercase">{siteName}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            AI systems, automation, software, and business integration.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm md:items-end">
          {email ? (
            <a className="hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
          ) : (
            <span className="text-muted-foreground">Contact email is set in Site settings.</span>
          )}
          <Link className="hover:underline" href="/contact">
            Start a project
          </Link>
          <Link className="text-muted-foreground hover:underline" href="/posts">
            Notes
          </Link>
        </div>
      </div>
    </footer>
  )
}
