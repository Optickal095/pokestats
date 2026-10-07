import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { PokedexWriter } from '../../application/ports/pokedex-pipeline.ts'
import type { Pokedex } from '../../domain/pokemon.ts'

/** Writer adapter (Node only): saves the Pokédex as a compact JSON file. */
export class JsonFilePokedexWriter implements PokedexWriter {
  private readonly file: URL

  constructor(file: URL) {
    this.file = file
  }

  async write(pokedex: Pokedex): Promise<{ location: string; bytes: number }> {
    const json = JSON.stringify(pokedex)
    await mkdir(new URL('.', this.file), { recursive: true })
    await writeFile(this.file, json)
    return { location: fileURLToPath(this.file), bytes: Buffer.byteLength(json) }
  }
}
