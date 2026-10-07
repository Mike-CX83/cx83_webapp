export function databaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim()

  if (!url) return false
  if (url.includes('<password>') || url.includes('YOUR_')) return false

  return true
}
