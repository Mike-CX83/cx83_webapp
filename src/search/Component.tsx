'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export const Search = ({ initialQuery = '' }: { initialQuery?: string }) => {
  const router = useRouter()

  return (
    <form onSubmit={(event) => {
      event.preventDefault()
      const query = String(new FormData(event.currentTarget).get('q') || '').trim()
      router.push('/search' + (query ? '?q=' + encodeURIComponent(query) : ''))
    }}>
      <Label htmlFor="search">Search notes</Label>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <Input id="search" name="q" type="search" maxLength={200} defaultValue={initialQuery}
          key={initialQuery} placeholder="Search published articles" className="min-h-11 min-w-0 flex-1" />
        <button type="submit" className="cx83-action cx83-action-primary min-h-11">Search notes</button>
      </div>
    </form>
  )
}
