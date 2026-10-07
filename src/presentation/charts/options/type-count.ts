import type { ChartPalette } from '../../theme/palette.ts'
import { baseOption, categoryAxis, tooltipRow, valueAxis } from './chrome.ts'

export interface TypeCountInput {
  /** Most common type first. */
  rows: { type: string; count: number }[]
  selectedTypes: string[]
  nameOf: (type: string) => string
  countLabel: string
  palette: ChartPalette
}

/**
 * Horizontal bars, one series. With a type filter active, selected types keep
 * the accent and the rest turn gray. `typeAt` maps a clicked bar back to its type.
 */
export function buildTypeCountOption({ rows, selectedTypes, nameOf, countLabel, palette }: TypeCountInput) {
  // ECharts draws category axes bottom-up: reverse so the most common type is on top.
  const drawn = [...rows].reverse()

  const option = {
    ...baseOption(palette),
    grid: { left: 8, right: 40, top: 8, bottom: 8, containLabel: true },
    xAxis: valueAxis(palette, { minInterval: 1 }),
    yAxis: categoryAxis(palette, drawn.map((row) => nameOf(row.type))),
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'item',
      formatter: (params: { dataIndex: number }) => {
        const row = drawn[params.dataIndex]
        return `${nameOf(row.type)}${tooltipRow(palette.series1, countLabel, String(row.count), palette)}`
      },
    },
    series: [
      {
        type: 'bar',
        cursor: 'pointer',
        barMaxWidth: 18,
        data: drawn.map((row) => ({
          value: row.count,
          itemStyle: {
            color:
              selectedTypes.length === 0 || selectedTypes.includes(row.type) ? palette.series1 : palette.context,
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: { show: true, position: 'right', color: palette.textSecondary, fontSize: 12 },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
    ],
  }

  return { option, typeAt: (index: number) => drawn[index].type }
}
