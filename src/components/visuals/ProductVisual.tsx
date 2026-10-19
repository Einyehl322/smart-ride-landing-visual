import type { CSSProperties, Ref } from 'react'
import type { Focus, Visual } from '../../data/types'
import { focusToCss } from '../../motion/gsap'
import { DisplayRender } from './DisplayRender'
import { SpinImage } from './SpinImage'
import './visuals.css'

interface Props {
  visual: Visual | null
  /** Encuadre estático inicial. Las coreografías pueden animar `cameraRef`. */
  focus?: Focus
  /** Carga prioritaria (imágenes por encima del pliegue). */
  priority?: boolean
  sizes?: string
  className?: string
  style?: CSSProperties
  cameraRef?: Ref<HTMLDivElement>
  /** Nombre y clase para View Transitions. */
  transition?: { name: string; className: string }
  /** Giro del producto (solo recortes con fondo transparente). */
  spin?: boolean
}

/**
 * Muestra un visual de producto, sea fotografía o render.
 * Si `visual` es null, muestra un placeholder indicando que la foto está pendiente.
 * Estructura: .pv (marco) > .pv__camera (encuadre animable) > img | svg
 */
export function ProductVisual({ visual, focus, priority, sizes, className = '', style, cameraRef, transition, spin }: Props) {
  if (!visual) {
    return (
      <div className={`pv pv--placeholder ${className}`} style={style}>
        <div className="pv__camera" ref={cameraRef} style={focus ? { transform: focusToCss(focus) } : undefined}>
          <div className="pv__placeholder">
            <span>Fotografía pendiente</span>
          </div>
        </div>
      </div>
    )
  }
  const fit = visual.kind === 'image' ? visual.fit : 'contain'
  const frameStyle: CSSProperties = {
    ...style,
    ...(transition
      ? ({ viewTransitionName: transition.name, viewTransitionClass: transition.className } as CSSProperties)
      : null),
  }

  return (
    <div className={`pv pv--${fit} ${className}`} style={frameStyle}>
      <div className="pv__camera" ref={cameraRef} style={focus ? { transform: focusToCss(focus) } : undefined}>
        {visual.kind === 'image' && spin && visual.fit === 'contain' ? (
          <SpinImage visual={visual} priority={priority} sizes={sizes} />
        ) : visual.kind === 'image' ? (
          <img
            src={visual.src}
            srcSet={visual.srcSet}
            sizes={sizes}
            width={visual.width}
            height={visual.height}
            alt={visual.alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            draggable={false}
            style={visual.position ? { objectPosition: visual.position } : undefined}
          />
        ) : visual.render === 'pending' ? (
          <div className="pv__pending" role="img" aria-label={visual.alt}>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <rect x="6" y="11" width="36" height="27" rx="7" />
              <circle cx="24" cy="24.5" r="7" />
              <path d="M17 11l2.5-4h9L31 11" />
            </svg>
            <span>{visual.label}</span>
          </div>
        ) : (
          <DisplayRender tone={visual.tone} title={visual.alt} bare={visual.bare} />
        )}
      </div>
    </div>
  )
}
