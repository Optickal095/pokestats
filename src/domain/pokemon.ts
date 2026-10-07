/** A text in both languages of the site. */
export interface Localized {
  es: string
  en: string
}

export type StatKey = 'hp' | 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed'

export const STAT_KEYS: StatKey[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']

export interface Pokemon {
  /** National Pokédex number. */
  id: number
  slug: string
  name: Localized
  /** Type keys in slot order, e.g. ['grass', 'poison']. */
  types: string[]
  generation: number
  legendary: boolean
  mythical: boolean
  /** Metres. */
  height: number
  /** Kilograms. */
  weight: number
  stats: Record<StatKey, number>
  /** Sum of the six base stats. */
  total: number
  color: string
  evolutionChain: number
  /** Pokédex number of the previous evolution, if any. */
  evolvesFrom: number | null
}

export interface PokemonType {
  key: string
  name: Localized
}

export interface Generation {
  id: number
  /** e.g. "Generación I" / "Generation I". */
  name: Localized
  region: string
}

export interface Pokedex {
  generatedAt: string
  source: string
  types: PokemonType[]
  generations: Generation[]
  /**
   * Damage multiplier of an attacking type against a defending type, only
   * for pairs that are not ×1: efficacy.fire.grass === 2.
   */
  efficacy: Record<string, Record<string, number>>
  pokemon: Pokemon[]
}
