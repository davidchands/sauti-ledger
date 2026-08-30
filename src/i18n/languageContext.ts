import { createContext } from 'react'
import type { Language, TranslationPath } from './translations'

export interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (path: TranslationPath) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
