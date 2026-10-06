import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { STAT_KEYS, type Pokemon } from '../data/types.ts'
import { averageStats } from '../lib/aggregations.ts'
import { isSpecial } from '../lib/filters.ts'
import { usePalette } from '../theme/palette.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { Chart } from './Chart.tsx'
import { baseOption, categoryAxis, legend, tooltipRow, valueAxis } from './common.ts'

interface Props {
  pokemon: Pokemon[]
}

/** Grouped bars: the six average base stats of legendary + mythical Pokémon next to the rest. */
export function SpecialChart({ pokemon }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const format = (value: number) => Math.round(value).toLocaleString(lang)

  const groups = useMemo(() => {
    const special = pokemon.filter(isSpecial)
    const regular = pokemon.filter((p) => !isSpecial(p))
    return [
      { name: t('filters.special'), count: special.length, stats: averageStats(special), color: palette.series1 },
      { name: t('filters.regular'), count: regular.length, stats: averageStats(regular), color: palette.series2 },
    ]
  }, [pokemon, palette, t])

  const statNames = STAT_KEYS.map((stat) => t(`stats.${stat}`))
  const drawnStats = [...STAT_KEYS].reverse()

  const option = {
    ...baseOption(palette),
    color: groups.map((g) => g.color),
    legend: legend(palette, 'rect'),
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    xAxis: valueAxis(palette),
    yAxis: categoryAxis(palette, drawnStats.map((stat) => t(`stats.${stat}`))),
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: `${palette.axis}33` } },
      formatter: (params: { dataIndex: number }[]) => {
        const stat = drawnStats[params[0].dataIndex]
        return (
          t(`stats.${stat}`) +
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

  return (
    <ChartCard
      title={t('charts.special.title')}
      subtitle={t('charts.special.subtitle')}
      table={{
        columns: [t('charts.special.stat'), ...groups.map((g) => `${g.name} (${g.count})`)],
        rows: STAT_KEYS.map((stat, i) => [statNames[i], ...groups.map((g) => (g.count ? format(g.stats[stat]) : '–'))]),
      }}
    >
      <Chart option={option} height={320} label={t('charts.special.title')} />
    </ChartCard>
  )
}
