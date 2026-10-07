import type { PokedexRepository } from '../../application/ports/pokedex-repository.ts'
import type { Pokedex } from '../../domain/pokemon.ts'

/** Repository adapter: the Pokédex is a static JSON file served next to the app. */
export class StaticJsonPokedexRepository implements PokedexRepository {
  private readonly url: string
  private readonly fetchFn: typeof fetch

  constructor(url: string, fetchFn: typeof fetch = fetch) {
    this.url = url
    // Bound so a browser `fetch` is not called with the wrong `this`.
    this.fetchFn = fetchFn.bind(globalThis)
  }

  async load(signal?: AbortSignal): Promise<Pokedex> {
    const response = await this.fetchFn(this.url, { signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as Pokedex
  }
}
