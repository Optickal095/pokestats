import type { PokedexSource, PokedexWriter } from '../ports/pokedex-pipeline.ts'

export interface BuildSummary {
  pokemon: number
  types: number
  generations: number
  location: string
  bytes: number
}

/** Data pipeline: builds the Pokédex from its source and saves it where the app reads it. */
export class BuildPokedex {
  private readonly source: PokedexSource
  private readonly writer: PokedexWriter

  constructor(source: PokedexSource, writer: PokedexWriter) {
    this.source = source
    this.writer = writer
  }

  async execute(): Promise<BuildSummary> {
    const pokedex = await this.source.fetch()
    const { location, bytes } = await this.writer.write(pokedex)
    return {
      pokemon: pokedex.pokemon.length,
      types: pokedex.types.length,
      generations: pokedex.generations.length,
      location,
      bytes,
    }
  }
}
