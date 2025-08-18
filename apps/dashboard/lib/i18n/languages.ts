// 支持的语言配置
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  zh: {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳'
  }
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES
export const DEFAULT_LANGUAGE: LanguageCode = 'en'