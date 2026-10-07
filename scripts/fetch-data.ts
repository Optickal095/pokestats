// Composition root of the data pipeline: PokeAPI → Pokédex → public/data/pokedex.json.
//
// PokeAPI asks clients to cache data instead of querying it on every visit
// (https://pokeapi.co/docs/v2#fairuse), so the app never calls the API: run
// this script again only when a new generation comes out.
//
// Usage: npm run data
import { BuildPokedex } from '../src/application/use-cases/build-pokedex.ts'
import { JsonFilePokedexWriter } from '../src/infrastructure/node/json-file-pokedex.writer.ts'
import { PokeApiGraphqlSource } from '../src/infrastructure/pokeapi/pokeapi-graphql.source.ts'

const build = new BuildPokedex(
  new PokeApiGraphqlSource(),
  new JsonFilePokedexWriter(new URL('../public/data/pokedex.json', import.meta.url)),
)

const summary = await build.execute()
console.log(
  `Wrote ${summary.pokemon} Pokémon, ${summary.types} types and ${summary.generations} generations ` +
    `to ${summary.location} (${Math.round(summary.bytes / 1024)} KB)`,
)
