import type { BoxSummary } from '../../../domain/aggregations.ts'
import type { ChartPalette } from '../../theme/palette.ts'
import { baseOption, categoryAxis, tooltipRow, valueAxis } from './chrome.ts'

export interface TotalsByTypeInput {
  /** Strongest median first. */
  rows: { type: string; count: number; box: BoxSummary }[]
  nameOf: (type: string) => string
  /** Names of min, Q1, median, Q3 and max. */
  boxLabels: string[]
  format: (value: number) => string
  palette: ChartPalette
}

/** One box per type: the spread of base stat totals, strongest median on top. */
export function buildTotalsByTypeOption({ rows, nameOf, boxLabels, format, palette }: TotalsByTypeInput) {
  const drawn = [...rows].reverse()

  return {
    ...baseOption(palette),
    grid: { left: 8, right: 16, top: 8, bottom: 8, containLabel: true },
    xAxis: valueAxis(palette, { scale: true }),
    yAxis: categoryAxis(palette, drawn.map((row) => nameOf(row.type))),
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'item',
      formatter: (params: { dataIndex: number }) => {
        const row = drawn[params.dataIndex]
        // The median leads; the other four follow, lightest first.
        const order = [2, 0, 1, 3, 4]
        return (
          `${nameOf(row.type)} · ${row.count} Pokémon` +
          order.map((i) => tooltipRow(palette.series1, boxLabels[i], format(row.box[i]), palette)).join('')
        )
      },
    },
    series: [
      {
        type: 'boxplot',
        boxWidth: [6, 14],
        data: drawn.map((row) => row.box),
        itemStyle: { color: `${palette.series1}22`, borderColor: palette.series1, borderWidth: 1.5 },
        emphasis: { itemStyle: { borderWidth: 2.5 } },
      },
    ],
  }
}
