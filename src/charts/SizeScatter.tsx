import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { artworkUrl } from '../data/transform.ts'
import type { Pokemon } from '../data/types.ts'
import { usePalette } from '../theme/palette.ts'
import { ChartCard } from '../components/ChartCard.tsx'
import { Chart } from './Chart.tsx'
import { baseOption, escapeHtml, legend, valueAxis } from './common.ts'

interface Props {
  pokemon: Pokemon[]
}

/**
 * Every Pokémon as a dot on log scales. Three groups at most (the all-pairs
 * limit for scatter colors): the rest in gray as context, legendary and
 * mythical in the two accent hues. Only the tallest and heaviest get a label.
 */
export function SizeScatter({ pokemon }: Props) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const format = (value: number) => value.toLocaleString(lang, { maximumFractionDigits: 1 })

  const option = (() => {
    const tallest = pokemon.reduce<Pokemon | null>((a, p) => (!a || p.height > a.height ? p : a), null)
    const heaviest = pokemon.reduce<Pokemon | null>((a, p) => (!a || p.weight > a.weight ? p : a), null)
    const labeled = new Set([tallest?.id, heaviest?.id])

    const groups = [
      { name: t('filters.regular'), color: palette.context, match: (p: Pokemon) => !p.legendary && !p.mythical },
      { name: t('groups.legendary'), color: palette.series1, match: (p: Pokemon) => p.legendary },
      { name: t('groups.mythical'), color: palette.series2, match: (p: Pokemon) => p.mythical },
    ]

    return {
      ...baseOption(palette),
      color: groups.map((g) => g.color),
      // Legend on the right, so the y-axis name keeps the top-left corner.
    legend: legend(palette, 'dot', { left: 'auto', right: 0 }),
      grid: { left: 8, right: 24, top: 40, bottom: 28, containLabel: true },
      xAxis: valueAxis(palette, {
        type: 'log',
        name: t('charts.size.height'),
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: palette.textSecondary },
        splitLine: { lineStyle: { color: palette.grid } },
      }),
      yAxis: valueAxis(palette, {
        type: 'log',
        name: t('charts.size.weight'),
        nameTextStyle: { color: palette.textSecondary, align: 'left' },
      }),
      tooltip: {
        ...baseOption(palette).tooltip,
        trigger: 'item',
        formatter: (params: { data: { value: [number, number]; pokemon: Pokemon } }) => {
          const p = params.data.pokemon
          return (
            `<div style="display:flex;gap:12px;align-items:center">` +
            `<img src="${artworkUrl(p.id)}" alt="" width="64" height="64" style="object-fit:contain"/>` +
            `<div><strong>${escapeHtml(p.name[lang])}</strong> <span style="color:${palette.muted}">#${p.id}</span>` +
            `<div style="color:${palette.textSecondary}">${format(p.height)} m · ${format(p.weight)} kg</div></div></div>`
          )
        },
      },
      series: groups.map((group, i) => ({
        name: group.name,
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
                formatter: p.name[lang],
                position: p.height < 1 ? 'right' : 'left',
                color: palette.textSecondary,
                fontSize: 12,
              }
            : undefined,
        })),
      })),
    }
  })()

  const sorted = useMemo(() => [...pokemon].sort((a, b) => b.weight - a.weight), [pokemon])

  return (
    <ChartCard
      wide
      title={t('charts.size.title')}
      subtitle={t('charts.size.subtitle')}
      table={{
        columns: [t('charts.size.name'), t('charts.size.height'), t('charts.size.weight')],
        rows: sorted.map((p) => [p.name[lang], format(p.height), format(p.weight)]),
      }}
    >
      <Chart option={option} height={460} label={t('charts.size.title')} />
    </ChartCard>
  )
}
