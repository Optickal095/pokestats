import { describe, expect, it } from 'vitest'
import type { Pokemon } from '../data/types.ts'
import {
  averagesByGeneration,
  averageStats,
  boxSummary,
  countByType,
  quantile,
  summarize,
  totalsByType,
} from './aggregations.ts'
import { applyFilters, NO_FILTERS, toggle } from './filters.ts'

function pokemon(id: number, types: string[], total: number, extra: Partial<Pokemon> = {}): Pokemon {
  const each = total / 6
  return {
    id,
    slug: `p${id}`,
    name: { es: `P${id}`, en: `P${id}` },
    types,
    generation: 1,
    legendary: false,
    mythical: false,
    height: 1,
    weight: 10,
    stats: { hp: each, attack: each, defense: each, spAttack: each, spDefense: each, speed: each },
    total,
    color: 'red',
    evolutionChain: id,
    evolvesFrom: null,
    ...extra,
  }
}

const charizard = pokemon(6, ['fire', 'flying'], 534)
const pikachu = pokemon(25, ['electric'], 320, { stats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 } })
const mewtwo = pokemon(150, ['psychic'], 680, { legendary: true })
const mew = pokemon(151, ['psychic'], 600, { mythical: true, generation: 1 })
const chikorita = pokemon(152, ['grass'], 318, { generation: 2 })
const all = [charizard, pikachu, mewtwo, mew, chikorita]

describe('applyFilters', () => {
  it('returns everything without filters', () => {
    expect(applyFilters(all, NO_FILTERS)).toHaveLength(5)
  })

  it('keeps Pokémon with any of the selected types', () => {
    const result = applyFilters(all, { ...NO_FILTERS, types: ['flying', 'grass'] })
    expect(result.map((p) => p.id)).toEqual([6, 152])
  })

  it('combines generation and category', () => {
    expect(applyFilters(all, { ...NO_FILTERS, generations: [1], category: 'special' }).map((p) => p.id)).toEqual([150, 151])
    expect(applyFilters(all, { ...NO_FILTERS, category: 'regular' }).map((p) => p.id)).toEqual([6, 25, 152])
  })
})

describe('toggle', () => {
  it('adds a missing value and removes a present one', () => {
    expect(toggle([1, 2], 3)).toEqual([1, 2, 3])
    expect(toggle([1, 2], 1)).toEqual([2])
  })
})

describe('quantile and boxSummary', () => {
  it('interpolates between ranks', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5)
    expect(quantile([10], 0.25)).toBe(10)
  })

  it('summarizes min, quartiles, median and max', () => {
    expect(boxSummary([5, 1, 3, 2, 4])).toEqual([1, 2, 3, 4, 5])
  })
})

describe('countByType', () => {
  it('counts dual types once per type, most common first', () => {
    expect(countByType(all, ['fire', 'flying', 'psychic', 'ice'])).toEqual([
      { type: 'psychic', count: 2 },
      { type: 'fire', count: 1 },
      { type: 'flying', count: 1 },
      { type: 'ice', count: 0 },
    ])
  })
})

describe('totalsByType', () => {
  it('drops empty types and sorts by median', () => {
    const rows = totalsByType(all, ['grass', 'psychic', 'ice'])
    expect(rows.map((r) => r.type)).toEqual(['psychic', 'grass'])
    expect(rows[0].box).toEqual([600, 620, 640, 660, 680])
  })
})

describe('averagesByGeneration', () => {
  it('averages with and without legendary and mythical Pokémon', () => {
    const generations = [
      { id: 1, name: { es: 'I', en: 'I' }, region: 'Kanto' },
      { id: 3, name: { es: 'III', en: 'III' }, region: 'Hoenn' },
    ]
    expect(averagesByGeneration(all, generations)).toEqual([
      { generation: 1, count: 4, average: 533.5, averageRegular: 427 },
      { generation: 3, count: 0, average: null, averageRegular: null },
    ])
  })
})

describe('averageStats and summarize', () => {
  it('averages each stat', () => {
    expect(averageStats([pikachu]).speed).toBe(90)
  })

  it('finds the most common type, the strongest and the fastest', () => {
    const summary = summarize(all, ['fire', 'psychic', 'grass'])
    expect(summary.count).toBe(5)
    expect(summary.topType).toEqual({ type: 'psychic', count: 2 })
    expect(summary.strongest?.id).toBe(150)
    expect(summary.fastest?.id).toBe(150)
  })

  it('handles an empty selection', () => {
    expect(summarize([], ['fire'])).toEqual({
      count: 0, averageTotal: 0, topType: null, strongest: null, fastest: null,
    })
  })
})
