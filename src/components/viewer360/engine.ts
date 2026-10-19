/**
 * Motor del visor 360°: carga de la secuencia, gestos y dibujo en <canvas>.
 * Es independiente de React; el componente solo lo crea, le pasa el canvas y
 * lo destruye al cerrar.
 */
import type { View360 } from '../../data/types'

/* ---------------- carga ---------------- */

/** Descarga y decodifica las tomas empezando por las más cercanas al ángulo actual. */
class FrameLoader {
  readonly images: (HTMLImageElement | undefined)[]
  private cancelled = false
  private queue: number[] = []
  private live = new Set<HTMLImageElement>()
  private inflight = new Set<number>()
  private urls: string[]
  private onLoad: (index: number) => void
  private concurrency: number
  loaded = 0

  constructor(urls: string[], onLoad: (index: number) => void, concurrency = 4) {
    this.urls = urls
    this.onLoad = onLoad
    this.concurrency = concurrency
    this.images = new Array(urls.length)
  }

  /** Reordena la cola para priorizar las tomas alrededor de `center`. */
  prioritize(center: number) {
    const n = this.urls.length
    const order: number[] = []
    for (let d = 0; d <= n / 2; d++) {
      for (const i of d === 0 ? [center] : [center + d, center - d]) {
        const idx = ((i % n) + n) % n
        if (!this.images[idx] && !this.inflight.has(idx) && !order.includes(idx)) order.push(idx)
      }
    }
    this.queue = order
  }

  start(center: number) {
    this.prioritize(center)
    for (let w = 0; w < this.concurrency; w++) void this.worker()
  }

  private async worker() {
    while (!this.cancelled) {
      const i = this.queue.shift()
      if (i === undefined) return
      if (this.images[i] || this.inflight.has(i)) continue
      this.inflight.add(i)
      const img = new Image()
      img.decoding = 'async'
      this.live.add(img)
      img.src = this.urls[i]
      try {
        await img.decode()
        if (this.cancelled) return
        this.images[i] = img
        this.loaded++
        this.onLoad(i)
      } catch {
        // Toma no disponible: se usará la más cercana.
      } finally {
        this.live.delete(img)
        this.inflight.delete(i)
      }
    }
  }

  /** Corta descargas en curso y suelta las imágenes para liberar memoria. */
  destroy() {
    this.cancelled = true
    this.queue = []
    for (const img of this.live) img.src = ''
    for (const img of this.images) if (img) img.src = ''
    this.images.fill(undefined)
  }
}

/* ---------------- motor ---------------- */

export interface EngineState {
  frame: number
  degrees: number
  zoom: number
  maxZoom: number
  loaded: number
  total: number
  autoplay: boolean
}

interface Options {
  canvas: HTMLCanvasElement
  /** Elemento cuyo rectángulo define dónde se dibuja el producto a zoom 1. */
  box: HTMLElement
  sequence: View360
  reducedMotion: boolean
  autoplay: boolean
  onChange: (state: EngineState) => void
  onFirstFrame: () => void
}

const TURN_SECONDS = 14
const MAX_ZOOM = 3
const mod = (a: number, n: number) => ((a % n) + n) % n

export class Viewer360Engine {
  private ctx: CanvasRenderingContext2D
  private loader: FrameLoader
  private hiLoader: FrameLoader | null = null
  private n: number
  private dir: number
  private raf = 0
  private last = 0
  private dirty = true
  private dpr = 1
  private fit = { x: 0, y: 0, w: 0, h: 0 }
  private useHighAsBase = false
  private firstShown = false

  // Estado del giro y la cámara (en "tomas" y píxeles CSS).
  private angle: number
  private velocity = 0
  private zoom = 1
  private targetZoom = 1
  private pan = { x: 0, y: 0 }
  private targetPan = { x: 0, y: 0 }
  private autoplay: boolean
  private animatingTo: number | null = null

