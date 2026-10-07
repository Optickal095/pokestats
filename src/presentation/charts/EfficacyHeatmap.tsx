import { useTranslation } from 'react-i18next'
import type { Pokedex } from '../../domain/pokemon.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { usePalette } from '../theme/usePalette.ts'
import { Chart } from './Chart.tsx'
import { buildEfficacyOption, multiplier } from './options/efficacy.ts'

interface Props {
  types: Pokedex['types']
  efficacy: Pokedex['efficacy']
}

export function EfficacyHeatmap({ types, efficacy }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const nameOf = (key: string) => types.find((type) => type.key === key)?.name[lang] ?? key

  const option = buildEfficacyOption({
    types,
    efficacy,
    nameOf,
    levelNames: {
      immune: t('charts.efficacy.immune'),
      resisted: t('charts.efficacy.resisted'),
      neutral: t('charts.efficacy.neutral'),
      superEffective: t('charts.efficacy.superEffective'),
    },
    palette,
  })

  return (
    <ChartCard
      wide
      title={t('charts.efficacy.title')}
      subtitle={t('charts.efficacy.subtitle')}
      table={{
        columns: [
          `${t('charts.efficacy.attacker')} \\ ${t('charts.efficacy.defender')}`,
          ...types.map((type) => nameOf(type.key)),
        ],
        rows: types.map((attacker) => [
          nameOf(attacker.key),
          ...types.map((defender) => `×${multiplier(efficacy, attacker.key, defender.key)}`),
        ]),
      }}
    >
      <Chart option={option} height={620} label={t('charts.efficacy.title')} />
    </ChartCard>
  )
}
