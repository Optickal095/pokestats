import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { isComparisonFull } from '../../domain/comparison.ts'
import { evolutionStages } from '../../domain/evolution.ts'
import { STAT_KEYS, type Pokedex, type Pokemon } from '../../domain/pokemon.ts'
import { artworkUrl } from '../artwork.ts'
import { useSelection } from '../selection/useSelection.ts'
import { TypeBadge } from './TypeBadge.tsx'

/** Highest base stat any Pokémon has (Blissey's HP), so every bar shares one scale. */
const MAX_STAT = 255

/** Detail of the selected Pokémon in a native modal dialog (focus trap, Escape and backdrop for free). */
export function PokemonDialog({ pokedex }: { pokedex: Pokedex }) {
  const { detailId, close } = useSelection()
  const dialog = useRef<HTMLDialogElement>(null)
  const pokemon = useMemo(() => pokedex.pokemon.find((p) => p.id === detailId) ?? null, [pokedex, detailId])

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (pokemon && !element.open) element.showModal()
    if (!pokemon && element.open) element.close()
  }, [pokemon])

  return (
    <dialog
      ref={dialog}
      className="pokemon-dialog"
      aria-labelledby="pokemon-dialog-title"
      onClose={close}
      // A click on the backdrop (outside the content) closes the dialog.
      onClick={(event) => event.target === dialog.current && close()}
    >
      {pokemon && <PokemonDetail pokemon={pokemon} pokedex={pokedex} />}
    </dialog>
  )
}

function PokemonDetail({ pokemon, pokedex }: { pokemon: Pokemon; pokedex: Pokedex }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const { open, close, compare, compared } = useSelection()
  const generation = pokedex.generations.find((g) => g.id === pokemon.generation)
  const stages = useMemo(() => evolutionStages(pokedex.pokemon, pokemon), [pokedex, pokemon])
  const typeName = (key: string) => pokedex.types.find((type) => type.key === key)?.name[lang] ?? key
  const format = (value: number) => value.toLocaleString(lang, { maximumFractionDigits: 1 })
  const isCompared = compared.includes(pokemon.id)

  return (
    <div className="dialog-content">
      <header className="dialog-header">
        <img src={artworkUrl(pokemon.id)} alt="" width={140} height={140} />
        <div>
          <span className="dialog-number">#{String(pokemon.id).padStart(4, '0')}</span>
          <h2 id="pokemon-dialog-title">{pokemon.name[lang]}</h2>
          <div className="dialog-badges">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} label={typeName(type)} />
            ))}
            {pokemon.legendary && <span className="category-badge">{t('detail.legendary')}</span>}
            {pokemon.mythical && <span className="category-badge">{t('detail.mythical')}</span>}
          </div>
          <dl className="dialog-facts">
            <div>
              <dt>{t('detail.generation')}</dt>
              <dd>
                {generation?.name[lang]} · {generation?.region}
              </dd>
            </div>
            <div>
              <dt>{t('detail.height')}</dt>
              <dd>{format(pokemon.height)} m</dd>
            </div>
            <div>
              <dt>{t('detail.weight')}</dt>
              <dd>{format(pokemon.weight)} kg</dd>
            </div>
          </dl>
        </div>
        <button type="button" className="icon-button dialog-close" onClick={close} aria-label={t('detail.close')}>
          ×
        </button>
      </header>

      <section>
        <h3>{t('detail.stats')}</h3>
        <dl className="stat-bars">
          {STAT_KEYS.map((stat) => (
            <div key={stat} className="stat-row">
              <dt>{t(`stats.${stat}`)}</dt>
              <dd>
                <span className="stat-value">{pokemon.stats[stat]}</span>
                <span className="stat-track" aria-hidden="true">
                  <span className="stat-fill" style={{ width: `${(pokemon.stats[stat] / MAX_STAT) * 100}%` }} />
                </span>
              </dd>
            </div>
          ))}
          <div className="stat-row stat-total">
            <dt>{t('stats.total')}</dt>
            <dd>
              <span className="stat-value">{pokemon.total}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>{t('detail.evolution')}</h3>
        {stages.length === 1 && stages[0].length === 1 ? (
          <p className="dialog-muted">{t('detail.noEvolution')}</p>
        ) : (
          <ol className="evolution">
            {stages.map((stage, i) => (
              <li key={i} className="evolution-stage">
                {stage.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    className="evolution-member"
                    aria-current={member.id === pokemon.id ? 'true' : undefined}
                    onClick={() => open(member.id)}
                  >
                    <img src={artworkUrl(member.id)} alt="" width={64} height={64} loading="lazy" />
                    <span>{member.name[lang]}</span>
                  </button>
                ))}
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="dialog-footer">
        <button
          type="button"
          className="primary-button"
          disabled={isCompared || isComparisonFull(compared)}
          onClick={() => compare(pokemon.id)}
        >
          {isCompared ? t('detail.compared') : isComparisonFull(compared) ? t('detail.compareFull') : t('detail.compare')}
        </button>
      </footer>
    </div>
  )
}
