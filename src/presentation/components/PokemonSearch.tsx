import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Pokemon } from '../../domain/pokemon.ts'
import { searchPokemon } from '../../domain/search.ts'
import { artworkUrl } from '../artwork.ts'

interface Props {
  pokemon: Pokemon[]
  onSelect: (pokemon: Pokemon) => void
  disabled?: boolean
}

/** Accessible combobox (ARIA 1.2 pattern): type, move with the arrow keys, pick with Enter or a click. */
export function PokemonSearch({ pokemon, onSelect, disabled }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const results = useMemo(() => searchPokemon(pokemon, query), [pokemon, query])
  const showList = open && query.trim().length > 0

  const select = (choice: Pokemon) => {
    onSelect(choice)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (results.length ? (current + step + results.length) % results.length : 0))
    } else if (event.key === 'Enter' && showList && results[active]) {
      event.preventDefault()
      select(results[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="search">
      <label htmlFor={`${id}-input`} className="sr-only">
        {t('compare.searchLabel')}
      </label>
      <input
        id={`${id}-input`}
        type="search"
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${id}-option-${results[active].id}` : undefined}
        placeholder={t('compare.placeholder')}
        value={query}
        disabled={disabled}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {showList && (
        <ul id={`${id}-list`} role="listbox" className="search-results" aria-label={t('compare.searchLabel')}>
          {results.length === 0 && <li className="search-empty">{t('compare.noResults')}</li>}
          {results.map((result, index) => (
            <li
              key={result.id}
              id={`${id}-option-${result.id}`}
              role="option"
              aria-selected={index === active}
              className={index === active ? 'search-option search-option-active' : 'search-option'}
              // mousedown, not click: it fires before the input's blur closes the list.
              onMouseDown={(event) => {
                event.preventDefault()
                select(result)
              }}
              onMouseEnter={() => setActive(index)}
            >
              <img src={artworkUrl(result.id)} alt="" width={32} height={32} loading="lazy" />
              <span>{result.name[lang]}</span>
              <span className="search-number">#{result.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
