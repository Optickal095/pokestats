import { createContext } from 'react'
import type { SelectionState } from './selection.ts'

export interface SelectionApi extends SelectionState {
  open: (id: number) => void
  close: () => void
  compare: (id: number) => void
  uncompare: (id: number) => void
}

export const SelectionContext = createContext<SelectionApi | null>(null)
