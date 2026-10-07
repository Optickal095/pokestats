/** How many Pokémon can be compared at once: the limit of colors that stay distinguishable. */
export const MAX_COMPARED = 3

/**
 * The comparison as fixed slots (Pokédex number or empty). Each slot has its
 * own color, so removing a Pokémon never repaints the others: a new one takes
 * the first free slot.
 */
export type ComparisonSlots = (number | null)[]

export const EMPTY_COMPARISON: ComparisonSlots = Array<number | null>(MAX_COMPARED).fill(null)

export function comparisonOf(ids: number[]): ComparisonSlots {
  return ids.reduce(addToComparison, EMPTY_COMPARISON)
}

/** Puts a Pokémon in the first free slot, unless it is already compared or every slot is taken. */
export function addToComparison(slots: ComparisonSlots, id: number): ComparisonSlots {
  const free = slots.indexOf(null)
  if (slots.includes(id) || free === -1) return slots
  return slots.map((slot, i) => (i === free ? id : slot))
}

export function removeFromComparison(slots: ComparisonSlots, id: number): ComparisonSlots {
  return slots.map((slot) => (slot === id ? null : slot))
}

export function isComparisonFull(slots: ComparisonSlots): boolean {
  return !slots.includes(null)
}
