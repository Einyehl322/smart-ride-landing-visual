import { lazy, Suspense, useRef, useState } from 'react'
import type { Model3D, Product } from '../../../data/types'
import { prefersReducedMotion } from '../../../motion/gsap'
import { ShowroomObject } from '../ShowroomObject'
import type { ModelCanvasHandle } from './ModelCanvas'
import type { ModelSceneState } from './modelScene'

const ModelCanvas = lazy(() => import('./ModelCanvas'))

interface Props {
  product: Product
  model: Model3D
  shared?: boolean
}

/**
 * Visor 3D del producto: giro libre de 360°, acercamiento, vista inicial y giro
 * automático. Mientras descarga se muestra la imagen del producto; si el modelo
 * no carga, se queda la presentación con imagen.
 */
export function ModelStage({ product, model, shared }: Props) {
  const handle = useRef<ModelCanvasHandle>(null)
  const [state, setState] = useState<ModelSceneState>({
    progress: 0,
    ready: false,
    error: null,
    autoRotate: !prefersReducedMotion(),
  })
  const [touched, setTouched] = useState(false)

  if (state.error) {
    return <ShowroomObject product={product} size="spotlight" interaction="drag" priority shared={shared} />
  }

  return (
    <div className={`model ${state.ready ? 'is-ready' : ''}`} onPointerDown={() => setTouched(true)}>
      <div className="model__poster" aria-hidden={state.ready}>
        <ShowroomObject product={product} size="spotlight" interaction="none" priority shared={shared && !state.ready} />
      </div>
      <div
        className="model__viewport"
        role="img"
        aria-label={`${product.name}, modelo 3D interactivo. Arrastra para girarlo.`}
      >
        <Suspense fallback={null}>
          <ModelCanvas ref={handle} src={model.src} initialYaw={model.initialYaw} autoRotate={state.autoRotate} onState={setState} />
        </Suspense>
      </div>
      <span className="sobj__shadow model__shadow" aria-hidden="true" />

      {!state.ready ? (
        <div className="model__progress" role="progressbar" aria-label="Cargando modelo 3D" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.progress * 100)}>
          <span style={{ transform: `scaleX(${state.progress})` }} />
        </div>
      ) : null}

      {state.ready ? (
        <>
          <p className={`model__hint ${touched ? 'is-hidden' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12a8 3.2 0 0 0 16 0M17.5 9.8 20 12l-2.6 1.6" />
            </svg>
            Arrastra para girar 360°
          </p>
          <div className="model__controls" role="toolbar" aria-label="Controles del visor 3D">
            <button
              type="button"
              className="model__btn"
              aria-pressed={state.autoRotate}
              onClick={() => handle.current?.setAutoRotate(!state.autoRotate)}
            >
              {state.autoRotate ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5-10-6.5Z" /></svg>
              )}
              <span className="sr-only">{state.autoRotate ? 'Detener giro automático' : 'Activar giro automático'}</span>
            </button>
            <button type="button" className="model__btn" onClick={() => handle.current?.zoom(1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
              <span className="sr-only">Acercar</span>
            </button>
            <button type="button" className="model__btn" onClick={() => handle.current?.zoom(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
              <span className="sr-only">Alejar</span>
            </button>
            <button type="button" className="model__btn" onClick={() => handle.current?.reset()}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5M5 4.5V9h4.5" /></svg>
              <span className="sr-only">Restablecer vista</span>
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
