import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Pokemon, PokemonType } from '../data/types.ts'
import { countByType } from '../lib/aggregations.ts'
import { usePalette } from '../theme/palette.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { Chart } from './Chart.tsx'
import { baseOption, categoryAxis, tooltipRow, valueAxis } from './common.ts'

interface Props {
  pokemon: Pokemon[]
  types: PokemonType[]
  selectedTypes: string[]
  onToggleType: (type: string) => void
}

/** Horizontal bars, one series. With a type filter active, selected types keep the accent and the rest turn gray. */
export function TypeCountChart({ pokemon, types, selectedTypes, onToggleType }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const nameOf = (key: string) => types.find((type) => type.key === key)?.name[lang] ?? key

  const rows = useMemo(() => countByType(pokemon, types.map((type) => type.key)), [pokemon, types])
  // ECharts draws category axes bottom-up: reverse so the most common type is on top.
  const drawn = useMemo(() => [...rows].reverse(), [rows])

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
        return `${nameOf(row.type)}${tooltipRow(palette.series1, t('charts.byType.count'), String(row.count), palette)}`
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
              selectedTypes.length === 0 || selectedTypes.includes(row.type)
                ? palette.series1
                : palette.context,
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: { show: true, position: 'right', color: palette.textSecondary, fontSize: 12 },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
    ],
  }

  return (
    <ChartCard
      title={t('charts.byType.title')}
      subtitle={t('charts.byType.subtitle')}
      table={{
        columns: [t('filters.type'), t('charts.byType.count')],
        rows: rows.map((row) => [nameOf(row.type), row.count]),
      }}
    >
      <Chart
        option={option}
        height={520}
        label={t('charts.byType.title')}
        onClick={(params) => onToggleType(drawn[params.dataIndex].type)}
      />
    </ChartCard>
  )
}
