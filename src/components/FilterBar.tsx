import { useTranslation } from 'react-i18next'
import { TYPE_COLORS } from '../data/typeColors.ts'
import type { Generation, PokemonType } from '../data/types.ts'
import { hasFilters, NO_FILTERS, toggle, type Category, type Filters } from '../lib/filters.ts'
import { inkOn } from '../theme/palette.ts'

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
  types: PokemonType[]
  generations: Generation[]
  shown: number
  total: number
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/** One filter area above every chart; all charts and numbers follow it. */
export function FilterBar({ filters, onChange, types, generations, shown, total }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const categories: Category[] = ['all', 'special', 'regular']

  return (
    <section className="filters" aria-label={t('filters.title')}>
      <div className="filter-group">
        <span className="filter-label">{t('filters.generation')}</span>
        <div className="chips">
          {generations.map((generation) => {
            const active = filters.generations.includes(generation.id)
            return (
              <button
                key={generation.id}
                type="button"
                className={active ? 'chip chip-active' : 'chip'}
                aria-pressed={active}
                title={`${generation.name[lang]} · ${generation.region}`}
                onClick={() => onChange({ ...filters, generations: toggle(filters.generations, generation.id) })}
              >
                {ROMAN[generation.id] ?? generation.id}
              </button>
            )
          })}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">{t('filters.category')}</span>
        <div className="segmented" role="radiogroup" aria-label={t('filters.category')}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="radio"
              aria-checked={filters.category === category}
              className={filters.category === category ? 'segment segment-active' : 'segment'}
              onClick={() => onChange({ ...filters, category })}
            >
              {t(`filters.${category}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group filter-group-wide">
        <span className="filter-label">{t('filters.type')}</span>
        <div className="chips">
          {types.map((type) => {
            const active = filters.types.includes(type.key)
            const color = TYPE_COLORS[type.key]
            return (
              <button
                key={type.key}
                type="button"
                className={active ? 'chip chip-type chip-active' : 'chip chip-type'}
                aria-pressed={active}
                style={active ? { background: color, borderColor: color, color: inkOn(color) } : undefined}
                onClick={() => onChange({ ...filters, types: toggle(filters.types, type.key) })}
              >
                <span className="type-dot" style={{ background: color }} aria-hidden="true" />
                {type.name[lang]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="filter-summary">
        <span aria-live="polite">{t('filters.showing', { count: shown, total })}</span>
        {hasFilters(filters) && (
          <button type="button" className="link-button" onClick={() => onChange(NO_FILTERS)}>
            {t('filters.reset')}
          </button>
        )}
      </div>
    </section>
  )
}
