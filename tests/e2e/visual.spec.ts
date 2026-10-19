import { expect, test } from '@playwright/test'
import { ROUTES, scrollThrough } from './helpers'

/**
 * Capturas de revisión por ruta y dispositivo (test-results/<prueba>/).
 * No son golden snapshots: sirven para revisar composición, márgenes y
 * jerarquía a ojo tras cada cambio. Además se comprueban reglas visuales
 * objetivas: texto dentro del contenedor, imágenes cargadas y botones tocables.
 */
for (const [name, route] of Object.entries(ROUTES) as [string, string][]) {
  test(`captura y reglas visuales: ${name}`, async ({ page }, info) => {
    await page.goto(route)
    await page.waitForTimeout(1200)
    await page.screenshot({ path: info.outputPath(`${name}-fold.png`) })
    await scrollThrough(page)
    await page.evaluate(() => scrollTo(0, 0))
    await page.waitForTimeout(600)

    const report = await page.evaluate(() => {
      const vw = innerWidth
      const outside = [...document.querySelectorAll('main h1, main h2, main h3, main p, main .btn')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          if (!r.width || el.closest('[class*="scroller"], .tabs, .cmph__controls, .pin-spacer')) return false
          return r.left < -1 || r.right > vw + 1
        })
        .map((el) => el.textContent?.trim().slice(0, 40))
      const broken = [...document.querySelectorAll('main img')]
        .filter((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth === 0)
        .map((img) => (img as HTMLImageElement).currentSrc)
      const small = [...document.querySelectorAll('main a.btn, main button')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && r.height > 0 && r.height < 32 && getComputedStyle(el).visibility !== 'hidden'
        })
        .map((el) => el.textContent?.trim().slice(0, 30) || el.getAttribute('aria-label'))
      return { outside, broken, small }
    })
    expect(report.outside, 'texto fuera de la pantalla').toEqual([])
    expect(report.broken, 'imágenes rotas').toEqual([])
    expect(report.small, 'objetivos táctiles menores de 32px').toEqual([])
    await page.screenshot({ path: info.outputPath(`${name}-full.png`), fullPage: true })
  })
}
