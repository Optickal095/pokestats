/**
 * Chart colors for each color scheme. The two series hues are the first two
 * slots of a categorical palette validated for color-vision deficiency and
 * contrast on these surfaces, in both modes. The effectiveness scale is
 * diverging: blue for resisted/immune, neutral gray for ×1, red for ×2.
 */
export interface ChartPalette {
  surface: string
  text: string
  textSecondary: string
  muted: string
  grid: string
  axis: string
  series1: string
  series2: string
  /** Third series, for the comparator only: three is the most hues that stay distinguishable in every pair. */
  series3: string
  /** De-emphasized marks: the "everything else" in an emphasis chart. */
  context: string
  immune: string
  resisted: string
  neutral: string
  superEffective: string
}

export const lightPalette: ChartPalette = {
  surface: '#ffffff',
  text: '#15132b',
  textSecondary: '#4f4b63',
  muted: '#858199',
  grid: '#e8e5f1',
  axis: '#cbc7dc',
  series1: '#2a78d6',
  series2: '#eb6834',
  series3: '#1baf7a',
  context: '#c9c5d8',
  immune: '#184f95',
  resisted: '#86b6ef',
  neutral: '#f1eff7',
  superEffective: '#e34948',
}

export const darkPalette: ChartPalette = {
  surface: '#181a2e',
  text: '#ffffff',
  textSecondary: '#c2c0d8',
  muted: '#8d8aa8',
  grid: '#262a45',
  axis: '#33385a',
  series1: '#3987e5',
  series2: '#d95926',
  series3: '#199e70',
  context: '#4a4f72',
  immune: '#6da7ec',
  resisted: '#1c5cab',
  neutral: '#2a2e4a',
  superEffective: '#e66767',
}

/** Black or white text, whichever reads better on the given fill. */
export function inkOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  return luminance > 0.4 ? '#0b0b0b' : '#ffffff'
}
