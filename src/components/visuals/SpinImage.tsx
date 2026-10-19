import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { Visual } from '../../data/types'
import { gsap, MQ, useGSAP } from '../../motion/gsap'

type ImageVisual = Extract<Visual, { kind: 'image' }>

interface Props {
  visual: ImageVisual
  priority?: boolean
  sizes?: string
}

/**
 * Giro del producto.
 *
 * - Con `visual.spinFrames` (secuencia de fotos 360°, p. ej. 24–36 tomas en
 *   plataforma giratoria) hace una rotación completa real: gira sola y se puede
 *   arrastrar.
 * - Con una sola fotografía no existe información de la parte trasera, así que
 *   hace un giro en perspectiva acotado, con reflejo de luz sobre el producto.
 */
export function SpinImage({ visual, priority, sizes }: Props) {
  const frames = visual.spinFrames
  return frames && frames.length > 1 ? (
    <FrameSpin visual={visual} frames={frames} priority={priority} />
  ) : (
    <PerspectiveSpin visual={visual} priority={priority} sizes={sizes} />
  )
}

/** Tras arrastrar, el clic resultante no debe activar el enlace que contiene al producto. */
function swallowNextClick(el: HTMLElement) {
  const stop = (ev: Event) => {
    ev.preventDefault()
    ev.stopPropagation()
  }
  el.addEventListener('click', stop, { once: true, capture: true })
  window.setTimeout(() => el.removeEventListener('click', stop, { capture: true }), 400)
}

/* ---------- 360° real a partir de una secuencia de fotos ---------- */

function FrameSpin({ visual, frames, priority }: { visual: ImageVisual; frames: string[]; priority?: boolean }) {
  const [index, setIndex] = useState(0)
  const drag = useRef<{ x: number; start: number } | null>(null)
  const playing = useRef(true)

  useEffect(() => {
    // Precarga para que el giro no parpadee.
    frames.forEach((src) => {
      const img = new Image()
      img.src = src
    })
    if (window.matchMedia(MQ.reduced).matches) return
    const perFrame = 6000 / frames.length
    const id = window.setInterval(() => {
      if (playing.current) setIndex((i) => (i + 1) % frames.length)
    }, perFrame)
    return () => window.clearInterval(id)
  }, [frames])

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, start: index }
    playing.current = false
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const step = Math.round((e.clientX - drag.current.x) / 12)
    setIndex((((drag.current.start - step) % frames.length) + frames.length) % frames.length)
  }
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current && Math.abs(e.clientX - drag.current.x) > 6) swallowNextClick(e.currentTarget)
    drag.current = null
    playing.current = true
  }

  return (
    <div
      className="spin spin--frames"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => {
        drag.current = null
        playing.current = true
      }}
    >
      <img
        src={frames[index]}
        alt={visual.alt}
        width={visual.width}
        height={visual.height}
        loading={priority ? 'eager' : 'lazy'}
        draggable={false}
      />
      <span className="spin__hint" aria-hidden="true">
        Arrastra para girar
      </span>
    </div>
  )
}

/* ---------- giro en perspectiva con una sola foto ---------- */

function PerspectiveSpin({ visual, priority, sizes }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const turn = useRef<HTMLDivElement>(null)
  const loop = useRef<gsap.core.Tween | null>(null)
  const drag = useRef<{ x: number; from: number } | null>(null)

  const AMPLITUDE = 24
  const sync = () => {
    const el = turn.current
    if (el) el.style.setProperty('--spin', String(gsap.getProperty(el, 'rotationY')))
  }
  // Vaivén continuo entre -AMPLITUDE y +AMPLITUDE, partiendo de un extremo.
  const startLoop = (from: number) => {
    loop.current?.kill()
    loop.current = gsap.fromTo(
      turn.current,
      { rotationY: from },
      { rotationY: -from, duration: 5.5, ease: 'sine.inOut', repeat: -1, yoyo: true, onUpdate: sync },
    )
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.set(turn.current, { transformPerspective: 1400 })
        startLoop(-AMPLITUDE)
        // Flotación sutil, desfasada del giro.
        gsap.to(turn.current, { y: -10, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true })
        // Solo gira cuando está en pantalla.
        const io = new IntersectionObserver(([e]) => {
          if (drag.current) return
          if (e.isIntersecting) loop.current?.resume()
          else loop.current?.pause()
        })
        io.observe(ref.current!)
        return () => {
          io.disconnect()
          loop.current = null
        }
      })
    },
    { scope: ref },
  )

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!loop.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    loop.current.pause()
    drag.current = { x: e.clientX, from: Number(gsap.getProperty(turn.current!, 'rotationY')) }
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const deg = gsap.utils.clamp(-40, 40, drag.current.from + (e.clientX - drag.current.x) * 0.25)
    gsap.to(turn.current, { rotationY: deg, duration: 0.4, ease: 'power3.out', overwrite: 'auto', onUpdate: sync })
  }
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    if (Math.abs(e.clientX - drag.current.x) > 6) swallowNextClick(e.currentTarget)
    drag.current = null
    // Vuelve suavemente al extremo más cercano y retoma el vaivén sin saltos.
    const current = Number(gsap.getProperty(turn.current!, 'rotationY'))
    const edge = current >= 0 ? AMPLITUDE : -AMPLITUDE
    gsap.to(turn.current, {
      rotationY: edge,
      duration: 1.2,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: sync,
      onComplete: () => startLoop(edge),
    })
  }

  return (
    <div
      ref={ref}
      className="spin spin--perspective"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => (drag.current = null)}
    >
      <div ref={turn} className="spin__turn" style={{ '--mask': `url("${visual.src}")` } as CSSProperties}>
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
        />
        <span className="spin__sheen" aria-hidden="true" />
      </div>
      <span className="spin__shadow" aria-hidden="true" />
    </div>
  )
}
