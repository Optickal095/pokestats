import type { Pokedex } from '../../../domain/pokemon.ts'
import { inkOn, type ChartPalette } from '../../theme/palette.ts'
import { baseOption, categoryAxis, tooltipRow } from './chrome.ts'

export interface EfficacyInput {
  types: Pokedex['types']
  efficacy: Pokedex['efficacy']
  nameOf: (type: string) => string
  /** Names of the four levels: ×0, ×½, ×1 and ×2. */
  levelNames: { immune: string; resisted: string; neutral: string; superEffective: string }
  palette: ChartPalette
}

const SYMBOL: Record<number, string> = { 0: '0', 0.5: '½', 1: '', 2: '2' }

/** Damage multiplier of an attacking type against a defending one (×1 when not listed). */
export function multiplier(efficacy: Pokedex['efficacy'], attacker: string, defender: string): number {
  return efficacy[attacker]?.[defender] ?? 1
}

/**
 * 18 × 18 grid on a diverging scale centred on ×1 (neutral gray): blue for
 * resisted and immune, red for super effective. Cells other than ×1 also show
 * their multiplier, so color is never the only cue.
 */
export function buildEfficacyOption({ types, efficacy, nameOf, levelNames, palette }: EfficacyInput) {
  const names = types.map((type) => nameOf(type.key))
  const levels = [
    { value: 0, color: palette.immune, label: levelNames.immune },
    { value: 0.5, color: palette.resisted, label: levelNames.resisted },
    { value: 1, color: palette.neutral, label: levelNames.neutral },
    { value: 2, color: palette.superEffective, label: levelNames.superEffective },
  ]

  return {
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
            const value = multiplier(efficacy, attacker.key, defender.key)
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
}
