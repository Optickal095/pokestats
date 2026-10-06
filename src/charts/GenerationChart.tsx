import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Generation, Pokemon } from '../data/types.ts'
import { averagesByGeneration } from '../lib/aggregations.ts'
import { usePalette } from '../theme/palette.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { Chart } from './Chart.tsx'
import { baseOption, categoryAxis, legend, tooltipRow, valueAxis } from './common.ts'

interface Props {
  pokemon: Pokemon[]
  generations: Generation[]
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/**
 * Two lines on one axis (same unit): every Pokémon, and without legendary or
 * mythical ones, so a generation full of legendaries doesn't look stronger
 * than it is.
 */
export function GenerationChart({ pokemon, generations }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const format = (value: number | null) => (value === null ? '–' : Math.round(value).toLocaleString(lang))

  const rows = useMemo(() => averagesByGeneration(pokemon, generations), [pokemon, generations])
  const names = [t('charts.generation.all'), t('charts.generation.regular')]
  const colors = [palette.series1, palette.series2]

  const option = {
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
        const generation = generations.find((g) => g.id === row.generation)
        return (
          `${generation?.name[lang] ?? ''} · ${generation?.region ?? ''}` +
          tooltipRow(colors[0], names[0], format(row.average), palette) +
          tooltipRow(colors[1], names[1], format(row.averageRegular), palette) +
          `<div style="margin-top:4px;color:${palette.textSecondary}">${row.count} Pokémon</div>`
        )
      },
    },
    series: [rows.map((row) => row.average), rows.map((row) => row.averageRegular)].map((data, i) => ({
      name: names[i],
      type: 'line',
      data,
      connectNulls: false,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 2, cap: 'round', join: 'round' },
      itemStyle: { borderColor: palette.surface, borderWidth: 2 },
    })),
  }

  return (
    <ChartCard
      title={t('charts.generation.title')}
      subtitle={t('charts.generation.subtitle')}
      table={{
        columns: [t('filters.generation'), t('charts.generation.count'), ...names],
        rows: rows.map((row) => [
          generations.find((g) => g.id === row.generation)?.name[lang] ?? row.generation,
          row.count,
          format(row.average),
          format(row.averageRegular),
        ]),
      }}
    >
      <Chart option={option} height={320} label={t('charts.generation.title')} />
    </ChartCard>
  )
}
