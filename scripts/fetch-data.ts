// Downloads every Pokémon from the PokeAPI GraphQL endpoint in a single
// request, cleans it and writes public/data/pokedex.json for the app.
//
// PokeAPI asks clients to cache data instead of querying it on every visit
// (https://pokeapi.co/docs/v2#fairuse), so the app never calls the API: run
// this script again only when a new generation comes out.
//
// Usage: npm run data
import { mkdir, writeFile } from 'node:fs/promises'
import { buildDataset, type RawData } from '../src/data/transform.ts'

const ENDPOINT = 'https://beta.pokeapi.co/graphql/v1beta'
const OUTPUT = new URL('../public/data/pokedex.json', import.meta.url)

const names = (field: string) =>
  `${field}(where: {pokemon_v2_language: {name: {_in: ["es", "en"]}}}) { name pokemon_v2_language { name } }`

const QUERY = `query {
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

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: QUERY }),
})
if (!response.ok) throw new Error(`PokeAPI answered ${response.status} ${response.statusText}`)

const body = (await response.json()) as { data?: RawData; errors?: unknown }
if (!body.data) throw new Error(`PokeAPI returned errors: ${JSON.stringify(body.errors)}`)

const dataset = buildDataset(body.data, new Date())
await mkdir(new URL('.', OUTPUT), { recursive: true })
await writeFile(OUTPUT, JSON.stringify(dataset))

const kb = Math.round(JSON.stringify(dataset).length / 1024)
console.log(
  `Wrote ${dataset.pokemon.length} Pokémon, ${dataset.types.length} types and ` +
    `${dataset.generations.length} generations to public/data/pokedex.json (${kb} KB)`,
)
