import { STAT_KEYS, type StatKey } from '../../../domain/pokemon.ts'
import type { ChartPalette } from '../../theme/palette.ts'
import { baseOption, categoryAxis, legend, tooltipRow, valueAxis } from './chrome.ts'

export interface StatGroup {
  name: string
  count: number
  stats: Record<StatKey, number>
  color: string
}

export interface SpecialInput {
  groups: StatGroup[]
  statName: (stat: StatKey) => string
  format: (value: number) => string
  palette: ChartPalette
}

/** Grouped bars: the six average base stats of each group side by side. */
export function buildSpecialOption({ groups, statName, format, palette }: SpecialInput) {
  const drawnStats = [...STAT_KEYS].reverse()

  return {
    ...baseOption(palette),
    color: groups.map((g) => g.color),
    legend: legend(palette, 'rect'),
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    xAxis: valueAxis(palette),
    yAxis: categoryAxis(palette, drawnStats.map(statName)),
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: `${palette.axis}33` } },
      formatter: (params: { dataIndex: number }[]) => {
        const stat = drawnStats[params[0].dataIndex]
        return (
          statName(stat) +
          groups.map((g) => tooltipRow(g.color, `${g.name} (${g.count})`, format(g.stats[stat]), palette)).join('')
        )
      },
    },
    series: groups.map((group) => ({
      name: group.name,
      type: 'bar',
      barMaxWidth: 14,
      barGap: '15%',
      data: drawnStats.map((stat) => (group.count ? Math.round(group.stats[stat]) : null)),
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    })),
  }
}
