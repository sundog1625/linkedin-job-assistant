'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LanguageCode, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages'
import { en } from './translations/en'
import { zh } from './translations/zh'

// Translation type based on English translations
type Translations = typeof en

// Available translations
const translations: Record<LanguageCode, Translations> = {
  en,
  zh
}

interface I18nContextType {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: Translations
  availableLanguages: typeof SUPPORTED_LANGUAGES
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE)

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('linkedin-assistant-language') as LanguageCode
    if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage)
    localStorage.setItem('linkedin-assistant-language', newLanguage)
  }

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
    availableLanguages: SUPPORTED_LANGUAGES
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Helper function for string interpolation
export function interpolateString(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}