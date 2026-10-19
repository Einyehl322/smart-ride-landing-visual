/**
 * Capturas de la ventana en puntos concretos del recorrido (secciones fijadas,
 * transiciones de scroll). Las capturas de página completa no muestran el
 * contenido "pinned" en su sitio, así que se revisan con desplazamientos reales.
 *
 *   node scripts/shot-at.mjs <ruta> <viewport> <objetivo,...>
 *   objetivo: "#id" (inicio de la sección), "#id+600" (px dentro) o un número (scrollY)
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const [route = '/', vp = 'desktop', targets = '0'] = process.argv.slice(2)
const BASE = process.env.LOCAL_URL ?? 'http://localhost:5174/alonso-landing'
const SIZES = { desktop: [1440, 900], laptop: [1280, 800], tablet: [768, 1024], mobile: [390, 844] }
const OUT = 'artifacts/design-audit/iter'
await mkdir(OUT, { recursive: true })

const [width, height] = SIZES[vp]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height }, ...(vp === 'mobile' ? { isMobile: true, hasTouch: true } : {}) })
await page.goto(BASE + route, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

for (const [i, t] of targets.split(',').entries()) {
  const y = await page.evaluate((t) => {
    if (/^\d+$/.test(t)) return Number(t)
    const [sel, off] = t.split('+')
    const el = document.querySelector(sel)
    if (!el) return 0
    // Con pin, el inicio real es el del pin-spacer.
    const host = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
    return host.getBoundingClientRect().top + scrollY + Number(off ?? 0)
  }, t)
  // Avance gradual para que los scrubs lleguen a su estado.
  await page.evaluate(async (y) => {
    const from = scrollY
    for (let k = 1; k <= 12; k++) {
      scrollTo(0, from + ((y - from) * k) / 12)
      await new Promise((r) => setTimeout(r, 60))
    }
  }, y)
  await page.waitForTimeout(1600)
  const file = `${OUT}/at-${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}-${vp}-${i}.png`
  await page.screenshot({ path: file })
  console.log(file, Math.round(y))
}
await browser.close()
