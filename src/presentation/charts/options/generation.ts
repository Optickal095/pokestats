import type { ChartPalette } from '../../theme/palette.ts'
import { baseOption, categoryAxis, legend, tooltipRow, valueAxis } from './chrome.ts'

export interface GenerationInput {
  rows: { generation: number; count: number; average: number | null; averageRegular: number | null }[]
  /** e.g. "Generación I · Kanto". */
  describe: (generation: number) => string
  /** Names of the two lines: every Pokémon, and without legendary or mythical ones. */
  seriesNames: [string, string]
  format: (value: number | null) => string
  palette: ChartPalette
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/**
 * Two lines on one axis (same unit): every Pokémon, and without legendary or
 * mythical ones, so a generation full of legendaries doesn't look stronger
 * than it is.
 */
export function buildGenerationOption({ rows, describe, seriesNames, format, palette }: GenerationInput) {
  const colors = [palette.series1, palette.series2]

  return {
    ...baseOption(palette),
    color: colors,
    legend: legend(palette, 'line'),
    grid: { left: 8, right: 24, top: 40, bottom: 8, containLabel: true },
    xAxis: categoryAxis(palette, rows.map((row) => ROMAN[row.generation] ?? String(row.generation)), {
      boundaryGap: false,
    }),
    yAxis: valueAxis(palette, { scale: true }),
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: palette.axis, width: 1 } },
      formatter: (params: { dataIndex: number }[]) => {
        const row = rows[params[0].dataIndex]
        return (
          describe(row.generation) +
          tooltipRow(colors[0], seriesNames[0], format(row.average), palette) +
          tooltipRow(colors[1], seriesNames[1], format(row.averageRegular), palette) +
          `<div style="margin-top:4px;color:${palette.textSecondary}">${row.count} Pokémon</div>`
        )
      },
    },
    series: [rows.map((row) => row.average), rows.map((row) => row.averageRegular)].map((data, i) => ({
      name: seriesNames[i],
      type: 'line',
      data,
      connectNulls: false,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 2, cap: 'round', join: 'round' },
      itemStyle: { borderColor: palette.surface, borderWidth: 2 },
    })),
  }
}
