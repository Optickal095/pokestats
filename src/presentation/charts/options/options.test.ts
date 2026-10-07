import { describe, expect, it } from 'vitest'
import { pokemon } from '../../../test/fixtures.ts'
import { lightPalette as palette } from '../../theme/palette.ts'
import { buildEfficacyOption, multiplier } from './efficacy.ts'
import { buildGenerationOption } from './generation.ts'
import { buildSizeOption } from './size.ts'
import { buildTypeCountOption } from './type-count.ts'

const nameOf = (key: string) => key.toUpperCase()

describe('buildTypeCountOption', () => {
  const rows = [
    { type: 'water', count: 154 },
    { type: 'fire', count: 81 },
    { type: 'ice', count: 48 },
  ]

  it('draws the most common type on top and maps clicks back to types', () => {
    const { option, typeAt } = buildTypeCountOption({ rows, selectedTypes: [], nameOf, countLabel: 'n', palette })
    expect(option.yAxis.data).toEqual(['ICE', 'FIRE', 'WATER'])
    expect(typeAt(2)).toBe('water')
  })

  it('keeps the accent on selected types and grays the rest', () => {
    const { option } = buildTypeCountOption({ rows, selectedTypes: ['fire'], nameOf, countLabel: 'n', palette })
    expect(option.series[0].data.map((bar) => bar.itemStyle.color)).toEqual([
      palette.context,
      palette.series1,
      palette.context,
    ])
  })
})

describe('buildGenerationOption', () => {
  it('draws both averages as lines on a single y-axis', () => {
    const option = buildGenerationOption({
      rows: [{ generation: 1, count: 151, average: 407, averageRegular: 401 }],
      describe: () => 'Gen I',
      seriesNames: ['All', 'Regular'],
      format: String,
      palette,
    })
    expect(Array.isArray(option.yAxis)).toBe(false)
    expect(option.series.map((s) => s.type)).toEqual(['line', 'line'])
    expect(option.xAxis.data).toEqual(['I'])
  })
})

describe('buildSizeOption', () => {
  it('splits Pokémon into three groups and labels only the tallest and the heaviest', () => {
    const option = buildSizeOption({
      pokemon: [
        pokemon(1),
        pokemon(150, { legendary: true, height: 20 }),
        pokemon(151, { mythical: true, weight: 999 }),
      ],
      nameOf: (p) => p.name.en,
      groupNames: { regular: 'Others', legendary: 'Legendary', mythical: 'Mythical' },
      axisNames: { height: 'Height', weight: 'Weight' },
      artworkOf: (id) => `/art/${id}.png`,
      format: String,
      palette,
    })

    expect(option.series.map((s) => s.data.length)).toEqual([1, 1, 1])
    const labeled = option.series.flatMap((s) => s.data).filter((point) => point.label?.show)
    expect(labeled.map((point) => point.pokemon.id)).toEqual([150, 151])
  })
})

describe('buildEfficacyOption', () => {
  const types = [
    { key: 'fire', name: { es: 'Fuego', en: 'Fire' } },
    { key: 'grass', name: { es: 'Planta', en: 'Grass' } },
  ]
  const efficacy = { fire: { grass: 2, fire: 0.5 } }

  it('defaults unlisted matchups to ×1', () => {
    expect(multiplier(efficacy, 'grass', 'fire')).toBe(1)
    expect(multiplier(efficacy, 'fire', 'grass')).toBe(2)
  })

  it('writes the multiplier in every cell that is not ×1, so color is not the only cue', () => {
    const option = buildEfficacyOption({
      types,
      efficacy,
      nameOf,
      levelNames: { immune: '×0', resisted: '×½', neutral: '×1', superEffective: '×2' },
      palette,
    })
    const cells = option.series[0].data.map((cell) => [cell.value[2], cell.label.show ? cell.label.formatter : null])
    expect(cells).toEqual([
      [0.5, '½'],
      [2, '2'],
      [1, null],
      [1, null],
    ])
  })
})