  // Gestos
  private pointers = new Map<number, { x: number; y: number }>()
  private lastMove = { x: 0, t: 0, v: 0 }
  private pinchStart: { dist: number; zoom: number } | null = null
  interacted = false
  private o: Options

  constructor(o: Options) {
    this.o = o
    const ctx = o.canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas 2D no disponible')
    this.ctx = ctx
    this.n = o.sequence.frames.length
    this.dir = o.sequence.reverse ? -1 : 1
    this.angle = o.sequence.initialFrame ?? 0
    this.autoplay = o.autoplay && !o.reducedMotion

    this.measure()
    // Pantallas densas o grandes: si la toma base se quedaría corta, se usa la
    // secuencia de alta resolución como base.
    const s = o.sequence
    this.useHighAsBase = !!s.zoomFrames && this.fit.w * this.dpr > s.width * 0.95
    this.loader = new FrameLoader(this.useHighAsBase ? s.zoomFrames! : s.frames, (i) => this.onLoaded(i))
    this.loader.start(this.currentFrame())

    this.bind()
    this.raf = requestAnimationFrame(this.tick)
  }

  /* ----- API pública ----- */

  setAutoplay(on: boolean) {
    this.autoplay = on && !this.o.reducedMotion
    this.velocity = 0
    this.emit()
  }

  zoomBy(factor: number) {
    this.setZoom(this.targetZoom * factor)
  }

  /** Vuelve a la vista frontal sin zoom (camino más corto). */
  reset(instant = false) {
    const start = this.o.sequence.initialFrame ?? 0
    const delta = mod(start - this.angle + this.n / 2, this.n) - this.n / 2
    this.velocity = 0
    this.targetZoom = 1
    this.targetPan = { x: 0, y: 0 }
    if (instant || this.o.reducedMotion) {
      this.angle = this.angle + delta
      this.zoom = 1
      this.pan = { x: 0, y: 0 }
      this.dirty = true
    } else {
      this.animatingTo = this.angle + delta
    }
    this.emit()
  }

