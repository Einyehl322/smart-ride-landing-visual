import { expect, test } from '@playwright/test'
import { isDesktop, ROUTES, scrollThrough } from './helpers'

test.describe('Animaciones', () => {
  test('el intro del hero termina con todo visible', async ({ page }) => {
    await page.goto(ROUTES.home)
    await page.waitForTimeout(3200)
    for (const sel of ['.hero__title .line-mask > span', '.hero__lead', '.hero__actions a', '.hero__tag']) {
      for (const el of await page.locator(sel).all()) {
        const { opacity, visibility } = await el.evaluate((e) => getComputedStyle(e))
        expect(Number(opacity), sel).toBeGreaterThan(0.95)
        expect(visibility, sel).toBe('visible')
      }
    }
  })

  test('las secciones fijadas no bloquean el scroll hasta el pie', async ({ page }) => {
    await page.goto(ROUTES.home)
    await scrollThrough(page, 0.5)
    await expect(page.locator('.site-footer')).toBeInViewport()
  })

  test('spotlight: cada modelo toma el primer plano al avanzar', async ({ page }) => {
    test.skip(!isDesktop(page), 'fijado solo en escritorio')
    await page.goto(ROUTES.home)
    await page.locator('#destacados').scrollIntoViewIfNeeded()
    const slides = page.locator('.spot-ed')
    const dots = page.getByRole('group', { name: 'Elegir modelo destacado' }).getByRole('button')
    const count = await slides.count()
    await expect(dots).toHaveCount(count)
    for (let i = count - 1; i >= 0; i--) {
      await dots.nth(i).click()
      await expect(dots.nth(i)).toHaveAttribute('aria-pressed', 'true', { timeout: 4000 })
      await page.waitForTimeout(900)
      const visible = await slides.nth(i).locator('.spot-ed__copy').evaluate((e) => Number(getComputedStyle(e).opacity))
      expect(visible, `modelo ${i + 1}`).toBeGreaterThan(0.9)
      await expect(slides.nth(i).getByRole('heading')).toBeInViewport()
    }
  })

  test('cambios de layout mínimos al cargar la home', async ({ page }) => {
    await page.goto(ROUTES.home)
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
              if (!e.hadRecentInput) total += e.value
            }
          }).observe({ type: 'layout-shift', buffered: true })
          setTimeout(() => resolve(total), 2500)
        }),
    )
    expect(cls).toBeLessThan(0.1)
  })
})

test.describe('Movimiento reducido', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('todo el contenido está visible y nada queda fijado', async ({ page }) => {
    await page.goto(ROUTES.home)
    await expect(page.locator('.pin-spacer')).toHaveCount(0)
    await scrollThrough(page)
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('main h1, main h2, main h3, .ptile, .spot-ed__copy, .coll, .why__card')]
        .filter((el) => {
          const s = getComputedStyle(el)
          return Number(s.opacity) < 0.95 || s.visibility === 'hidden'
        })
        .map((el) => el.className || el.tagName),
    )
    expect(hidden).toEqual([])
  })

  test('la ficha muestra el recorrido como secuencia vertical', async ({ page }) => {
    await page.goto(ROUTES.intercomProduct)
    await expect(page.locator('.pintro__mobile')).toBeVisible()
    await expect(page.locator('.pintro__desktop')).toBeHidden()
  })
})
