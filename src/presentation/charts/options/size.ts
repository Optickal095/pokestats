import type { Pokemon } from '../../../domain/pokemon.ts'
import type { ChartPalette } from '../../theme/palette.ts'
import { baseOption, escapeHtml, legend, valueAxis } from './chrome.ts'

export interface SizeInput {
  pokemon: Pokemon[]
  nameOf: (pokemon: Pokemon) => string
  groupNames: { regular: string; legendary: string; mythical: string }
  axisNames: { height: string; weight: string }
  artworkOf: (id: number) => string
  format: (value: number) => string
  palette: ChartPalette
}

/** Strategy for coloring the scatter: which group each Pokémon belongs to. */
const GROUPS = [
  { key: 'regular', match: (p: Pokemon) => !p.legendary && !p.mythical },
  { key: 'legendary', match: (p: Pokemon) => p.legendary },
  { key: 'mythical', match: (p: Pokemon) => p.mythical },
] as const

/**
 * Every Pokémon as a dot on log scales. Three groups at most (the all-pairs
 * limit for scatter colors): the rest in gray as context, legendary and
 * mythical in the two accent hues. Only the tallest and heaviest get a label.
 */
export function buildSizeOption({ pokemon, nameOf, groupNames, axisNames, artworkOf, format, palette }: SizeInput) {
  const tallest = pokemon.reduce<Pokemon | null>((a, p) => (!a || p.height > a.height ? p : a), null)
  const heaviest = pokemon.reduce<Pokemon | null>((a, p) => (!a || p.weight > a.weight ? p : a), null)
  const labeled = new Set([tallest?.id, heaviest?.id])
  const colors = { regular: palette.context, legendary: palette.series1, mythical: palette.series2 }

  return {
    ...baseOption(palette),
    color: GROUPS.map((g) => colors[g.key]),
    // Legend on the right, so the y-axis name keeps the top-left corner.
    legend: legend(palette, 'dot', { left: 'auto', right: 0 }),
    grid: { left: 8, right: 24, top: 40, bottom: 28, containLabel: true },
    xAxis: valueAxis(palette, {
      type: 'log',
      name: axisNames.height,
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: palette.textSecondary },
      splitLine: { lineStyle: { color: palette.grid } },
    }),
    yAxis: valueAxis(palette, {
      type: 'log',
      name: axisNames.weight,
      nameTextStyle: { color: palette.textSecondary, align: 'left' },
    }),
    tooltip: {
      ...baseOption(palette).tooltip,
      trigger: 'item',
      formatter: (params: { data: { pokemon: Pokemon } }) => {
        const p = params.data.pokemon
        return (
          `<div style="display:flex;gap:12px;align-items:center">` +
          `<img src="${artworkOf(p.id)}" alt="" width="64" height="64" style="object-fit:contain"/>` +
          `<div><strong>${escapeHtml(nameOf(p))}</strong> <span style="color:${palette.muted}">#${p.id}</span>` +
          `<div style="color:${palette.textSecondary}">${format(p.height)} m · ${format(p.weight)} kg</div></div></div>`
        )
      },
    },
    series: GROUPS.map((group, i) => ({
      name: groupNames[group.key],
      type: 'scatter',
      symbolSize: 8,
      // The gray context sits underneath the highlighted groups.
      z: i === 0 ? 1 : 2,
      itemStyle: { borderColor: palette.surface, borderWidth: 1.5, opacity: i === 0 ? 0.7 : 1 },
      emphasis: { scale: 1.6 },
      data: pokemon.filter(group.match).map((p) => ({
        value: [p.height, p.weight],
        pokemon: p,
        // Labels point toward the middle of the plot so they never leave it.
        label: labeled.has(p.id)
          ? {
              show: true,
              formatter: nameOf(p),
              position: p.height < 1 ? 'right' : 'left',
              color: palette.textSecondary,
              fontSize: 12,
            }
          : undefined,
      })),
    })),
  }
}
