import { STAT_KEYS, type Pokemon, type StatKey } from '../../../domain/pokemon.ts'
import type { ChartPalette } from '../../theme/palette.ts'
import { baseOption, categoryAxis, legend, tooltipRow, valueAxis } from './chrome.ts'

export interface ComparedEntry {
  /** Comparison slot (0–2): decides the color, so it never changes while the Pokémon stays compared. */
  slot: number
  pokemon: Pokemon
  name: string
}

export interface CompareInput {
  entries: ComparedEntry[]
  statName: (stat: StatKey) => string
  palette: ChartPalette
}

export function slotColor(palette: ChartPalette, slot: number): string {
  return [palette.series1, palette.series2, palette.series3][slot] ?? palette.context
}

/** Grouped bars: the six base stats of each compared Pokémon, one color per comparison slot. */
export function buildCompareOption({ entries, statName, palette }: CompareInput) {
  const drawnStats = [...STAT_KEYS].reverse()

  return {
    ...baseOption(palette),
    color: entries.map((entry) => slotColor(palette, entry.slot)),
    legend: legend(palette, 'rect'),
    grid: { left: 8, right: 32, top: 40, bottom: 8, containLabel: true },
    // One fixed scale (the highest base stat is 255) so bars compare across picks;
    // the 255 tick is hidden because it would collide with 250.
    xAxis: valueAxis(palette, {
      max: 255,
      interval: 50,
      axisLabel: { color: palette.muted, fontSize: 12, showMaxLabel: false },
      splitLine: { lineStyle: { color: palette.grid }, showMaxLine: false },
    }),
    yAxis: categoryAxis(palette, drawnStats.map(statName)),
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: `${palette.axis}33` } },
      formatter: (params: { dataIndex: number }[]) => {
        const stat = drawnStats[params[0].dataIndex]
        return (
          statName(stat) +
          entries
            .map((entry) =>
              tooltipRow(slotColor(palette, entry.slot), entry.name, String(entry.pokemon.stats[stat]), palette),
            )
            .join('')
        )
      },
    },
    series: entries.map((entry) => ({
      name: entry.name,
      type: 'bar',
      barMaxWidth: 12,
      barGap: '20%',
      data: drawnStats.map((stat) => entry.pokemon.stats[stat]),
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    })),
  }
}
