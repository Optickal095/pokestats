import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './en.ts'
import { es } from './es.ts'

export type Language = 'es' | 'en'

const STORAGE_KEY = 'pokestats-lang'

/** Saved choice first, then the browser language, then Spanish. */
function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    // Storage can be blocked; fall back to the browser language.
  }
  const preferred = navigator.languages?.find((lang) => /^(es|en)/i.test(lang))
  return preferred?.toLowerCase().startsWith('en') ? 'en' : 'es'
}

export function setLanguage(language: Language): void {
  void i18n.changeLanguage(language)
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // The choice just won't be remembered.
  }
}

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

void i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: initialLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
