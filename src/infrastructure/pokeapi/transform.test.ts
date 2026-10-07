import { describe, expect, it } from 'vitest'
import { buildPokedex, localize, type RawData, type RawPokemon } from './transform.ts'

const name = (value: string, lang: string) => ({ name: value, pokemon_v2_language: { name: lang } })

const stats = (values: number[]) =>
  ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((stat, i) => ({
    base_stat: values[i],
    pokemon_v2_stat: { name: stat },
  }))

function rawPokemon(overrides: Partial<RawPokemon> & { id: number; name: string }): RawPokemon {
  return {
    height: 10,
    weight: 100,
    pokemon_v2_pokemonstats: stats([10, 20, 30, 40, 50, 60]),
    pokemon_v2_pokemontypes: [{ pokemon_v2_type: { name: 'fire' } }],
    pokemon_v2_pokemonspecy: {
      is_legendary: false,
      is_mythical: false,
      generation_id: 1,
      evolution_chain_id: 1,
      evolves_from_species_id: null,
      pokemon_v2_pokemoncolor: { name: 'red' },
      pokemon_v2_pokemonspeciesnames: [name(overrides.name, 'en')],
    },
    ...overrides,
  }
}

const raw: RawData = {
  pokemon_v2_pokemon: [
    rawPokemon({ id: 6, name: 'charizard' }),
    rawPokemon({ id: 4, name: 'charmander' }),
    rawPokemon({ id: 10272, name: 'ursaluna-bloodmoon' }),
  ],
  pokemon_v2_type: [
    { id: 10, name: 'fire', pokemon_v2_typenames: [name('Fuego', 'es'), name('Fire', 'en')] },
    { id: 12, name: 'grass', pokemon_v2_typenames: [name('Planta', 'es'), name('Grass', 'en')] },
    { id: 10002, name: 'shadow', pokemon_v2_typenames: [] },
  ],
  pokemon_v2_typeefficacy: [
    { damage_type_id: 10, target_type_id: 12, damage_factor: 200 },
    { damage_type_id: 12, target_type_id: 10, damage_factor: 50 },
    { damage_type_id: 10, target_type_id: 10, damage_factor: 50 },
    { damage_type_id: 12, target_type_id: 12, damage_factor: 50 },
    { damage_type_id: 10, target_type_id: 10002, damage_factor: 200 },
    { damage_type_id: 12, target_type_id: 10, damage_factor: 100 },
  ],
  pokemon_v2_generation: [
    { id: 2, pokemon_v2_generationnames: [name('Generation II', 'en')], pokemon_v2_region: { name: 'johto' } },
    { id: 1, pokemon_v2_generationnames: [], pokemon_v2_region: { name: 'kanto' } },
  ],
}

describe('buildPokedex', () => {
  const dataset = buildPokedex(raw, new Date('2026-10-06T00:00:00Z'))

  it('keeps one entry per species, sorted by Pokédex number', () => {
    expect(dataset.pokemon.map((p) => p.slug)).toEqual(['charmander', 'charizard'])
  })

  it('converts units and adds up the base stats', () => {
    const [charmander] = dataset.pokemon
    expect(charmander.height).toBe(1)
    expect(charmander.weight).toBe(10)
    expect(charmander.stats).toEqual({
      hp: 10, attack: 20, defense: 30, spAttack: 40, spDefense: 50, speed: 60,
    })
    expect(charmander.total).toBe(210)
  })

  it('stores only the matchups that are not ×1, between battle types', () => {
    expect(dataset.efficacy).toEqual({
      fire: { grass: 2, fire: 0.5 },
      grass: { fire: 0.5, grass: 0.5 },
    })
  })

  it('lists the 18 battle types with their names', () => {
    expect(dataset.types).toHaveLength(18)
    expect(dataset.types.find((t) => t.key === 'fire')?.name).toEqual({ es: 'Fuego', en: 'Fire' })
    // A type without names falls back to its capitalized key.
    expect(dataset.types.find((t) => t.key === 'dark')?.name).toEqual({ es: 'Dark', en: 'Dark' })
  })

  it('names generations in both languages, with Roman numerals', () => {
    expect(dataset.generations).toEqual([
      { id: 1, name: { es: 'Generación I', en: 'Generation I' }, region: 'Kanto' },
      { id: 2, name: { es: 'Generación II', en: 'Generation II' }, region: 'Johto' },
    ])
  })
})

describe('localize', () => {
  it('uses each language when available and the other one otherwise', () => {
    expect(localize([name('Bicho', 'es'), name('Bug', 'en')], 'x')).toEqual({ es: 'Bicho', en: 'Bug' })
    expect(localize([name('Bug', 'en')], 'x')).toEqual({ es: 'Bug', en: 'Bug' })
    expect(localize([], 'Fallback')).toEqual({ es: 'Fallback', en: 'Fallback' })
  })
})
