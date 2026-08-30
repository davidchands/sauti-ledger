/** Groq returns full language names ("English", "Swahili") — normalize to our enum. */
export function normalizeLanguage(raw: string | null | undefined): 'sw' | 'en' | undefined {
  if (!raw) return undefined
  const lower = raw.toLowerCase()
  if (lower.startsWith('sw')) return 'sw'
  if (lower.startsWith('en')) return 'en'
  return undefined
}
