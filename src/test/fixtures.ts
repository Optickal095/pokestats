import type { Pokedex, Pokemon } from '../domain/pokemon.ts'

/** A Pokémon with sensible defaults; override only what a test cares about. */
export function pokemon(id: number, overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    id,
    slug: `p${id}`,
    name: { es: `P${id}`, en: `P${id}` },
    types: ['normal'],
    generation: 1,
    legendary: false,
    mythical: false,
    height: 1,
    weight: 10,
    stats: { hp: 50, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 },
    total: 300,
    color: 'red',
    evolutionChain: id,
    evolvesFrom: null,
    ...overrides,
  }
}

export function pokedex(overrides: Partial<Pokedex> = {}): Pokedex {
  return {
    generatedAt: '2026-10-07T00:00:00.000Z',
    source: 'https://pokeapi.co',
    types: [
      { key: 'fire', name: { es: 'Fuego', en: 'Fire' } },
      { key: 'grass', name: { es: 'Planta', en: 'Grass' } },
    ],
    generations: [{ id: 1, name: { es: 'Generación I', en: 'Generation I' }, region: 'Kanto' }],
    efficacy: { fire: { grass: 2, fire: 0.5 } },
    pokemon: [pokemon(1), pokemon(4)],
    ...overrides,
  }
}

/** A `fetch` double that answers with the given status and JSON body, and records its calls. */
export function fakeFetch(body: unknown, status = 200) {
  const calls: { url: string; init?: RequestInit }[] = []
  const fn = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify(body), { status, statusText: status === 200 ? 'OK' : 'Error' })
  }) as typeof fetch
  return { fn, calls }
}
