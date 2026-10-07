import { describe, expect, it } from 'vitest'
import { EMPTY_COMPARISON } from '../../domain/comparison.ts'
import { INITIAL_SELECTION, selectionReducer, type SelectionState } from './selection.ts'

describe('selectionReducer', () => {
  it('starts with an example comparison and no detail open', () => {
    expect(INITIAL_SELECTION).toEqual({ detailId: null, compared: [3, 6, 9] })
  })

  it('opens and closes a detail', () => {
    const opened = selectionReducer(INITIAL_SELECTION, { type: 'open', id: 25 })
    expect(opened.detailId).toBe(25)
    expect(selectionReducer(opened, { type: 'close' }).detailId).toBeNull()
  })

  it('compares up to three Pokémon and removes them', () => {
    const empty: SelectionState = { detailId: null, compared: EMPTY_COMPARISON }
    const full = [1, 4, 7, 25].reduce(
      (state, id) => selectionReducer(state, { type: 'compare', id }),
      empty,
    )
    expect(full.compared).toEqual([1, 4, 7])
    expect(selectionReducer(full, { type: 'uncompare', id: 4 }).compared).toEqual([1, null, 7])
  })
})
