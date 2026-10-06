import type { Dataset, Localized, Pokemon, PokemonType, StatKey } from './types.ts'

/**
 * Turns the raw PokeAPI GraphQL response into the compact dataset the app
 * loads. Pure functions only, so the cleaning rules are easy to test.
 */

/** The 18 battle types; PokeAPI also lists "unknown", "shadow" and "stellar". */
export const BATTLE_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

const STAT_NAMES: Record<string, StatKey> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'spAttack',
  'special-defense': 'spDefense',
  speed: 'speed',
}

interface RawName {
  name: string
  pokemon_v2_language: { name: string }
}

export interface RawPokemon {
  id: number
  name: string
  height: number
  weight: number
  pokemon_v2_pokemonstats: { base_stat: number; pokemon_v2_stat: { name: string } }[]
  pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[]
  pokemon_v2_pokemonspecy: {
    is_legendary: boolean
    is_mythical: boolean
    generation_id: number
    evolution_chain_id: number
    evolves_from_species_id: number | null
    pokemon_v2_pokemoncolor: { name: string } | null
    pokemon_v2_pokemonspeciesnames: RawName[]
  }
}

export interface RawData {
  pokemon_v2_pokemon: RawPokemon[]
  pokemon_v2_type: { id: number; name: string; pokemon_v2_typenames: RawName[] }[]
  pokemon_v2_typeefficacy: { damage_type_id: number; target_type_id: number; damage_factor: number }[]
  pokemon_v2_generation: {
    id: number
    pokemon_v2_generationnames: RawName[]
    pokemon_v2_region: { name: string } | null
  }[]
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** Picks the Spanish and English names; falls back to the other language, then to `fallback`. */
export function localize(names: RawName[], fallback: string): Localized {
  const find = (lang: string) => names.find((n) => n.pokemon_v2_language.name === lang)?.name
  const en = find('en') ?? find('es') ?? fallback
  return { es: find('es') ?? en, en }
}

export function toPokemon(raw: RawPokemon): Pokemon {
  const species = raw.pokemon_v2_pokemonspecy
  const stats = Object.fromEntries(
    raw.pokemon_v2_pokemonstats.map((s) => [STAT_NAMES[s.pokemon_v2_stat.name], s.base_stat]),
  ) as Record<StatKey, number>

  return {
    id: raw.id,
    slug: raw.name,
    name: localize(species.pokemon_v2_pokemonspeciesnames, capitalize(raw.name)),
    types: raw.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
    generation: species.generation_id,
    legendary: species.is_legendary,
    mythical: species.is_mythical,
    // PokeAPI uses decimetres and hectograms.
    height: raw.height / 10,
    weight: raw.weight / 10,
    stats,
    total: Object.values(stats).reduce((sum, value) => sum + value, 0),
    color: species.pokemon_v2_pokemoncolor?.name ?? 'unknown',
    evolutionChain: species.evolution_chain_id,
    evolvesFrom: species.evolves_from_species_id,
  }
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const FIRST_FORM_ID = 10001

export function buildDataset(raw: RawData, generatedAt: Date): Dataset {
  const types: PokemonType[] = BATTLE_TYPES.map((key) => {
    const type = raw.pokemon_v2_type.find((t) => t.name === key)
    return { key, name: localize(type?.pokemon_v2_typenames ?? [], capitalize(key)) }
  })

  const typeKeyById = new Map(raw.pokemon_v2_type.map((t) => [t.id, t.name]))
  const efficacy: Dataset['efficacy'] = {}
  for (const { damage_type_id, target_type_id, damage_factor } of raw.pokemon_v2_typeefficacy) {
    const attacker = typeKeyById.get(damage_type_id)
    const defender = typeKeyById.get(target_type_id)
    if (!attacker || !defender || damage_factor === 100) continue
    if (!BATTLE_TYPES.includes(attacker) || !BATTLE_TYPES.includes(defender)) continue
    efficacy[attacker] ??= {}
    efficacy[attacker][defender] = damage_factor / 100
  }

  const generations = raw.pokemon_v2_generation
    .map((g) => {
      const numeral = ROMAN[g.id] ?? String(g.id)
      const names = localize(g.pokemon_v2_generationnames, `Generation ${numeral}`)
      return {
        id: g.id,
        name: {
          // Spanish falls back to its own wording instead of the English name.
          es: g.pokemon_v2_generationnames.some((n) => n.pokemon_v2_language.name === 'es')
            ? names.es
            : `Generación ${numeral}`,
          en: names.en,
        },
        region: capitalize(g.pokemon_v2_region?.name ?? ''),
      }
    })
    .sort((a, b) => a.id - b.id)

  const pokemon = raw.pokemon_v2_pokemon
    // Alternate forms use ids from 10001. A few, like Ursaluna Bloodmoon,
    // are still flagged as default and would count twice.
    .filter((p) => p.id < FIRST_FORM_ID && p.pokemon_v2_pokemonspecy)
    .map(toPokemon)
    .sort((a, b) => a.id - b.id)

  return {
    generatedAt: generatedAt.toISOString(),
    source: 'https://pokeapi.co',
    types,
    generations,
    efficacy,
    pokemon,
  }
}

/** Official artwork hosted by the PokeAPI sprites project. */
export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}
