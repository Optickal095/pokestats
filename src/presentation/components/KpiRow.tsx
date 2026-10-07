import { useTranslation } from 'react-i18next'
import { artworkUrl } from '../artwork.ts'
import type { Pokemon, PokemonType } from '../../domain/pokemon.ts'
import { summarize } from '../../domain/aggregations.ts'
import { useSelection } from '../selection/useSelection.ts'
import { TypeBadge } from './TypeBadge.tsx'

interface Props {
  pokemon: Pokemon[]
  types: PokemonType[]
}

/** Headline numbers for the current selection. */
export function KpiRow({ pokemon, types }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const summary = summarize(pokemon, types.map((type) => type.key))
  const topType = summary.topType ? types.find((type) => type.key === summary.topType?.type) : null

  return (
    <section className="kpis">
      <div className="kpi">
        <span className="kpi-label">{t('kpi.pokemon')}</span>
        <span className="kpi-value">{summary.count.toLocaleString(lang)}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">{t('kpi.averageTotal')}</span>
        <span className="kpi-value">{Math.round(summary.averageTotal).toLocaleString(lang)}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">{t('kpi.topType')}</span>
        {topType && summary.topType ? (
          <>
            <TypeBadge type={topType.key} label={topType.name[lang]} />
            <span className="kpi-detail">{t('kpi.topTypeDetail', { count: summary.topType.count })}</span>
          </>
        ) : (
          <span className="kpi-value">–</span>
        )}
      </div>
      <PokemonKpi
        label={t('kpi.strongest')}
        pokemon={summary.strongest}
        detail={summary.strongest && t('kpi.totalDetail', { value: summary.strongest.total })}
      />
      <PokemonKpi
        label={t('kpi.fastest')}
        pokemon={summary.fastest}
        detail={summary.fastest && t('kpi.speedDetail', { value: summary.fastest.stats.speed })}
      />
    </section>
  )
}

function PokemonKpi({ label, pokemon, detail }: { label: string; pokemon: Pokemon | null; detail: string | null }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const { open } = useSelection()

  return (
    <div className="kpi kpi-pokemon">
      <span className="kpi-label">{label}</span>
      {pokemon ? (
        <button
          type="button"
          className="kpi-pokemon-body"
          onClick={() => open(pokemon.id)}
          aria-label={`${t('compare.showDetail', { name: pokemon.name[lang] })}. ${detail ?? ''}`}
        >
          <img src={artworkUrl(pokemon.id)} alt="" width={56} height={56} loading="lazy" />
          <span>
            <span className="kpi-name">{pokemon.name[lang]}</span>
            <span className="kpi-detail">{detail}</span>
          </span>
        </button>
      ) : (
        <span className="kpi-value">–</span>
      )}
    </div>
  )
}
