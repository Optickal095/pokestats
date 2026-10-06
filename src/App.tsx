import { useDataset } from './data/useDataset.ts'

// Placeholder until the dashboard (phase 2): confirms the dataset loads.
export default function App() {
  const state = useDataset()

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 16px' }}>
      <h1>PokéStats</h1>
      {state.status === 'loading' && <p>Cargando datos…</p>}
      {state.status === 'error' && <p>No se pudieron cargar los datos: {state.error.message}</p>}
      {state.status === 'ready' && (
        <p>
          {state.dataset.pokemon.length} Pokémon, {state.dataset.types.length} tipos y{' '}
          {state.dataset.generations.length} generaciones.
        </p>
      )}
    </main>
  )
}
