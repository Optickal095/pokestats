import { describe, expect, it } from 'vitest'
import { fakeFetch, pokedex } from '../test/fixtures.ts'
import { StaticJsonPokedexRepository } from './http/static-json-pokedex.repository.ts'
import { POKEDEX_QUERY, PokeApiGraphqlSource } from './pokeapi/pokeapi-graphql.source.ts'
import type { RawData } from './pokeapi/transform.ts'

describe('StaticJsonPokedexRepository', () => {
  it('reads the Pokédex from its URL', async () => {
    const { fn, calls } = fakeFetch(pokedex())
    const result = await new StaticJsonPokedexRepository('/data/pokedex.json', fn).load()
    expect(calls[0].url).toBe('/data/pokedex.json')
    expect(result.pokemon).toHaveLength(2)
  })

  it('fails with the HTTP status when the file is missing', async () => {
    const { fn } = fakeFetch({}, 404)
    await expect(new StaticJsonPokedexRepository('/x.json', fn).load()).rejects.toThrow('HTTP 404')
  })
})

describe('PokeApiGraphqlSource', () => {
  const raw: RawData = {
    pokemon_v2_pokemon: [
      {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        pokemon_v2_pokemonstats: [
          ['hp', 35],
          ['attack', 55],
          ['defense', 40],
          ['special-attack', 50],
          ['special-defense', 50],
          ['speed', 90],
        ].map(([name, base_stat]) => ({ base_stat: base_stat as number, pokemon_v2_stat: { name: name as string } })),
        pokemon_v2_pokemontypes: [{ pokemon_v2_type: { name: 'electric' } }],
        pokemon_v2_pokemonspecy: {
          is_legendary: false,
          is_mythical: false,
          generation_id: 1,
          evolution_chain_id: 10,
          evolves_from_species_id: 172,
          pokemon_v2_pokemoncolor: { name: 'yellow' },
          pokemon_v2_pokemonspeciesnames: [{ name: 'Pikachu', pokemon_v2_language: { name: 'en' } }],
        },
      },
    ],
    pokemon_v2_type: [],
    pokemon_v2_typeefficacy: [],
    pokemon_v2_generation: [],
  }
  const fixedNow = () => new Date('2026-10-07T12:00:00Z')

  it('sends the whole query in one POST and translates the answer into the domain', async () => {
    const { fn, calls } = fakeFetch({ data: raw })
    const result = await new PokeApiGraphqlSource('https://pokeapi.test', fn, fixedNow).fetch()

    expect(calls).toHaveLength(1)
    expect(calls[0].init?.method).toBe('POST')
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ query: POKEDEX_QUERY })
    expect(result.generatedAt).toBe('2026-10-07T12:00:00.000Z')
    expect(result.pokemon[0]).toMatchObject({ id: 25, name: { en: 'Pikachu' }, height: 0.4, total: 320 })
  })

  it('reports GraphQL errors', async () => {
    const { fn } = fakeFetch({ errors: [{ message: 'bad field' }] })
    await expect(new PokeApiGraphqlSource('https://pokeapi.test', fn).fetch()).rejects.toThrow('bad field')
  })

  it('reports HTTP errors', async () => {
    const { fn } = fakeFetch({}, 502)
    await expect(new PokeApiGraphqlSource('https://pokeapi.test', fn).fetch()).rejects.toThrow('502')
  })
})
