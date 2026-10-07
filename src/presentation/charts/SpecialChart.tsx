import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { averageStats } from '../../domain/aggregations.ts'
import { isSpecial } from '../../domain/filters.ts'
import { STAT_KEYS, type Pokemon, type StatKey } from '../../domain/pokemon.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { usePalette } from '../theme/usePalette.ts'
import { Chart } from './Chart.tsx'
import { buildSpecialOption, type StatGroup } from './options/special.ts'

interface Props {
  pokemon: Pokemon[]
}

/** Legendary + mythical Pokémon next to the rest. */
export function SpecialChart({ pokemon }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const format = (value: number) => Math.round(value).toLocaleString(lang)
  const statName = (stat: StatKey) => t(`stats.${stat}`)

  const groups = useMemo<StatGroup[]>(() => {
    const special = pokemon.filter(isSpecial)
    const regular = pokemon.filter((p) => !isSpecial(p))
    return [
      { name: t('filters.special'), count: special.length, stats: averageStats(special), color: palette.series1 },
      { name: t('filters.regular'), count: regular.length, stats: averageStats(regular), color: palette.series2 },
    ]
  }, [pokemon, palette, t])
  const option = buildSpecialOption({ groups, statName, format, palette })

  return (
    <ChartCard
      title={t('charts.special.title')}
      subtitle={t('charts.special.subtitle')}
      table={{
        columns: [t('charts.special.stat'), ...groups.map((g) => `${g.name} (${g.count})`)],
        rows: STAT_KEYS.map((stat) => [statName(stat), ...groups.map((g) => (g.count ? format(g.stats[stat]) : '–'))]),
      }}
    >
      <Chart option={option} height={320} label={t('charts.special.title')} />
    </ChartCard>
  )
}
