import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { toHref } from './base'
import { useRouter } from './context'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
  /**
   * Se ejecuta antes de navegar (p. ej. la coreografía de salida de una tarjeta).
   * La navegación espera a que la promesa termine.
   */
  beforeNavigate?: (e: MouseEvent<HTMLAnchorElement>) => Promise<void> | void
}

function isPlainLeftClick(e: MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

/** Enlace real (<a href>) que navega en la SPA sin recargar. */
export function Link({ to, beforeNavigate, onClick, children, ...rest }: Props) {
  const { navigate, pathname } = useRouter()

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || !isPlainLeftClick(e) || rest.target === '_blank') return
    e.preventDefault()
    await beforeNavigate?.(e)
    await navigate(to)
  }

  const isCurrent = !to.includes('#') && pathname === to

  return (
    <a href={toHref(to)} onClick={handleClick} aria-current={isCurrent ? 'page' : undefined} {...rest}>
      {children}
    </a>
  )
}
