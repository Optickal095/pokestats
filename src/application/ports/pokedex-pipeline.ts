import type { Pokedex } from '../../domain/pokemon.ts'

/** Port used by the data pipeline: where the Pokédex is built from (PokeAPI today). */
export interface PokedexSource {
  fetch(): Promise<Pokedex>
}

/** Port used by the data pipeline: where the built Pokédex is saved for the app. */
export interface PokedexWriter {
  /** Returns where it was written and its size in bytes. */
  write(pokedex: Pokedex): Promise<{ location: string; bytes: number }>
}
