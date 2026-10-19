import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { ModelScene, type ModelSceneState } from './modelScene'

export interface ModelCanvasHandle {
  setAutoRotate: (on: boolean) => void
  zoom: (direction: 1 | -1) => void
  reset: () => void
}

interface Props {
  src: string
  initialYaw?: number
  autoRotate: boolean
  onState: (s: ModelSceneState) => void
  ref?: Ref<ModelCanvasHandle>
}

/** Lienzo WebGL del visor 3D. Se carga aparte (three.js) solo si hay modelo. */
export default function ModelCanvas({ src, initialYaw, autoRotate, onState, ref }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<ModelScene | null>(null)
  const onStateRef = useRef(onState)

  useEffect(() => {
    onStateRef.current = onState
  })

  useEffect(() => {
    const el = canvas.current!
    const s = new ModelScene(el, { src, initialYaw, autoRotate, onState: (st) => onStateRef.current(st) })
    scene.current = s
    const io = new IntersectionObserver(([e]) => s.setVisible(e.isIntersecting))
    io.observe(el)
    return () => {
      io.disconnect()
      s.dispose()
      scene.current = null
    }
    // El giro automático inicial solo se lee al crear la escena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, initialYaw])

  useImperativeHandle(ref, () => ({
    setAutoRotate: (on) => scene.current?.setAutoRotate(on),
    zoom: (d) => scene.current?.zoom(d),
    reset: () => scene.current?.reset(),
  }))

  return <canvas ref={canvas} className="model__canvas" aria-hidden="true" />
}
