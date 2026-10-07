import { useEffect, useRef } from 'react'
import { echarts, type ChartOption } from './echarts.ts'

interface ChartProps {
  option: ChartOption
  height: number
  /** Accessible name of the chart. */
  label: string
  onClick?: (params: { name: string; dataIndex: number; seriesIndex?: number; data?: unknown }) => void
}

/** Minimal React wrapper around an ECharts instance (SVG renderer). */
export function Chart({ option, height, label, onClick }: ChartProps) {
  const container = useRef<HTMLDivElement>(null)
  const chart = useRef<ReturnType<typeof echarts.init> | null>(null)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const instance = echarts.init(element, null, { renderer: 'svg' })
    chart.current = instance
    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(element)
    return () => {
      observer.disconnect()
      instance.dispose()
      chart.current = null
    }
  }, [])

  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true })
  }, [option])

  useEffect(() => {
    const instance = chart.current
    if (!instance || !onClick) return
    instance.on('click', onClick as never)
    return () => {
      instance.off('click', onClick as never)
    }
  }, [onClick])

  return <div ref={container} role="img" aria-label={label} style={{ width: '100%', height }} />
}
