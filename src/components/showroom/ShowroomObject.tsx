import { useRef, type CSSProperties } from 'react'
import type { Product, ScreenSize, Visual } from '../../data/types'
import { gsap, MQ, useGSAP } from '../../motion/gsap'
import { vtName } from '../../motion/productTransition'
import { ProductVisual } from '../visuals/ProductVisual'
import './showroom.css'

interface Props {
  product: Product
  size: 'card' | 'feature' | 'spotlight'
  /**
   * hover: se inclina siguiendo el cursor (punteros finos; en táctil no interfiere con el scroll).
   * drag: además se puede inclinar arrastrando con mouse o dedo (ficha de producto).
   */
  interaction?: 'hover' | 'drag' | 'none'
  priority?: boolean
  sizes?: string
  /** Nombre de View Transition: el objeto viaja entre la tarjeta y la ficha. */
  shared?: boolean
  /** Escala según el tamaño de pantalla para que la diferencia entre modelos se perciba. */
  scaleBySize?: boolean
  /** Otra toma del producto (selector de vistas de la ficha). */
  view?: Visual
  /** Muestra flotando las piezas reales del kit (cámaras, sensores…). */
  withAccessories?: boolean
}

const SCALE: Record<ScreenSize, number> = { '5"': 0.8, '6.25"': 0.9, '7"': 1 }
/** Proporción del cuadro del objeto (la del render de pantalla). */
const BOX_RATIO = 676 / 436

/**
 * Producto como objeto protagonista: flota, proyecta sombra y luz, y se inclina
 * con el cursor. Es una inclinación acotada sobre la imagen frontal: no simula
 * caras del producto que no existen en el material visual.
 */
