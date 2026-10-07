import { createContext } from 'react'
import type { PokedexRepository } from '../../application/ports/pokedex-repository.ts'

/** Dependency injection for React: components get the repository from here, never build it. */
export const PokedexRepositoryContext = createContext<PokedexRepository | null>(null)
