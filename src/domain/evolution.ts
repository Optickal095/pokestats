import type { Pokemon } from './pokemon.ts'

/**
 * The evolution chain of a Pokémon as stages: the base form first, then each
 * evolution step. Branching chains put siblings in the same stage, e.g.
 * Eevee → [Vaporeon, Jolteon, Flareon, …].
 */
export function evolutionStages(all: Pokemon[], pokemon: Pokemon): Pokemon[][] {
  const family = all
    .filter((p) => p.evolutionChain === pokemon.evolutionChain)
    .sort((a, b) => a.id - b.id)
  const byId = new Map(family.map((p) => [p.id, p]))
  const depths = new Map<number, number>()

  const depthOf = (p: Pokemon): number => {
    const known = depths.get(p.id)
    if (known !== undefined) return known
    const parent = p.evolvesFrom === null ? undefined : byId.get(p.evolvesFrom)
    const depth = parent ? depthOf(parent) + 1 : 0
    depths.set(p.id, depth)
    return depth
  }

  const stages: Pokemon[][] = []
  for (const p of family) (stages[depthOf(p)] ??= []).push(p)
  return stages.filter((stage) => stage.length > 0)
}
