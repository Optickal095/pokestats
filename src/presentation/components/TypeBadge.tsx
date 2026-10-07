import { TYPE_COLORS } from '../typeColors.ts'
import { inkOn } from '../theme/palette.ts'

interface Props {
  type: string
  label: string
}

/** A type's name on its traditional color: the name carries the meaning, the color is a convention. */
export function TypeBadge({ type, label }: Props) {
  const color = TYPE_COLORS[type] ?? '#888888'
  return (
    <span className="type-badge" style={{ background: color, color: inkOn(color) }}>
      {label}
    </span>
  )
}
