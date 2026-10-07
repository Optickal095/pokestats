import { useTranslation } from 'react-i18next'
import { setLanguage, type Language } from '../i18n/index.ts'

const LANGUAGES: { code: Language; label: string; name: string }[] = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
]

export function Header() {
  const { t, i18n } = useTranslation()

  return (
    <header className="page-header">
      <div>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </div>
      <div className="header-actions">
        <a href="https://github.com/Optickal095/pokestats" target="_blank" rel="noopener">
          {t('sourceCode')} ↗
        </a>
        <div className="segmented" role="radiogroup" aria-label={t('language')}>
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              role="radio"
              lang={language.code}
              title={language.name}
              aria-checked={i18n.language === language.code}
              className={i18n.language === language.code ? 'segment segment-active' : 'segment'}
              onClick={() => setLanguage(language.code)}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
