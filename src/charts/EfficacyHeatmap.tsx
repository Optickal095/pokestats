import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Dataset } from '../data/types.ts'
import { inkOn, usePalette } from '../theme/palette.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { Chart } from './Chart.tsx'
import { baseOption, categoryAxis, tooltipRow } from './common.ts'

interface Props {
  types: Dataset['types']
  efficacy: Dataset['efficacy']
}

const SYMBOL: Record<number, string> = { 0: '0', 0.5: '½', 1: '', 2: '2' }

/**
 * 18 × 18 grid on a diverging scale centred on ×1 (neutral gray): blue for
 * resisted and immune, red for super effective. Cells other than ×1 also show
 * their multiplier, so color is never the only cue.
 */
export function EfficacyHeatmap({ types, efficacy }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const names = types.map((type) => type.name[lang])

  const levels = useMemo(
    () => [
      { value: 0, color: palette.immune, label: t('charts.efficacy.immune') },
      { value: 0.5, color: palette.resisted, label: t('charts.efficacy.resisted') },
      { value: 1, color: palette.neutral, label: t('charts.efficacy.neutral') },
      { value: 2, color: palette.superEffective, label: t('charts.efficacy.superEffective') },
    ],
    [palette, t],
  )
  const multiplier = (attacker: string, defender: string) => efficacy[attacker]?.[defender] ?? 1

  const option = {
    ...baseOption(palette),
    grid: { left: 8, right: 8, top: 56, bottom: 8, containLabel: true },
    xAxis: categoryAxis(palette, names, {
      position: 'top',
      axisLine: { show: false },
      axisLabel: { color: palette.textSecondary, fontSize: 11, rotate: 45, interval: 0 },
    }),
    yAxis: categoryAxis(palette, names, {
      inverse: true,
      axisLine: { show: false },
      axisLabel: { color: palette.textSecondary, fontSize: 11, interval: 0 },
    }),
    visualMap: {
      type: 'piecewise',
      orient: 'horizontal',
      top: 0,
      left: 0,
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      textStyle: { color: palette.textSecondary, fontSize: 12 },
      pieces: levels.map((level) => ({ value: level.value, color: level.color, label: level.label })),
    },
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'item',
      formatter: (params: { value: [number, number, number] }) => {
        const [x, y, value] = params.value
        const level = levels.find((l) => l.value === value)
        return `${names[y]} → ${names[x]}` + tooltipRow(level?.color ?? palette.axis, level?.label ?? '', `×${value}`, palette)
      },
    },
    series: [
      {
        type: 'heatmap',
        data: types.flatMap((attacker, y) =>
          types.map((defender, x) => {
            const value = multiplier(attacker.key, defender.key)
            const fill = levels.find((l) => l.value === value)?.color ?? palette.neutral
            return {
              value: [x, y, value],
              label: { show: value !== 1, formatter: SYMBOL[value], color: inkOn(fill), fontSize: 11, fontWeight: 600 },
            }
          }),
        ),
        itemStyle: { borderColor: palette.surface, borderWidth: 2, borderRadius: 3 },
        emphasis: { itemStyle: { borderColor: palette.text, borderWidth: 1 } },
      },
    ],
  }

  return (
    <ChartCard
      wide
      title={t('charts.efficacy.title')}
      subtitle={t('charts.efficacy.subtitle')}
      table={{
        columns: [`${t('charts.efficacy.attacker')} \\ ${t('charts.efficacy.defender')}`, ...names],
        rows: types.map((attacker) => [
          attacker.name[lang],
          ...types.map((defender) => `×${multiplier(attacker.key, defender.key)}`),
        ]),
      }}
    >
      <Chart option={option} height={620} label={t('charts.efficacy.title')} />
    </ChartCard>
  )
}
