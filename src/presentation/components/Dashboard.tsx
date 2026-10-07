import { useTranslation } from 'react-i18next'
import type { Pokedex } from '../../domain/pokemon.ts'
import { EfficacyHeatmap } from '../charts/EfficacyHeatmap.tsx'
import { GenerationChart } from '../charts/GenerationChart.tsx'
import { SizeScatter } from '../charts/SizeScatter.tsx'
import { SpecialChart } from '../charts/SpecialChart.tsx'
import { TotalsByTypeChart } from '../charts/TotalsByTypeChart.tsx'
import { TypeCountChart } from '../charts/TypeCountChart.tsx'
import { FilterBar } from './FilterBar.tsx'
import { KpiRow } from './KpiRow.tsx'
import { useFilters } from './useFilters.ts'

/** Lays out the filters, the headline numbers and the charts for the current selection. */
export function Dashboard({ pokedex }: { pokedex: Pokedex }) {
  const { t } = useTranslation()
  const { filters, setFilters, toggleType, pokemon, generations } = useFilters(pokedex)

  return (
    <>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        types={pokedex.types}
        generations={pokedex.generations}
        shown={pokemon.length}
        total={pokedex.pokemon.length}
      />
      {pokemon.length === 0 ? (
        <p className="empty">{t('empty')}</p>
      ) : (
        <>
          <KpiRow pokemon={pokemon} types={pokedex.types} />
          <div className="grid">
            <TypeCountChart
              pokemon={pokemon}
              types={pokedex.types}
              selectedTypes={filters.types}
              onToggleType={toggleType}
            />
            <TotalsByTypeChart pokemon={pokemon} types={pokedex.types} />
            <GenerationChart pokemon={pokemon} generations={generations} />
            <SpecialChart pokemon={pokemon} />
            <SizeScatter pokemon={pokemon} />
          </div>
        </>
      )}
      <div className="grid">
        <EfficacyHeatmap types={pokedex.types} efficacy={pokedex.efficacy} />
      </div>
    </>
  )
}
