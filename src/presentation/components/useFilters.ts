import { useCallback, useMemo, useState } from 'react'
import { applyFilters, NO_FILTERS, toggle, type Filters } from '../../domain/filters.ts'
import type { Pokedex } from '../../domain/pokemon.ts'

/** Filter state of the dashboard and the slice of the Pokédex it selects. */
export function useFilters(pokedex: Pokedex) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)

  const pokemon = useMemo(() => applyFilters(pokedex.pokemon, filters), [pokedex, filters])
  const generations = useMemo(
    () =>
      filters.generations.length
        ? pokedex.generations.filter((g) => filters.generations.includes(g.id))
        : pokedex.generations,
    [pokedex, filters.generations],
  )
  const toggleType = useCallback(
    (type: string) => setFilters((current) => ({ ...current, types: toggle(current.types, type) })),
    [],
  )

  return { filters, setFilters, toggleType, pokemon, generations }
}
