import type { Pokedex } from '../../domain/pokemon.ts'

/** Port used by the app: wherever the ready-made Pokédex is read from. */
export interface PokedexRepository {
  load(signal?: AbortSignal): Promise<Pokedex>
}
