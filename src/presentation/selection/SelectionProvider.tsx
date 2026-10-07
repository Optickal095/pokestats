import { useMemo, useReducer, type ReactNode } from 'react'
import { SelectionContext, type SelectionApi } from './selection-context.ts'
import { INITIAL_SELECTION, selectionReducer } from './selection.ts'

/** Shares the selection (open detail and compared Pokémon) with every part of the dashboard. */
export function SelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(selectionReducer, INITIAL_SELECTION)

  const api = useMemo<SelectionApi>(
    () => ({
      ...state,
      open: (id) => dispatch({ type: 'open', id }),
      close: () => dispatch({ type: 'close' }),
      compare: (id) => dispatch({ type: 'compare', id }),
      uncompare: (id) => dispatch({ type: 'uncompare', id }),
    }),
    [state],
  )

  return <SelectionContext value={api}>{children}</SelectionContext>
}
