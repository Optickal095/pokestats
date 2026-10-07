import { useTranslation } from 'react-i18next'
import { Dashboard } from './components/Dashboard.tsx'
import { Header } from './components/Header.tsx'
import { usePokedex } from './pokedex/usePokedex.ts'

export default function App() {
  const { t } = useTranslation()
  const state = usePokedex()

  return (
    <div className="page">
      <Header />
      <main>
        {state.status === 'loading' && <p className="status">{t('loading')}</p>}
        {state.status === 'error' && <p className="status">{t('loadError', { message: state.error.message })}</p>}
        {state.status === 'ready' && <Dashboard pokedex={state.pokedex} />}
      </main>
      <footer className="page-footer">
        <p>
          {t('footer')}{' '}
          <a href="https://pokeapi.co" target="_blank" rel="noopener">
            pokeapi.co ↗
          </a>
        </p>
      </footer>
    </div>
  )
}
