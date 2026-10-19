import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { Product, View360 } from '../../data/types'
import { gsap, prefersReducedMotion } from '../../motion/gsap'
import { ProductVisual } from '../visuals/ProductVisual'
import { Viewer360Engine, type EngineState } from './engine'
import './viewer360.css'

interface Props {
  product: Product
  sequence: View360
  /** Visual del hero desde el que se expande el producto. */
  source: HTMLElement | null
  onClosed: () => void
}

const posterAspect = (p: Product) => (p.visual.kind === 'image' ? p.visual.width / p.visual.height : 4 / 3)

/**
 * Transformación que lleva la caja del visor a la posición del visual de origen,
 * con escala uniforme (sin deformar la imagen).
 */
function flipFrom(source: HTMLElement | null, box: HTMLElement, aspect: number, cover: boolean) {
  if (!source) return null
  const s = source.getBoundingClientRect()
  const t = box.getBoundingClientRect()
  if (!s.width || !t.width) return null
  const fit = (w: number, h: number) => (w / h > aspect ? { w: h * aspect, h } : { w, h: w / aspect })
  const sf = fit(s.width, s.height)
  const tf = fit(t.width, t.height)
  const scale = cover ? Math.max(s.width / t.width, s.height / t.height) : sf.w / tf.w
  return {
    x: s.left + s.width / 2 - (t.left + t.width / 2),
    y: s.top + s.height / 2 - (t.top + t.height / 2),
    scale,
  }
}

