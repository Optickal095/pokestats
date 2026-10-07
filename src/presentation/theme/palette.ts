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
  /** De-emphasized marks: the "everything else" in an emphasis chart. */
  context: string
  immune: string
  resisted: string
  neutral: string
  superEffective: string
}

export const lightPalette: ChartPalette = {
  surface: '#fcfcfb',
  text: '#0b0b0b',
  textSecondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  series1: '#2a78d6',
  series2: '#eb6834',
  context: '#c3c2b7',
  immune: '#184f95',
  resisted: '#86b6ef',
  neutral: '#f0efec',
  superEffective: '#e34948',
}

export const darkPalette: ChartPalette = {
  surface: '#1a1a19',
  text: '#ffffff',
  textSecondary: '#c3c2b7',
  muted: '#898781',
  grid: '#2c2c2a',
  axis: '#383835',
  series1: '#3987e5',
  series2: '#d95926',
  context: '#55554f',
  immune: '#6da7ec',
  resisted: '#1c5cab',
  neutral: '#383835',
  superEffective: '#e66767',
}

/** Black or white text, whichever reads better on the given fill. */
export function inkOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  return luminance > 0.4 ? '#0b0b0b' : '#ffffff'
}
