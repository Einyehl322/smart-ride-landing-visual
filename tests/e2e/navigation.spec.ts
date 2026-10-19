import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, isDesktop, ROUTES, scrollThrough, trackErrors } from './helpers'

test.describe('Menú móvil', () => {
  test('abre, navega, se cierra con Escape y devuelve el foco', async ({ page }) => {
    test.skip(isDesktop(page), 'el menú plegado solo existe por debajo de 1024px')
    await page.goto(ROUTES.home)
    const toggle = page.getByRole('button', { name: 'Abrir menú' })
    await toggle.click()

    const menu = page.locator('#mobile-menu')
    await expect(menu).toBeVisible()
    const box = await menu.boundingBox()
    expect(box!.height, 'el panel ocupa la pantalla bajo la cabecera').toBeGreaterThan(400)
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')

    await page.getByRole('button', { name: 'Abrir menú' }).click()
    const link = menu.locator('ul a').first()
    const name = (await link.textContent())!.trim()
    const href = (await link.getAttribute('href'))!
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${href}$`))
    await expect(menu).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  })

  test('acceso rápido a CarPlay en la cabecera', async ({ page }) => {
    test.skip(isDesktop(page), 'solo en pantallas sin menú completo')
    await page.goto(ROUTES.home)
    await page.getByTestId('site-header').getByRole('link', { name: 'CarPlay', exact: true }).click()
    await expect(page).toHaveURL(/\/carplay$/)
  })
})

test.describe('Rutas', () => {
  for (const [name, route] of Object.entries(ROUTES) as [string, string][]) {
    test(`${name}: carga sin errores ni desbordes`, async ({ page }) => {
      const errors = trackErrors(page)
      await page.goto(route)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await scrollThrough(page)
      await expectNoHorizontalOverflow(page)
      await expect(page.locator('#contacto')).toBeAttached()
      expect(errors).toEqual([])
    })
  }

  test('ruta inexistente muestra la página 404', async ({ page }) => {
    await page.goto('./no-existe/tampoco')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.locator('main a[href$="/alonso-landing/"]').first().click()
    await expect(page.locator('[data-section="hero"]')).toBeVisible()
  })

  test('los modelos retirados redirigen a su categoría', async ({ page }) => {
    await page.goto('./carplay/carplay-81-hd')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.showroom')).toBeVisible()
  })

  test('el botón atrás restaura la posición en la categoría', async ({ page }) => {
    await page.goto(ROUTES.intercom, { waitUntil: 'networkidle' })
    // Con fuentes e imágenes ya cargadas el diseño no se mueve entre la medición y el clic.
    await page.evaluate(() => document.fonts.ready)
    const tile = page.getByTestId('product-tile').nth(4)
    // Centrada, para que el clic no tenga que desplazar la página (la cabecera es fija).
    await tile.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    // Posición en el instante de salir (el clic de Playwright puede desplazar antes).
    await page.evaluate(() => {
      const push = history.pushState.bind(history)
      history.pushState = (...args: Parameters<History['pushState']>) => {
        ;(window as unknown as { __leftAt: number }).__leftAt = scrollY
        return push(...args)
      }
    })
    await tile.getByRole('heading').getByRole('link').click()
    await expect(page).toHaveURL(/\/intercomunicadores\/[\w-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(/\/intercomunicadores$/)
    const before = await page.evaluate(() => (window as unknown as { __leftAt: number }).__leftAt)
    expect(before).toBeGreaterThan(300)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before - 40)
    expect(await page.evaluate(() => scrollY)).toBeLessThan(before + 40)
  })
})
