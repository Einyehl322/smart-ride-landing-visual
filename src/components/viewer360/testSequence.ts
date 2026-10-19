/**
 * SOLO DESARROLLO — genera una secuencia 360° sintética para probar el visor
 * (gestos, zoom, carga y transiciones) mientras no existan las fotos reales.
 * Dibuja un objeto geométrico rotulado como prueba: no representa ningún producto.
 */
import type { View360 } from '../../data/types'

const W = 2000
const H = 1500
const FRAMES = 36

type V3 = [number, number, number]

const FACES: { idx: number[]; label: string; color: string }[] = [
  { idx: [0, 1, 2, 3], label: 'FRENTE', color: '#4f68ee' },
  { idx: [1, 5, 6, 2], label: 'DERECHA', color: '#2f3640' },
  { idx: [5, 4, 7, 6], label: 'ATRÁS', color: '#3b414c' },
  { idx: [4, 0, 3, 7], label: 'IZQUIERDA', color: '#262b33' },
  { idx: [3, 2, 6, 7], label: '', color: '#5a616c' },
]

function drawFrame(ctx: CanvasRenderingContext2D, deg: number) {
  ctx.clearRect(0, 0, W, H)
  const a = (deg * Math.PI) / 180
  const tilt = (18 * Math.PI) / 180
  const s = 330
  const box: V3[] = [
    [-1, -0.62, -0.42], [1, -0.62, -0.42], [1, 0.62, -0.42], [-1, 0.62, -0.42],
    [-1, -0.62, 0.42], [1, -0.62, 0.42], [1, 0.62, 0.42], [-1, 0.62, 0.42],
  ]
  const project = ([x, y, z]: V3) => {
    const rx = x * Math.cos(a) + z * Math.sin(a)
    const rz = -x * Math.sin(a) + z * Math.cos(a)
    const ry = y * Math.cos(tilt) - rz * Math.sin(tilt)
    const rz2 = y * Math.sin(tilt) + rz * Math.cos(tilt)
    const p = 4 / (4 + rz2)
    return { x: W / 2 + rx * s * p, y: H / 2 - 40 - ry * s * p, z: rz2 }
  }
  const pts = box.map(project)

  // Plataforma giratoria con marcas cada 10°.
  ctx.save()
  ctx.translate(W / 2, H / 2 + 330)
  ctx.scale(1, 0.22)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, 620, 0, Math.PI * 2)
  ctx.stroke()
  for (let t = 0; t < 360; t += 10) {
    const r = ((t + deg) * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(Math.cos(r) * 590, Math.sin(r) * 590)
    ctx.lineTo(Math.cos(r) * (t % 90 === 0 ? 540 : 570), Math.sin(r) * (t % 90 === 0 ? 540 : 570))
    ctx.stroke()
  }
  ctx.restore()

  // Caras ordenadas por profundidad.
  const faces = FACES.map((f) => ({ ...f, z: f.idx.reduce((m, i) => m + pts[i].z, 0) / 4 })).sort((p, q) => q.z - p.z)
  for (const f of faces) {
    const [p0, p1, p2] = f.idx.map((i) => pts[i])
    const cross = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x)
    if (cross > 0) continue
    ctx.beginPath()
    f.idx.forEach((i, k) => (k ? ctx.lineTo(pts[i].x, pts[i].y) : ctx.moveTo(pts[i].x, pts[i].y)))
    ctx.closePath()
    ctx.fillStyle = f.color
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 2
    ctx.stroke()
    if (f.label) {
      const cx = f.idx.reduce((m, i) => m + pts[i].x, 0) / 4
      const cy = f.idx.reduce((m, i) => m + pts[i].y, 0) / 4
      const width = Math.abs(cross) / 60000
      ctx.save()
      ctx.globalAlpha = Math.min(1, width)
      ctx.fillStyle = '#fff'
      ctx.font = '600 54px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(f.label, cx, cy)
      ctx.restore()
    }
  }

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 34px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`SECUENCIA DE PRUEBA · ${deg}°`, W / 2, 110)
}

export async function createTestSequence(): Promise<View360> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const frames: string[] = []
  for (let i = 0; i < FRAMES; i++) {
    drawFrame(ctx, (i * 360) / FRAMES)
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/webp', 0.92))
    frames.push(URL.createObjectURL(blob))
  }
  return { frames, width: W, height: H, isTestPattern: true }
}