  /** Promesa que se resuelve cuando la vista vuelve al encuadre inicial. */
  settle(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.animatingTo === null && Math.abs(this.zoom - 1) < 0.01) resolve()
        else requestAnimationFrame(check)
      }
      check()
    })
  }

  rotateBy(frames: number) {
    this.interacted = true
    this.autoplay = false
    this.animatingTo = Math.round(this.angle) + frames
    this.emit()
  }

  resize() {
    this.measure()
    this.clampPan()
    this.dirty = true
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.unbind()
    this.loader.destroy()
    this.hiLoader?.destroy()
    const { canvas } = this.o
    canvas.width = canvas.height = 0
  }

  /* ----- medidas y dibujo ----- */

  private measure() {
    const { canvas, box, sequence } = this.o
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const c = { width: canvas.clientWidth, height: canvas.clientHeight }
    canvas.width = Math.round(c.width * this.dpr)
    canvas.height = Math.round(c.height * this.dpr)
    // Encaje "contain" de la toma dentro de la caja, en px CSS relativos al canvas.
    // Se usan medidas de maquetación (sin transformaciones) porque la caja puede
    // estar animándose al abrir el visor; canvas y caja comparten contenedor.
    const b = { left: box.offsetLeft, top: box.offsetTop, width: box.offsetWidth, height: box.offsetHeight }
    const ar = sequence.width / sequence.height
    let w = b.width
    let h = w / ar
    if (h > b.height) {
      h = b.height
      w = h * ar
    }
    this.fit = { x: b.left + (b.width - w) / 2, y: b.top + (b.height - h) / 2, w, h }
  }

  /** Zoom máximo sin superar la resolución real de la fotografía. */
  maxZoom() {
    const s = this.o.sequence
    const sourceWidth = s.zoomWidth ?? s.width
    return Math.max(1, Math.min(MAX_ZOOM, sourceWidth / (this.fit.w * this.dpr)))
  }

  private setZoom(z: number, at?: { x: number; y: number }) {
    const next = Math.max(1, Math.min(this.maxZoom(), z))
    if (at) {
      // Mantiene fijo el punto bajo el cursor/dedos.
      const cx = this.fit.x + this.fit.w / 2
      const cy = this.fit.y + this.fit.h / 2
      const px = at.x - cx
      const py = at.y - cy
      const k = next / this.targetZoom
      this.targetPan = { x: px - (px - this.targetPan.x) * k, y: py - (py - this.targetPan.y) * k }
    }
    this.targetZoom = next
    if (next === 1) this.targetPan = { x: 0, y: 0 }
    if (next > 1) {
      this.interacted = true
      this.autoplay = false
      this.ensureHighRes()
    }
    this.clampPan()
    this.emit()
  }

  private clampPan() {
    const c = this.o.canvas.getBoundingClientRect()
    const limit = (size: number, view: number) => Math.max(0, (size * this.targetZoom - view) / 2 + size * 0.1)
    const lx = limit(this.fit.w, c.width)
    const ly = limit(this.fit.h, c.height)
    this.targetPan.x = Math.max(-lx, Math.min(lx, this.targetPan.x))
    this.targetPan.y = Math.max(-ly, Math.min(ly, this.targetPan.y))
  }

  private ensureHighRes() {
    const s = this.o.sequence
    if (this.hiLoader || this.useHighAsBase || !s.zoomFrames) return
    this.hiLoader = new FrameLoader(s.zoomFrames, (i) => i === this.currentFrame() && (this.dirty = true), 2)
    this.hiLoader.start(this.currentFrame())
  }

  private currentFrame() {
    return mod(Math.round(this.angle * this.dir), this.n)
  }

  private imageFor(frame: number) {
    if (this.zoom > 1.05 && this.hiLoader?.images[frame]) return this.hiLoader.images[frame]
    const imgs = this.loader.images
    if (imgs[frame]) return imgs[frame]
    // Toma aún no descargada: se muestra la más cercana ya disponible.
    for (let d = 1; d <= this.n / 2; d++) {
      const a = imgs[mod(frame + d, this.n)] ?? imgs[mod(frame - d, this.n)]
      if (a) return a
    }
    return undefined
  }

  private draw() {
    const { ctx } = this
    const { canvas } = this.o
    const frame = this.currentFrame()
    const img = this.imageFor(frame)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!img) return
    const d = this.dpr
    const w = this.fit.w * this.zoom
    const h = this.fit.h * this.zoom
    const x = this.fit.x + (this.fit.w - w) / 2 + this.pan.x
    const y = this.fit.y + (this.fit.h - h) / 2 + this.pan.y
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, x * d, y * d, w * d, h * d)
    if (!this.firstShown) {
      this.firstShown = true
      this.o.onFirstFrame()
    }
  }

  private onLoaded(i: number) {
    if (i === this.currentFrame() || !this.firstShown) this.dirty = true
    this.emit()
  }

  private emit() {
    const frame = this.currentFrame()
    this.o.onChange({
      frame,
      degrees: Math.round((frame * 360) / this.n),
      zoom: this.targetZoom,
      maxZoom: this.maxZoom(),
      loaded: this.loader.loaded,
      total: this.n,
      autoplay: this.autoplay,
    })
  }

  /* ----- bucle ----- */

  private tick = (t: number) => {
    const dt = this.last ? Math.min((t - this.last) / 1000, 0.05) : 0
    this.last = t
    const before = this.currentFrame()

    if (this.animatingTo !== null) {
      const diff = this.animatingTo - this.angle
      if (Math.abs(diff) < 0.02) {
        this.angle = this.animatingTo
        this.animatingTo = null
      } else this.angle += diff * Math.min(1, dt * 7)
    } else if (this.pointers.size === 0) {
      if (Math.abs(this.velocity) > 0.002) {
        // Inercia tras soltar.
        this.angle += this.velocity * dt * 60
        this.velocity *= Math.pow(0.9, dt * 60)
      } else if (this.autoplay && this.zoom <= 1.001) {
        this.angle += (this.n / TURN_SECONDS) * dt
      }
    }

    const ease = this.o.reducedMotion ? 1 : Math.min(1, dt * 12)
    const zDiff = this.targetZoom - this.zoom
    const pxDiff = this.targetPan.x - this.pan.x
    const pyDiff = this.targetPan.y - this.pan.y
    if (Math.abs(zDiff) > 0.0005 || Math.abs(pxDiff) > 0.1 || Math.abs(pyDiff) > 0.1) {
      this.zoom += zDiff * ease
      this.pan.x += pxDiff * ease
      this.pan.y += pyDiff * ease
      this.dirty = true
    }

    const after = this.currentFrame()
    if (after !== before) {
      this.dirty = true
      this.loader.prioritize(after)
      this.emit()
    }
    if (this.dirty) {
      this.dirty = false
      this.draw()
    }
    this.raf = requestAnimationFrame(this.tick)
  }

  /* ----- gestos (ratón, táctil, lápiz, rueda) ----- */

  private bind() {
    const c = this.o.canvas
    c.addEventListener('pointerdown', this.onDown)
    c.addEventListener('pointermove', this.onMove)
    c.addEventListener('pointerup', this.onUp)
    c.addEventListener('pointercancel', this.onUp)
    c.addEventListener('wheel', this.onWheel, { passive: false })
    c.addEventListener('dblclick', this.onDouble)
  }

  private unbind() {
    const c = this.o.canvas
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointermove', this.onMove)
    c.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('pointercancel', this.onUp)
    c.removeEventListener('wheel', this.onWheel)
    c.removeEventListener('dblclick', this.onDouble)
  }

  private local(e: { clientX: number; clientY: number }) {
    const r = this.o.canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  private onDown = (e: PointerEvent) => {
    this.o.canvas.setPointerCapture(e.pointerId)
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    this.velocity = 0
    this.animatingTo = null
    this.interacted = true
    if (this.autoplay) this.setAutoplay(false)
    this.lastMove = { x: e.clientX, t: performance.now(), v: 0 }
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()]
      this.pinchStart = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: this.targetZoom }
    }
  }

  private onMove = (e: PointerEvent) => {
    const prev = this.pointers.get(e.pointerId)
    if (!prev) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (this.pointers.size === 2 && this.pinchStart) {
      const [a, b] = [...this.pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const mid = this.local({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 })
      this.setZoom(this.pinchStart.zoom * (dist / this.pinchStart.dist), mid)
      return
    }

    if (this.targetZoom > 1.001) {
      // Con zoom, arrastrar desplaza el encuadre.
      this.targetPan.x += dx
      this.targetPan.y += dy
      this.clampPan()
      return
    }

    // Sin zoom, arrastrar gira: el ancho del producto equivale a ~una vuelta.
    const framesPerPx = this.n / Math.max(320, this.fit.w * 1.4)
    const delta = -dx * framesPerPx
    this.angle += delta
    const now = performance.now()
    const dt = Math.max(1, now - this.lastMove.t)
    this.lastMove = { x: e.clientX, t: now, v: (delta / dt) * 16 }
    this.dirty = true
  }

  private onUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId)
    if (this.pointers.size < 2) this.pinchStart = null
    if (this.pointers.size === 0 && !this.o.reducedMotion && this.targetZoom <= 1.001) {
      // Solo hay inercia si el gesto terminó en movimiento.
      this.velocity = performance.now() - this.lastMove.t < 80 ? this.lastMove.v : 0
    }
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const factor = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018))
    this.setZoom(this.targetZoom * factor, this.local(e))
  }

  private onDouble = (e: MouseEvent) => {
    this.setZoom(this.targetZoom > 1.01 ? 1 : Math.min(2, this.maxZoom()), this.local(e))
  }
}
