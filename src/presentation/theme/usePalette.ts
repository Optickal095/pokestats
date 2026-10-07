import { useEffect, useState } from 'react'
import { darkPalette, lightPalette, type ChartPalette } from './palette.ts'

const query = '(prefers-color-scheme: dark)'

/** Follows the operating system's light/dark setting. */
export function usePalette(): ChartPalette {
  const [isDark, setIsDark] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setIsDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isDark ? darkPalette : lightPalette
}
