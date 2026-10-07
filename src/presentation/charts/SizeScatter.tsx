import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Pokemon } from '../../domain/pokemon.ts'
import { artworkUrl } from '../artwork.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { useSelection } from '../selection/useSelection.ts'
import { usePalette } from '../theme/usePalette.ts'
import { Chart } from './Chart.tsx'
import { buildSizeOption } from './options/size.ts'

interface Props {
  pokemon: Pokemon[]
}

export function SizeScatter({ pokemon }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const format = (value: number) => value.toLocaleString(lang, { maximumFractionDigits: 1 })
  const nameOf = (p: Pokemon) => p.name[lang]
  const { open } = useSelection()

  const option = buildSizeOption({
    pokemon,
    nameOf,
    groupNames: { regular: t('filters.regular'), legendary: t('groups.legendary'), mythical: t('groups.mythical') },
    axisNames: { height: t('charts.size.height'), weight: t('charts.size.weight') },
    artworkOf: artworkUrl,
    format,
    palette,
  })
  const heaviestFirst = useMemo(() => [...pokemon].sort((a, b) => b.weight - a.weight), [pokemon])

  return (
    <ChartCard
      wide
      title={t('charts.size.title')}
      subtitle={t('charts.size.subtitle')}
      table={{
        columns: [t('charts.size.name'), t('charts.size.height'), t('charts.size.weight')],
        rows: heaviestFirst.map((p) => [nameOf(p), format(p.height), format(p.weight)]),
      }}
    >
      <Chart
        option={option}
        height={460}
        label={t('charts.size.title')}
        onClick={(params) => open((params.data as { pokemon: Pokemon }).pokemon.id)}
      />
    </ChartCard>
  )
}
