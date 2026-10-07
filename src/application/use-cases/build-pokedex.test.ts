import { describe, expect, it } from 'vitest'
import type { Pokedex } from '../../domain/pokemon.ts'
import { pokedex } from '../../test/fixtures.ts'
import type { PokedexSource, PokedexWriter } from '../ports/pokedex-pipeline.ts'
import { BuildPokedex } from './build-pokedex.ts'

describe('BuildPokedex', () => {
  it('builds the Pokédex from the source, saves it and summarizes it', async () => {
    const built = pokedex()
    const written: Pokedex[] = []
    const source: PokedexSource = { fetch: async () => built }
    const writer: PokedexWriter = {
      write: async (p) => {
        written.push(p)
        return { location: '/tmp/pokedex.json', bytes: 2048 }
      },
    }

    const summary = await new BuildPokedex(source, writer).execute()

    expect(written).toEqual([built])
    expect(summary).toEqual({ pokemon: 2, types: 2, generations: 1, location: '/tmp/pokedex.json', bytes: 2048 })
  })

  it('writes nothing when the source fails', async () => {
    let writes = 0
    const source: PokedexSource = { fetch: async () => Promise.reject(new Error('PokeAPI is down')) }
    const writer: PokedexWriter = {
      write: async () => {
        writes++
        return { location: '', bytes: 0 }
      },
    }

    await expect(new BuildPokedex(source, writer).execute()).rejects.toThrow('PokeAPI is down')
    expect(writes).toBe(0)
  })
})
