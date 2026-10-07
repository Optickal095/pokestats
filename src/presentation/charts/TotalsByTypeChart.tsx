import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { totalsByType } from '../../domain/aggregations.ts'
import type { Pokemon, PokemonType } from '../../domain/pokemon.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { usePalette } from '../theme/usePalette.ts'
import { Chart } from './Chart.tsx'
import { buildTotalsByTypeOption } from './options/totals-by-type.ts'

interface Props {
  pokemon: Pokemon[]
  types: PokemonType[]
}

export function TotalsByTypeChart({ pokemon, types }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const nameOf = (key: string) => types.find((type) => type.key === key)?.name[lang] ?? key
  const format = (value: number) => Math.round(value).toLocaleString(lang)
  const boxLabels = ['min', 'q1', 'median', 'q3', 'max'].map((key) => t(`charts.totalsByType.${key}`))

  const rows = useMemo(() => totalsByType(pokemon, types.map((type) => type.key)), [pokemon, types])
  const option = buildTotalsByTypeOption({ rows, nameOf, boxLabels, format, palette })

  return (
    <ChartCard
      title={t('charts.totalsByType.title')}
      subtitle={t('charts.totalsByType.subtitle')}
      table={{
        columns: [t('filters.type'), 'Pokémon', ...boxLabels],
        rows: rows.map((row) => [nameOf(row.type), row.count, ...row.box.map(format)]),
      }}
    >
      <Chart option={option} height={520} label={t('charts.totalsByType.title')} />
    </ChartCard>
  )
}
