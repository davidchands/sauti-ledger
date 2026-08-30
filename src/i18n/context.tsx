import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { translations, type Language, type TranslationPath } from './translations'
import { LanguageContext } from './languageContext'

const STORAGE_KEY = 'sautiledger.language'
const DEFAULT_LANGUAGE: Language = 'sw'

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'en' || stored === 'sw' ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function resolve(dict: (typeof translations)[Language], path: string): string {
  const value = path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) {
      return (node as Record<string, unknown>)[key]
    }
    return undefined
  }, dict)
  return typeof value === 'string' ? value : path
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage may be unavailable (private browsing, disabled storage) — non-fatal
    }
  }, [])

  const t = useCallback(
    (path: TranslationPath) => resolve(translations[language], path),
    [language],
  )

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
