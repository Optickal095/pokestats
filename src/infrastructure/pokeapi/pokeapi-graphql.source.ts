import type { PokedexSource } from '../../application/ports/pokedex-pipeline.ts'
import type { Pokedex } from '../../domain/pokemon.ts'
import { buildPokedex, type RawData } from './transform.ts'

export const POKEAPI_GRAPHQL = 'https://beta.pokeapi.co/graphql/v1beta'

const names = (field: string) =>
  `${field}(where: {pokemon_v2_language: {name: {_in: ["es", "en"]}}}) { name pokemon_v2_language { name } }`

/** Everything the dashboard needs, in one request (fair to PokeAPI). */
export const POKEDEX_QUERY = `query {
  pokemon_v2_pokemon(where: {is_default: {_eq: true}}, order_by: {id: asc}) {
    id name height weight
    pokemon_v2_pokemonstats { base_stat pokemon_v2_stat { name } }
    pokemon_v2_pokemontypes(order_by: {slot: asc}) { pokemon_v2_type { name } }
    pokemon_v2_pokemonspecy {
      is_legendary is_mythical generation_id evolution_chain_id evolves_from_species_id
      pokemon_v2_pokemoncolor { name }
      ${names('pokemon_v2_pokemonspeciesnames')}
    }
  }
  pokemon_v2_type { id name ${names('pokemon_v2_typenames')} }
  pokemon_v2_typeefficacy { damage_type_id target_type_id damage_factor }
  pokemon_v2_generation { id ${names('pokemon_v2_generationnames')} pokemon_v2_region { name } }
}`

/**
 * Adapter + anti-corruption layer: queries the PokeAPI GraphQL endpoint and
 * translates its schema (`transform.ts`) into the domain's Pokédex.
 */
export class PokeApiGraphqlSource implements PokedexSource {
  private readonly endpoint: string
  private readonly fetchFn: typeof fetch
  private readonly now: () => Date

  constructor(endpoint = POKEAPI_GRAPHQL, fetchFn: typeof fetch = fetch, now = () => new Date()) {
    this.endpoint = endpoint
    this.fetchFn = fetchFn.bind(globalThis)
    this.now = now
  }

  async fetch(): Promise<Pokedex> {
    const response = await this.fetchFn(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: POKEDEX_QUERY }),
    })
    if (!response.ok) throw new Error(`PokeAPI answered ${response.status} ${response.statusText}`)

    const body = (await response.json()) as { data?: RawData; errors?: unknown }
    if (!body.data) throw new Error(`PokeAPI returned errors: ${JSON.stringify(body.errors)}`)
    return buildPokedex(body.data, this.now())
  }
}
