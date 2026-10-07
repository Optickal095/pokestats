import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { isComparisonFull } from '../../domain/comparison.ts'
import { STAT_KEYS, type Pokedex, type StatKey } from '../../domain/pokemon.ts'
import { artworkUrl } from '../artwork.ts'
import { Chart } from '../charts/Chart.tsx'
import { buildCompareOption, slotColor, type ComparedEntry } from '../charts/options/compare.ts'
import { useSelection } from '../selection/useSelection.ts'
import { usePalette } from '../theme/usePalette.ts'
import { ChartCard } from './ChartCard.tsx'
import { PokemonSearch } from './PokemonSearch.tsx'

/** Compares up to three Pokémon from the whole Pokédex (the filters do not apply here). */
export function Comparator({ pokedex }: { pokedex: Pokedex }) {
  const { t, i18n } = useTranslation()
  const palette = usePalette()
  const lang = i18n.language as 'es' | 'en'
  const { compared, compare, uncompare, open } = useSelection()
  const statName = (stat: StatKey) => t(`stats.${stat}`)

  const byId = useMemo(() => new Map(pokedex.pokemon.map((p) => [p.id, p])), [pokedex])
  const entries = compared.flatMap<ComparedEntry>((id, slot) => {
    const pokemon = id === null ? undefined : byId.get(id)
    return pokemon ? [{ slot, pokemon, name: pokemon.name[lang] }] : []
  })
  const full = isComparisonFull(compared)

  return (
    <ChartCard
      wide
      title={t('compare.title')}
      subtitle={t('compare.subtitle')}
      table={{
        columns: [t('compare.stat'), ...entries.map((entry) => entry.name)],
        rows: [
          ...STAT_KEYS.map((stat) => [statName(stat), ...entries.map((entry) => entry.pokemon.stats[stat])]),
          [t('stats.total'), ...entries.map((entry) => entry.pokemon.total)],
        ],
      }}
    >
      <div className="compare-controls">
        <PokemonSearch pokemon={pokedex.pokemon} onSelect={(p) => compare(p.id)} disabled={full} />
        {full && <p className="compare-note">{t('compare.full')}</p>}
      </div>

      <ul className="compare-list">
        {entries.map((entry) => (
          <li key={entry.pokemon.id} className="compare-item">
            <span className="compare-key" style={{ background: slotColor(palette, entry.slot) }} aria-hidden="true" />
            <img src={artworkUrl(entry.pokemon.id)} alt="" width={48} height={48} loading="lazy" />
            <button
              type="button"
              className="link-button compare-name"
              onClick={() => open(entry.pokemon.id)}
              aria-label={t('compare.showDetail', { name: entry.name })}
            >
              {entry.name}
            </button>
            <span className="compare-total">
              {entry.pokemon.total} {t('stats.total').toLowerCase()}
            </span>
            <button
              type="button"
              className="icon-button"
              onClick={() => uncompare(entry.pokemon.id)}
              aria-label={t('compare.remove', { name: entry.name })}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {entries.length === 0 ? (
        <p className="empty">{t('compare.empty')}</p>
      ) : (
        <Chart option={buildCompareOption({ entries, statName, palette })} height={360} label={t('compare.title')} />
      )}
    </ChartCard>
  )
}