export function ShowroomObject({ product, size, interaction = 'hover', priority, sizes, shared, scaleBySize, view, withAccessories }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const visual = view ?? product.visual
  const accessories = withAccessories ? (product.showroom?.accessories ?? []) : []
  const isPending = visual.kind === 'render' && visual.render === 'pending'
  const isRender = visual.kind === 'render' && visual.render === 'display'
  const maskSrc = visual.kind === 'image' && visual.presentation !== 'photograph' ? visual.src : null
  const screen = product.showroom?.screen
  // Hueco vertical entre el borde del cuadro y el producto (object-fit: contain),
  // para apoyar el reflejo y la sombra justo bajo el equipo.
  const ratio = visual.kind === 'image' ? visual.width / visual.height : BOX_RATIO
  const gap = Math.max(0, (1 - BOX_RATIO / ratio) / 2)

  useGSAP(
    () => {
      if (interaction === 'none' || isPending) return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const el = root.current!
        const zone = el.closest<HTMLElement>('[data-tilt-zone]') ?? el
        const max = interaction === 'drag' ? { x: 12, y: 22 } : { x: 6, y: 10 }
        const rx = gsap.quickTo(tilt.current, 'rotationX', { duration: 0.8, ease: 'power3.out' })
        const ry = gsap.quickTo(tilt.current, 'rotationY', { duration: 0.8, ease: 'power3.out' })
        const light = (px: number, py: number) => {
          el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
          el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
        }
        let drag: { x: number; y: number; id: number } | null = null

        const onHover = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse' || drag) return
          const r = zone.getBoundingClientRect()
          const px = gsap.utils.clamp(0, 1, (e.clientX - r.left) / r.width)
          const py = gsap.utils.clamp(0, 1, (e.clientY - r.top) / r.height)
          rx(-(py - 0.5) * 2 * max.x)
          ry((px - 0.5) * 2 * max.y)
          light(px, py)
          el.dataset.lit = ''
        }
        const rest = () => {
          if (drag) return
          rx(0)
          ry(0)
          delete el.dataset.lit
        }
        const onDown = (e: PointerEvent) => {
          if (e.button !== 0) return
          el.setPointerCapture(e.pointerId)
          drag = { x: e.clientX, y: e.clientY, id: e.pointerId }
          el.dataset.dragging = ''
        }
        const onDrag = (e: PointerEvent) => {
          if (!drag || e.pointerId !== drag.id) return
          const r = el.getBoundingClientRect()
          const dx = (e.clientX - drag.x) / r.width
          const dy = (e.clientY - drag.y) / r.height
          rx(gsap.utils.clamp(-max.x, max.x, -dy * 40))
          ry(gsap.utils.clamp(-max.y, max.y, dx * 60))
          light(gsap.utils.clamp(0, 1, 0.5 + dx), gsap.utils.clamp(0, 1, 0.5 + dy))
          el.dataset.lit = ''
        }
        const onUp = () => {
          if (!drag) return
          drag = null
          delete el.dataset.dragging
          // Vuelve a su posición con un rebote leve, como un objeto con peso.
          gsap.to(tilt.current, { rotationX: 0, rotationY: 0, duration: 1.4, ease: 'elastic.out(1, 0.55)', overwrite: true })
          delete el.dataset.lit
        }

        zone.addEventListener('pointermove', onHover)
        zone.addEventListener('pointerleave', rest)
        if (interaction === 'drag') {
          el.addEventListener('pointerdown', onDown)
          el.addEventListener('pointermove', onDrag)
          el.addEventListener('pointerup', onUp)
          el.addEventListener('pointercancel', onUp)
        }
        return () => {
          zone.removeEventListener('pointermove', onHover)
          zone.removeEventListener('pointerleave', rest)
          el.removeEventListener('pointerdown', onDown)
          el.removeEventListener('pointermove', onDrag)
          el.removeEventListener('pointerup', onUp)
          el.removeEventListener('pointercancel', onUp)
        }
      })
    },
    { scope: root, dependencies: [interaction, product.slug], revertOnUpdate: true },
  )

  const style = {
    '--sobj-scale': scaleBySize && screen ? SCALE[screen] : 1,
    '--sobj-gap': `${(gap * 100).toFixed(2)}%`,
    ...(maskSrc ? { '--sobj-mask': `url("${maskSrc}")` } : null),
    ...(shared ? { viewTransitionName: vtName.visual(product.slug), viewTransitionClass: 'product-visual' } : null),
  } as CSSProperties

  return (
    <div
      ref={root}
      className={`sobj sobj--${size} ${isRender ? 'sobj--render' : ''} ${isPending ? 'sobj--pending' : ''} ${maskSrc ? 'sobj--cutout' : ''} ${interaction === 'drag' ? 'sobj--drag' : ''}`}
      style={style}
    >
      <span className="sobj__aura" aria-hidden="true" />
      {/* Luz que emite la pantalla: los colores del propio equipo se derraman alrededor. */}
      {maskSrc ? <img className="sobj__ambient" src={maskSrc} alt="" aria-hidden="true" decoding="async" loading="lazy" /> : null}
      {/* Reflejo sobre el piso brillante. */}
      {maskSrc ? (
        <span className="sobj__reflection" aria-hidden="true">
          <img src={maskSrc} alt="" decoding="async" loading="lazy" />
        </span>
      ) : null}
      <div className="sobj__float">
        <div ref={tilt} className="sobj__tilt">
          <ProductVisual visual={visual} priority={priority} sizes={sizes} className="sobj__visual" />
          {isPending ? null : <span className="sobj__sheen" aria-hidden="true" />}
          {maskSrc ? <span className="sobj__sweep" aria-hidden="true" /> : null}
          {/* Piezas del kit: delante del equipo en profundidad, así se separan al inclinarlo. */}
          {accessories.map((a, i) => (
            <figure key={a.label} className={`sobj__accessory sobj__accessory--${i}`}>
              <ProductVisual visual={a.visual} sizes="240px" className="sobj__accessory-visual" />
              <figcaption>{a.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      {isPending ? null : <span className="sobj__shadow" aria-hidden="true" />}
    </div>
  )
}
