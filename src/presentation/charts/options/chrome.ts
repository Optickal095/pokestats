import type { ChartPalette } from '../../theme/palette.ts'

/** Escapes text before it goes into tooltip HTML. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif'

/** Shared chrome: recessive hairline axes and grid, text in text tokens, one tooltip style. */
export function baseOption(palette: ChartPalette) {
  return {
    backgroundColor: 'transparent',
    aria: { enabled: true },
    animationDuration: 300,
    textStyle: { fontFamily: FONT, color: palette.textSecondary },
    tooltip: {
      backgroundColor: palette.surface,
      borderColor: palette.grid,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: palette.text, fontFamily: FONT, fontSize: 13 },
      extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.12); border-radius: 8px;',
    },
  }
}

export function valueAxis(palette: ChartPalette, extra: Record<string, unknown> = {}) {
  return {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: palette.muted, fontSize: 12 },
    splitLine: { lineStyle: { color: palette.grid, width: 1, type: 'solid' } },
    ...extra,
  }
}

export function categoryAxis(palette: ChartPalette, data: string[], extra: Record<string, unknown> = {}) {
  return {
    type: 'category',
    data,
    axisLine: { lineStyle: { color: palette.axis } },
    axisTick: { show: false },
    axisLabel: { color: palette.textSecondary, fontSize: 12 },
    ...extra,
  }
}

/** Legend with marks that mirror the series shape; text stays in text tokens. */
export function legend(palette: ChartPalette, mark: 'rect' | 'line' | 'dot', extra: Record<string, unknown> = {}) {
  const icons = { rect: 'roundRect', line: 'roundRect', dot: 'circle' }
  return {
    top: 0,
    left: 0,
    icon: icons[mark],
    itemWidth: mark === 'dot' ? 8 : 12,
    itemHeight: mark === 'line' ? 3 : mark === 'dot' ? 8 : 12,
    textStyle: { color: palette.textSecondary, fontSize: 12 },
    ...extra,
  }
}

/** One row of a tooltip: a short line key in the series color, the value strong, the label secondary. */
export function tooltipRow(color: string, label: string, value: string, palette: ChartPalette): string {
  return (
    `<div style="display:flex;align-items:center;gap:8px;margin-top:4px">` +
    `<span style="width:10px;height:2px;background:${color};display:inline-block"></span>` +
    `<strong style="color:${palette.text}">${escapeHtml(value)}</strong>` +
    `<span style="color:${palette.textSecondary}">${escapeHtml(label)}</span></div>`
  )
}
