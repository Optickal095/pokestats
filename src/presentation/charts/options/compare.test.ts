import { describe, expect, it } from 'vitest'
import { pokemon } from '../../../test/fixtures.ts'
import { darkPalette, lightPalette } from '../../theme/palette.ts'
import { buildCompareOption, slotColor } from './compare.ts'

describe('buildCompareOption', () => {
  it('colors each Pokémon by its comparison slot, not by its position in the list', () => {
    const option = buildCompareOption({
      entries: [
        { slot: 0, pokemon: pokemon(3), name: 'Venusaur' },
        // Slot 1 was freed: Blastoise keeps the third color.
        { slot: 2, pokemon: pokemon(9), name: 'Blastoise' },
      ],
      statName: (stat) => stat,
      palette: lightPalette,
    })
    expect(option.color).toEqual([lightPalette.series1, lightPalette.series3])
    expect(option.series.map((s) => s.name)).toEqual(['Venusaur', 'Blastoise'])
  })

  it('draws the six base stats on a fixed 0–255 scale', () => {
    const option = buildCompareOption({
      entries: [{ slot: 0, pokemon: pokemon(25), name: 'Pikachu' }],
      statName: (stat) => stat,
      palette: lightPalette,
    })
    expect(option.yAxis.data).toHaveLength(6)
    expect(option.xAxis.max).toBe(255)
    expect(option.xAxis.axisLabel.showMaxLabel).toBe(false)
  })

  it('uses the dark steps in dark mode', () => {
    expect([0, 1, 2].map((slot) => slotColor(darkPalette, slot))).toEqual(['#3987e5', '#d95926', '#199e70'])
  })
})
