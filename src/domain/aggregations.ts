import { STAT_KEYS, type Generation, type Pokemon, type StatKey } from './pokemon.ts'
import { isSpecial } from './filters.ts'

/** Five-number summary for a box plot: [min, Q1, median, Q3, max]. */
export type BoxSummary = [number, number, number, number, number]

export function mean(values: number[]): number {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
}

/** Quantile with linear interpolation between closest ranks (q from 0 to 1). */
export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
}

export function boxSummary(values: number[]): BoxSummary {
  const sorted = [...values].sort((a, b) => a - b)
  return [
    sorted[0] ?? 0,
    quantile(sorted, 0.25),
    quantile(sorted, 0.5),
    quantile(sorted, 0.75),
    sorted[sorted.length - 1] ?? 0,
  ]
}

/** Pokémon per type; a dual-type Pokémon counts once for each of its types. Sorted, most common first. */
export function countByType(pokemon: Pokemon[], typeKeys: string[]) {
  return typeKeys
    .map((type) => ({ type, count: pokemon.filter((p) => p.types.includes(type)).length }))
    .sort((a, b) => b.count - a.count)
}

/** Distribution of total base stats per type, strongest median first. Types without Pokémon are left out. */
export function totalsByType(pokemon: Pokemon[], typeKeys: string[]) {
  return typeKeys
    .map((type) => {
      const totals = pokemon.filter((p) => p.types.includes(type)).map((p) => p.total)
      return { type, count: totals.length, box: boxSummary(totals) }
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.box[2] - a.box[2])
}

/** Average total base stats per generation, with and without legendary and mythical Pokémon. */
export function averagesByGeneration(pokemon: Pokemon[], generations: Generation[]) {
  return generations.map((generation) => {
    const members = pokemon.filter((p) => p.generation === generation.id)
    const regular = members.filter((p) => !isSpecial(p))
    return {
      generation: generation.id,
      count: members.length,
      average: members.length ? mean(members.map((p) => p.total)) : null,
      averageRegular: regular.length ? mean(regular.map((p) => p.total)) : null,
    }
  })
}

export function averageStats(pokemon: Pokemon[]): Record<StatKey, number> {
  return Object.fromEntries(
    STAT_KEYS.map((stat) => [stat, mean(pokemon.map((p) => p.stats[stat]))]),
  ) as Record<StatKey, number>
}

/** Highest value of a measure; ties go to the lower Pokédex number. */
function topBy(pokemon: Pokemon[], measure: (p: Pokemon) => number): Pokemon | null {
  return pokemon.reduce<Pokemon | null>(
    (best, p) => (best === null || measure(p) > measure(best) ? p : best),
    null,
  )
}

export function summarize(pokemon: Pokemon[], typeKeys: string[]) {
  const [topType] = countByType(pokemon, typeKeys)
  return {
    count: pokemon.length,
    averageTotal: mean(pokemon.map((p) => p.total)),
    topType: topType && topType.count > 0 ? topType : null,
    strongest: topBy(pokemon, (p) => p.total),
    fastest: topBy(pokemon, (p) => p.stats.speed),
  }
}
