import type { Pokemon } from './pokemon.ts'

/** "Pikachú " → "pikachu": case- and accent-insensitive matching. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/**
 * Finds Pokémon by Pokédex number ("25", "#25") or by name in either language.
 * Names that start with the query come before names that only contain it;
 * ties go to the lower Pokédex number.
 */
export function searchPokemon(all: Pokemon[], query: string, limit = 8): Pokemon[] {
  const q = normalize(query).replace(/^#/, '')
  if (!q) return []

  if (/^\d+$/.test(q)) {
    return all.filter((p) => String(p.id).startsWith(q)).slice(0, limit)
  }

  return all
    .map((p) => {
      const names = [normalize(p.name.es), normalize(p.name.en)]
      const rank = names.some((n) => n.startsWith(q)) ? 0 : names.some((n) => n.includes(q)) ? 1 : -1
      return { p, rank }
    })
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.p.id - b.p.id)
    .slice(0, limit)
    .map(({ p }) => p)
}
