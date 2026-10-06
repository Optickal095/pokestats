import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Pokemon, PokemonType } from '../data/types.ts'
import { totalsByType } from '../lib/aggregations.ts'
import { usePalette } from '../theme/palette.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { Chart } from './Chart.tsx'
import { baseOption, categoryAxis, tooltipRow, valueAxis } from './common.ts'

interface Props {
  pokemon: Pokemon[]
  types: PokemonType[]
}

/** One box per type: the spread of base stat totals, strongest median on top. */
export function TotalsByTypeChart({ pokemon, types }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const nameOf = (key: string) => types.find((type) => type.key === key)?.name[lang] ?? key
  const format = (value: number) => Math.round(value).toLocaleString(lang)

  const rows = useMemo(() => totalsByType(pokemon, types.map((type) => type.key)), [pokemon, types])
  const drawn = useMemo(() => [...rows].reverse(), [rows])
  const labels = ['min', 'q1', 'median', 'q3', 'max'].map((key) => t(`charts.totalsByType.${key}`))

  const option = {
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
          order.map((i) => tooltipRow(palette.series1, labels[i], format(row.box[i]), palette)).join('')
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

  return (
    <ChartCard
      title={t('charts.totalsByType.title')}
      subtitle={t('charts.totalsByType.subtitle')}
      table={{
        columns: [t('filters.type'), 'Pokémon', ...labels],
        rows: rows.map((row) => [nameOf(row.type), row.count, ...row.box.map(format)]),
      }}
    >
      <Chart option={option} height={520} label={t('charts.totalsByType.title')} />
    </ChartCard>
  )
}
