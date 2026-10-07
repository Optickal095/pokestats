import { useContext, useEffect, useState } from 'react'
import type { Pokedex } from '../../domain/pokemon.ts'
import { PokedexRepositoryContext } from './pokedex-context.ts'

export type PokedexState =
  | { status: 'loading' }
  | { status: 'ready'; pokedex: Pokedex }
  | { status: 'error'; error: Error }

/** Loads the Pokédex through the injected repository, exposing loading and error states. */
export function usePokedex(): PokedexState {
  const repository = useContext(PokedexRepositoryContext)
  if (!repository) throw new Error('usePokedex must be used inside a PokedexRepositoryProvider')

  const [state, setState] = useState<PokedexState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    repository
      .load(controller.signal)
      .then((pokedex) => setState({ status: 'ready', pokedex }))
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', error })
      })
    return () => controller.abort()
  }, [repository])

  return state
}
