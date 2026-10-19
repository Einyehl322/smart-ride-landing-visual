/**
 * Captura rápida de una ruta local para revisar composición durante el desarrollo.
 *
 *   node scripts/shot.mjs <ruta> [desktop|laptop|tablet|mobile] [--reduced]
 *
 * Guarda <nombre>-fold.png y <nombre>-full.png en artifacts/design-audit/iter/
 * e imprime errores de consola y desbordes horizontales.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const [route = '/', vp = 'desktop'] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const reduced = process.argv.includes('--reduced')
const BASE = process.env.LOCAL_URL ?? 'http://localhost:5174/alonso-landing'
const SIZES = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
}
const OUT = 'artifacts/design-audit/iter'
const name = `${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}-${vp}${reduced ? '-reduced' : ''}`

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: SIZES[vp],
  reducedMotion: reduced ? 'reduce' : 'no-preference',
  ...(vp === 'mobile' ? { isMobile: true, hasTouch: true, deviceScaleFactor: 1 } : {}),
})
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto(BASE + route, { waitUntil: 'networkidle' })
await page.waitForTimeout(2600)
await page.screenshot({ path: `${OUT}/${name}-fold.png` })
await page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.6) {
    scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 140))
  }
  scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 600))
})
await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true })
const info = await page.evaluate(() => ({
  height: document.documentElement.scrollHeight,
  overflowX: document.documentElement.scrollWidth - innerWidth,
  wide: [...document.querySelectorAll('body *')]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      return r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && r.width > 0
    })
    .slice(0, 5)
    .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)} → ${Math.round(el.getBoundingClientRect().right)}`),
}))
console.log(JSON.stringify({ name, ...info, errors: errors.slice(0, 8) }, null, 1))
await browser.close()
