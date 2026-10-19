import type { CSSProperties, ReactNode, Ref } from 'react'
import type { Focus, Product } from '../../data/types'
import { vtName } from '../../motion/productTransition'
import { ProductVisual } from './ProductVisual'

interface Props {
  product: Product
  variant: 'card' | 'hero'
  /** Aplica los nombres de View Transition (solo una instancia por página). */
  shared?: boolean
  priority?: boolean
  sizes?: string
  focus?: Focus
  className?: string
  stageRef?: Ref<HTMLDivElement>
  visualRef?: Ref<HTMLDivElement>
  cameraRef?: Ref<HTMLDivElement>
  /** Activa el giro del producto. */
  spin?: boolean
  children?: ReactNode
}

/**
 * Escenario del producto: fondo con iluminación propia + visual.
 * Es el elemento que se expande desde la tarjeta hasta el hero de la ficha.
 */
export function ProductStage({
  product,
  variant,
  shared,
  priority,
  sizes,
  focus,
  className = '',
  stageRef,
  visualRef,
  cameraRef,
  spin,
  children,
}: Props) {
  const { visual, theme, slug } = product
  const isCover = visual.kind === 'image' && visual.fit === 'cover'

  const style = {
    '--stage-bg': theme.bg,
    '--stage-surface': theme.surface,
    ...(shared ? { viewTransitionName: vtName.stage(slug), viewTransitionClass: 'product-stage' } : null),
  } as CSSProperties

  return (
    <div
      ref={stageRef}
      className={`stage stage--${variant} ${isCover ? 'stage--cover' : 'stage--object'} ${visual.kind === 'image' && visual.presentation === 'photograph' ? 'stage--photograph' : ''} ${className}`}
      data-scheme={theme.scheme}
      data-product-slug={slug}
      data-card-stage
      style={style}
    >
      <div className="stage__light" aria-hidden="true" />
      <div className="stage__visual" ref={visualRef}>
        <ProductVisual
          visual={visual}
          focus={focus}
          priority={priority}
          sizes={sizes}
          cameraRef={cameraRef}
          spin={spin && !(visual.kind === 'image' && visual.presentation === 'photograph')}
          transition={shared && !isCover ? { name: vtName.visual(slug), className: 'product-visual' } : undefined}
        />
      </div>
      {children}
    </div>
  )
}
