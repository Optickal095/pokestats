import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { averagesByGeneration } from '../../domain/aggregations.ts'
import type { Generation, Pokemon } from '../../domain/pokemon.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { usePalette } from '../theme/usePalette.ts'
import { Chart } from './Chart.tsx'
import { buildGenerationOption } from './options/generation.ts'

interface Props {
  pokemon: Pokemon[]
  generations: Generation[]
}

export function GenerationChart({ pokemon, generations }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const format = (value: number | null) => (value === null ? '–' : Math.round(value).toLocaleString(lang))
  const nameOf = (id: number) => generations.find((g) => g.id === id)?.name[lang] ?? String(id)
  const seriesNames: [string, string] = [t('charts.generation.all'), t('charts.generation.regular')]

  const rows = useMemo(() => averagesByGeneration(pokemon, generations), [pokemon, generations])
  const option = buildGenerationOption({
    rows,
    describe: (id) => `${nameOf(id)} · ${generations.find((g) => g.id === id)?.region ?? ''}`,
    seriesNames,
    format,
    palette,
  })

  return (
    <ChartCard
      title={t('charts.generation.title')}
      subtitle={t('charts.generation.subtitle')}
      table={{
        columns: [t('filters.generation'), t('charts.generation.count'), ...seriesNames],
        rows: rows.map((row) => [nameOf(row.generation), row.count, format(row.average), format(row.averageRegular)]),
      }}
    >
      <Chart option={option} height={320} label={t('charts.generation.title')} />
    </ChartCard>
  )
}
