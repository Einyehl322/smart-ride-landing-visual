import { expect, type Page } from '@playwright/test'

/** Rutas principales: home, las tres categorías y una ficha de cada tipo. */
export const ROUTES = {
  home: './',
  intercom: './intercomunicadores',
  carplay: './carplay',
  accesorios: './accesorios',
  intercomProduct: './intercomunicadores/freedconn-hero',
  audioProduct: './intercomunicadores/v12-earphone',
  carplayProduct: './carplay/carplay-625-freedconn',
  tpmsProduct: './accesorios/tpms-kit-solar',
} as const

/** Registra errores de página y de consola para comprobarlos al final. */
export function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

/** Recorre la página para que se carguen las imágenes diferidas y se disparen los ScrollTriggers. */
export async function scrollThrough(page: Page, step = 0.7) {
  await page.evaluate(async (step) => {
    const max = () => document.documentElement.scrollHeight - innerHeight
    for (let y = 0; y < max(); y += innerHeight * step) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    scrollTo(0, max())
    await new Promise((r) => setTimeout(r, 300))
  }, step)
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  expect(overflow, 'la página no debe desplazarse en horizontal').toBeLessThanOrEqual(0)
}

export const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024
