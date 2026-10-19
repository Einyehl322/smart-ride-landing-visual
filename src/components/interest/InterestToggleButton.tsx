import { useInterestList } from './InterestListContext'
import { Icon } from '../ui/Icon'
import './interest-list.css'

/** `compact`: solo el icono (tarjetas); la acción sigue anunciada por su etiqueta. */
export function InterestToggleButton({ slug, className = '', compact }: { slug: string; className?: string; compact?: boolean }) {
  const { has, toggle } = useInterestList()
  const active = has(slug)

  return (
    <button
      type="button"
      className={`ilist-toggle ${compact ? 'ilist-toggle--compact' : ''} ${active ? 'is-active' : ''} ${className}`}
      onClick={() => toggle(slug)}
      aria-label={active ? 'Quitar de mi lista de interés' : 'Agregar a mi lista de interés'}
      aria-pressed={active}
    >
      <Icon name={active ? 'heart-filled' : 'heart'} />
      <span className={compact ? 'sr-only' : undefined}>{active ? 'En mi lista' : 'Me interesa'}</span>
    </button>
  )
}
