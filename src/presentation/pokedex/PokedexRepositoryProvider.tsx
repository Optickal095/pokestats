import type { ReactNode } from 'react'
import type { PokedexRepository } from '../../application/ports/pokedex-repository.ts'
import { PokedexRepositoryContext } from './pokedex-context.ts'

interface Props {
  repository: PokedexRepository
  children: ReactNode
}

/** Provides the Pokédex repository chosen by the composition root (`main.tsx`). */
export function PokedexRepositoryProvider({ repository, children }: Props) {
  return <PokedexRepositoryContext value={repository}>{children}</PokedexRepositoryContext>
}
