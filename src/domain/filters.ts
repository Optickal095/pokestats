import type { Pokemon } from './pokemon.ts'

/** Legendary and mythical Pokémon are grouped as "special". */
export type Category = 'all' | 'special' | 'regular'

export interface Filters {
  /** Empty means every generation. */
  generations: number[]
  /** Empty means every type; otherwise a Pokémon needs at least one of them. */
  types: string[]
  category: Category
}

export const NO_FILTERS: Filters = { generations: [], types: [], category: 'all' }

export function isSpecial(pokemon: Pokemon): boolean {
  return pokemon.legendary || pokemon.mythical
}

export function applyFilters(pokemon: Pokemon[], filters: Filters): Pokemon[] {
  return pokemon.filter(
    (p) =>
      (filters.generations.length === 0 || filters.generations.includes(p.generation)) &&
      (filters.types.length === 0 || p.types.some((type) => filters.types.includes(type))) &&
      (filters.category === 'all' || (filters.category === 'special') === isSpecial(p)),
  )
}

/** Adds the value if missing, removes it if present. */
export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function hasFilters(filters: Filters): boolean {
  return filters.generations.length > 0 || filters.types.length > 0 || filters.category !== 'all'
}
