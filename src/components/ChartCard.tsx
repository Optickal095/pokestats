import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export interface TableData {
  columns: string[]
  rows: (string | number)[][]
}

interface ChartCardProps {
  title: string
  subtitle: string
  /** The same data as the chart, as a table: readable without hovering or seeing color. */
  table: TableData
  wide?: boolean
  children: ReactNode
}

export function ChartCard({ title, subtitle, table, wide, children }: ChartCardProps) {
  const { t } = useTranslation()
  const [showTable, setShowTable] = useState(false)

  return (
    <section className={wide ? 'card card-wide' : 'card'}>
      <header className="card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button type="button" className="link-button" onClick={() => setShowTable(!showTable)}>
          {showTable ? t('charts.showChart') : t('charts.showTable')}
        </button>
      </header>
      {showTable ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
