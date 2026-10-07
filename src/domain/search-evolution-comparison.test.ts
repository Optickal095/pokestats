import { describe, expect, it } from 'vitest'
import { pokemon } from '../test/fixtures.ts'
import {
  addToComparison,
  comparisonOf,
  EMPTY_COMPARISON,
  isComparisonFull,
  MAX_COMPARED,
  removeFromComparison,
} from './comparison.ts'
import { evolutionStages } from './evolution.ts'
import { normalize, searchPokemon } from './search.ts'

const all = [
  pokemon(25, { name: { es: 'Pikachu', en: 'Pikachu' } }),
  pokemon(26, { name: { es: 'Raichu', en: 'Raichu' } }),
  pokemon(172, { name: { es: 'Pichu', en: 'Pichu' } }),
  pokemon(250, { name: { es: 'Ho-Oh', en: 'Ho-Oh' } }),
  pokemon(29, { name: { es: 'Nidoran♀', en: 'Nidoran♀' } }),
  pokemon(669, { name: { es: 'Flabébé', en: 'Flabébé' } }),
]

describe('searchPokemon', () => {
  it('finds by name in any case, prefixes first', () => {
    expect(searchPokemon(all, 'CHU').map((p) => p.id)).toEqual([25, 26, 172])
    expect(searchPokemon(all, 'pi').map((p) => p.id)).toEqual([25, 172])
  })

  it('ignores accents', () => {
    expect(normalize(' Flabébé ')).toBe('flabebe')
    expect(searchPokemon(all, 'flabebe').map((p) => p.id)).toEqual([669])
  })

  it('finds by Pokédex number, with or without #', () => {
    expect(searchPokemon(all, '#25').map((p) => p.id)).toEqual([25, 250])
    expect(searchPokemon(all, '172').map((p) => p.id)).toEqual([172])
  })

  it('returns nothing for an empty query and respects the limit', () => {
    expect(searchPokemon(all, '  ')).toEqual([])
    expect(searchPokemon(all, 'i', 2)).toHaveLength(2)
  })
})

describe('evolutionStages', () => {
  it('orders a linear chain from the base form', () => {
    const chain = [
      pokemon(26, { evolutionChain: 10, evolvesFrom: 25 }),
      pokemon(172, { evolutionChain: 10, evolvesFrom: null }),
      pokemon(25, { evolutionChain: 10, evolvesFrom: 172 }),
      pokemon(1, { evolutionChain: 1 }),
    ]
    expect(evolutionStages(chain, chain[0]).map((stage) => stage.map((p) => p.id))).toEqual([[172], [25], [26]])
  })

  it('groups branching evolutions in one stage', () => {
    const eevee = [133, 134, 135, 136].map((id) =>
      pokemon(id, { evolutionChain: 67, evolvesFrom: id === 133 ? null : 133 }),
    )
    expect(evolutionStages(eevee, eevee[2]).map((stage) => stage.map((p) => p.id))).toEqual([[133], [134, 135, 136]])
  })

  it('returns a single stage for Pokémon that do not evolve', () => {
    const tauros = pokemon(128, { evolutionChain: 55 })
    expect(evolutionStages([tauros], tauros)).toEqual([[tauros]])
  })
})

describe('comparison', () => {
  it(`adds up to ${MAX_COMPARED} different Pokémon`, () => {
    let slots = EMPTY_COMPARISON
    for (const id of [1, 4, 4, 7, 25]) slots = addToComparison(slots, id)
    expect(slots).toEqual([1, 4, 7])
    expect(isComparisonFull(slots)).toBe(true)
  })

  it('keeps the others in their slot (and color) when one is removed, and refills the gap', () => {
    const removed = removeFromComparison(comparisonOf([1, 4, 7]), 4)
    expect(removed).toEqual([1, null, 7])
    expect(addToComparison(removed, 25)).toEqual([1, 25, 7])
  })
})
