import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { site } from '../../config/site'
import type { Product, View360 } from '../../data/types'
import { Viewer360 } from './Viewer360'
import './viewer360.css'

/** Banco de pruebas, solo en desarrollo: añade `?visor360=prueba` a la URL de una ficha. */
const testMode = () =>
  import.meta.env.DEV && new URLSearchParams(window.location.search).get('visor360') === 'prueba'

/**
 * "Ver en 360°". Solo aparece si el producto tiene su secuencia real de fotos;
 * mientras tanto, en modo demostración, se indica que está pendiente.
 */
export function View360Button({ product }: { product: Product }) {
  const btn = useRef<HTMLButtonElement>(null)
  const [sequence, setSequence] = useState<View360 | null>(null)
  const [source, setSource] = useState<HTMLElement | null>(null)
  const [preparing, setPreparing] = useState(false)

  const hasRealSequence = (product.view360?.frames.length ?? 0) >= 24
  const available = hasRealSequence || testMode()
  if (!available) {
    return !product.productType && site.demoMode ? <span className="pending v360-pending">Vista 360° · pendiente de fotografías</span> : null
  }

  const open = async () => {
    let seq = hasRealSequence ? product.view360! : null
    if (import.meta.env.DEV && !seq && testMode()) {
      setPreparing(true)
      const { createTestSequence } = await import('./testSequence')
      seq = await createTestSequence()
      setPreparing(false)
    }
    if (!seq) return
    setSource(btn.current?.closest('.phero')?.querySelector<HTMLElement>('.stage__visual') ?? null)
    setSequence(seq)
  }

  const closed = () => {
    if (sequence?.isTestPattern) sequence.frames.forEach((u) => URL.revokeObjectURL(u))
    setSequence(null)
    // Devuelve el foco al botón que abrió el visor.
    requestAnimationFrame(() => btn.current?.focus({ preventScroll: true }))
  }

  return (
    <>
      <button ref={btn} type="button" className="btn btn--ghost" onClick={() => void open()} disabled={preparing} aria-haspopup="dialog">
        <svg viewBox="0 0 24 24" className="v360-trigger__icon" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <path d="M12 3.5v4M9.5 19.5l2.5 1.5-2.5 1.4" />
          <path d="M16.5 15.4c-1.3.4-2.8.6-4.5.6" />
        </svg>
        {preparing ? 'Preparando…' : 'Ver en 360°'}
      </button>
      {sequence
        ? createPortal(<Viewer360 product={product} sequence={sequence} source={source} onClosed={closed} />, document.body)
        : null}
    </>
  )
}
