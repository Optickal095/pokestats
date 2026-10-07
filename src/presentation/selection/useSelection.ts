import { useContext } from 'react'
import { SelectionContext, type SelectionApi } from './selection-context.ts'

export function useSelection(): SelectionApi {
  const selection = useContext(SelectionContext)
  if (!selection) throw new Error('useSelection must be used inside a SelectionProvider')
  return selection
}
