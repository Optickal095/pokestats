import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { countByType } from '../../domain/aggregations.ts'
import type { Pokemon, PokemonType } from '../../domain/pokemon.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { usePalette } from '../theme/usePalette.ts'
import { Chart } from './Chart.tsx'
import { buildTypeCountOption } from './options/type-count.ts'

interface Props {
  pokemon: Pokemon[]
  types: PokemonType[]
  selectedTypes: string[]
  onToggleType: (type: string) => void
}

export function TypeCountChart({ pokemon, types, selectedTypes, onToggleType }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const nameOf = (key: string) => types.find((type) => type.key === key)?.name[lang] ?? key

  const rows = useMemo(() => countByType(pokemon, types.map((type) => type.key)), [pokemon, types])
  const { option, typeAt } = buildTypeCountOption({
    rows,
    selectedTypes,
    nameOf,
    countLabel: t('charts.byType.count'),
    palette,
  })

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
        onClick={(params) => onToggleType(typeAt(params.dataIndex))}
      />
    </ChartCard>
  )
}