export function Viewer360({ product, sequence, source, onClosed }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const engine = useRef<Viewer360Engine | null>(null)
  const closing = useRef(false)
  const [state, setState] = useState<EngineState | null>(null)
  const [hint, setHint] = useState(true)
  const reduced = prefersReducedMotion()
  const ar = sequence.width / sequence.height
  const cover = product.visual.kind === 'image' && product.visual.fit === 'cover'

  useLayoutEffect(() => {
    const app = document.getElementById('root')
    const previousFocus = document.activeElement as HTMLElement | null
    app?.setAttribute('inert', '')
    // El producto del hero "viaja" al visor: el original se oculta mientras está abierto.
    if (source) gsap.set(source, { visibility: 'hidden' })

    let introDone = false
    let firstFrame = false
    // El canvas sustituye al póster cuando la animación terminó y hay imagen.
    const reveal = () => {
      if (!introDone || !firstFrame || closing.current) return
      gsap.to(canvas.current, { opacity: 1, duration: reduced ? 0 : 0.5, ease: 'power2.out' })
      gsap.to('.v360__poster', { opacity: 0, duration: reduced ? 0 : 0.5, ease: 'power2.out' })
    }

    const ctx = gsap.context(() => {
      const from = reduced ? null : flipFrom(source, box.current!, posterAspect(product), cover)
      const tl = gsap.timeline({
        onComplete: () => {
          introDone = true
          reveal()
        },
      })
      if (from) {
        tl.fromTo('.v360__backdrop', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)
          .fromTo(box.current, from, { x: 0, y: 0, scale: 1, duration: 1.05, ease: 'expo.inOut' }, 0)
          .fromTo(
            '.v360__reveal',
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out' },
            0.6,
          )
      } else {
        tl.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: reduced ? 0.01 : 0.3 })
      }
    }, root)

    engine.current = new Viewer360Engine({
      canvas: canvas.current!,
      box: box.current!,
      sequence,
      reducedMotion: reduced,
      autoplay: true,
      onChange: setState,
      onFirstFrame: () => {
        firstFrame = true
        reveal()
      },
    })
    closeBtn.current?.focus({ preventScroll: true })

    const onResize = () => engine.current?.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      engine.current?.destroy()
      engine.current = null
      ctx.revert()
      app?.removeAttribute('inert')
      if (source) gsap.set(source, { clearProps: 'visibility' })
      previousFocus?.focus({ preventScroll: true })
    }
  }, [sequence, source, product, reduced, cover])

  async function close() {
    if (closing.current) return
    closing.current = true
    setHint(false)
    const e = engine.current
    if (!reduced && e) {
      // Regresa a la vista frontal antes de volver al hero.
      e.reset()
      await Promise.race([e.settle(), new Promise((r) => setTimeout(r, 700))])
    }
    const from = reduced ? null : flipFrom(source, box.current!, posterAspect(product), cover)
    const tl = gsap.timeline({ onComplete: onClosed })
    if (from) {
      tl.to(canvas.current, { opacity: 0, duration: 0.35, ease: 'power2.inOut' }, 0)
        .to('.v360__poster', { opacity: 1, duration: 0.35, ease: 'power2.inOut' }, 0)
        .to('.v360__reveal', { autoAlpha: 0, y: 12, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, 0)
        .to(box.current, { ...from, duration: 0.95, ease: 'expo.inOut' }, 0.25)
        .to('.v360__backdrop', { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, 0.65)
    } else {
      tl.to(root.current, { opacity: 0, duration: reduced ? 0.01 : 0.25 })
    }
  }

  const onKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
    const e = engine.current
    if (!e) return
    const step = Math.max(1, Math.round(sequence.frames.length / 24))
    switch (ev.key) {
      case 'Escape':
        void close()
        break
      case 'ArrowLeft':
        e.rotateBy(-step)
        break
      case 'ArrowRight':
        e.rotateBy(step)
        break
      case '+':
      case '=':
        e.zoomBy(1.25)
        break
      case '-':
        e.zoomBy(0.8)
        break
      case '0':
        e.reset()
        break
      case 'Tab': {
        // Mantiene el foco dentro del visor.
        const items = root.current!.querySelectorAll<HTMLElement>('button:not([disabled]), canvas')
        const first = items[0]
        const last = items[items.length - 1]
        if (ev.shiftKey && document.activeElement === first) {
          last.focus()
          ev.preventDefault()
        } else if (!ev.shiftKey && document.activeElement === last) {
          first.focus()
          ev.preventDefault()
        }
        return
      }
      default:
        return
    }
    setHint(false)
    ev.preventDefault()
  }

  const loading = state ? state.loaded < state.total : true
  const zoom = state?.zoom ?? 1
  const maxZoom = state?.maxZoom ?? 1
  const degrees = state?.degrees ?? 0
  const titleId = `v360-title-${product.slug}`

  return (
    <div
      ref={root}
      className="v360"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      // Estudio claro: los equipos (negros en su mayoría) muestran mejor sus detalles.
      data-scheme="light"
      style={{ '--v360-bg': 'var(--c-mist)', '--v360-ar': ar } as CSSProperties}
      onKeyDown={onKeyDown}
      onPointerDown={() => setHint(false)}
    >
      <div className="v360__backdrop" aria-hidden="true" />

      <div ref={box} className="v360__box" aria-hidden="true">
        <div className="v360__poster">
          <ProductVisual visual={product.visual} sizes="80vw" />
        </div>
      </div>

      <canvas
        ref={canvas}
        className="v360__canvas"
        tabIndex={0}
        role="img"
        aria-label={`${product.name}, vista de ${degrees} grados. Flechas izquierda y derecha para girar, más y menos para acercar.`}
      />

      <div className="v360__chrome">
        <header className="v360__top v360__reveal">
          <div>
            <p className="eyebrow">Vista 360°</p>
            <h2 id={titleId} className="v360__name">
              {product.name}
            </h2>
            {sequence.isTestPattern ? (
              <span className="demo-badge">Secuencia de prueba · no es el producto</span>
            ) : null}
          </div>
          <button ref={closeBtn} className="v360__icon-btn" onClick={() => void close()} aria-label="Cerrar vista 360°">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <p className={`v360__hint v360__reveal ${hint ? '' : 'is-hidden'}`} aria-hidden="true">
          Arrastra para girar · Rueda o pellizca para acercar · Doble clic para ampliar
        </p>

        <div className="v360__controls v360__reveal" role="toolbar" aria-label="Controles de la vista 360°">
          <div className="v360__dial" aria-hidden="true">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" className="v360__dial-track" />
              <circle
                cx="18"
                cy="18"
                r="15"
                className="v360__dial-value"
                pathLength={360}
                strokeDasharray={`${degrees} 360`}
              />
            </svg>
            <span>{degrees}°</span>
          </div>

          <button
            className="v360__btn"
            aria-pressed={state?.autoplay ?? false}
            onClick={() => engine.current?.setAutoplay(!state?.autoplay)}
            disabled={reduced}
            title={reduced ? 'Desactivado por la preferencia de movimiento reducido' : undefined}
          >
            {state?.autoplay ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6v12M15 6v12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l10-6.5z" />
              </svg>
            )}
            <span>Giro automático</span>
          </button>

          <span className="v360__sep" aria-hidden="true" />

          <button
            className="v360__icon-btn"
            onClick={() => engine.current?.zoomBy(0.8)}
            disabled={zoom <= 1.001}
            aria-label="Alejar"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 12h12" />
            </svg>
          </button>
          <span className="v360__zoom" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="v360__icon-btn"
            onClick={() => engine.current?.zoomBy(1.25)}
            disabled={zoom >= maxZoom - 0.01}
            aria-label="Acercar"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 12h12M12 6v12" />
            </svg>
          </button>

          <span className="v360__sep" aria-hidden="true" />

          <button className="v360__btn" onClick={() => engine.current?.reset()}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
            </svg>
            <span>Restablecer</span>
          </button>
        </div>

        {loading && state ? (
          <div className="v360__progress" role="progressbar" aria-valuemin={0} aria-valuemax={state.total} aria-valuenow={state.loaded} aria-label="Cargando vista 360°">
            <span style={{ transform: `scaleX(${state.loaded / state.total})` }} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
