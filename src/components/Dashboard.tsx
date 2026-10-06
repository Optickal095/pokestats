import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EfficacyHeatmap } from '../charts/EfficacyHeatmap.tsx'
import { GenerationChart } from '../charts/GenerationChart.tsx'
import { SizeScatter } from '../charts/SizeScatter.tsx'
import { SpecialChart } from '../charts/SpecialChart.tsx'
import { TotalsByTypeChart } from '../charts/TotalsByTypeChart.tsx'
import { TypeCountChart } from '../charts/TypeCountChart.tsx'
import type { Dataset } from '../data/types.ts'
import { applyFilters, NO_FILTERS, toggle, type Filters } from '../lib/filters.ts'
import { FilterBar } from './FilterBar.tsx'
import { KpiRow } from './KpiRow.tsx'

export function Dashboard({ dataset }: { dataset: Dataset }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const pokemon = useMemo(() => applyFilters(dataset.pokemon, filters), [dataset, filters])
  const generations = useMemo(
    () =>
      filters.generations.length
        ? dataset.generations.filter((g) => filters.generations.includes(g.id))
        : dataset.generations,
    [dataset, filters.generations],
  )
  const toggleType = useCallback(
    (type: string) => setFilters((current) => ({ ...current, types: toggle(current.types, type) })),
    [],
  )

  return (
    <>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        types={dataset.types}
        generations={dataset.generations}
        shown={pokemon.length}
        total={dataset.pokemon.length}
      />
      {pokemon.length === 0 ? (
        <p className="empty">{t('empty')}</p>
      ) : (
        <>
          <KpiRow pokemon={pokemon} types={dataset.types} />
          <div className="grid">
            <TypeCountChart
              pokemon={pokemon}
              types={dataset.types}
              selectedTypes={filters.types}
              onToggleType={toggleType}
            />
            <TotalsByTypeChart pokemon={pokemon} types={dataset.types} />
            <GenerationChart pokemon={pokemon} generations={generations} />
            <SpecialChart pokemon={pokemon} />
            <SizeScatter pokemon={pokemon} />
          </div>
        </>
      )}
      <div className="grid">
        <EfficacyHeatmap types={dataset.types} efficacy={dataset.efficacy} />
      </div>
    </>
  )
}
