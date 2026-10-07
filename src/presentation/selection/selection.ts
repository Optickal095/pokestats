import {
  addToComparison,
  comparisonOf,
  removeFromComparison,
  type ComparisonSlots,
} from '../../domain/comparison.ts'

/** Which Pokémon has its detail open, and which ones are being compared. */
export interface SelectionState {
  detailId: number | null
  compared: ComparisonSlots
}

export type SelectionAction =
  | { type: 'open'; id: number }
  | { type: 'close' }
  | { type: 'compare'; id: number }
  | { type: 'uncompare'; id: number }

/** The three final starters of Kanto: a working example instead of an empty comparator. */
export const INITIAL_SELECTION: SelectionState = { detailId: null, compared: comparisonOf([3, 6, 9]) }

export function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'open':
      return { ...state, detailId: action.id }
    case 'close':
      return { ...state, detailId: null }
    case 'compare':
      return { ...state, compared: addToComparison(state.compared, action.id) }
    case 'uncompare':
      return { ...state, compared: removeFromComparison(state.compared, action.id) }
  }
}
