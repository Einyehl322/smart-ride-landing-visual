import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, isDesktop, ROUTES, scrollThrough, trackErrors } from './helpers'

const SECTIONS = ['hero', 'categorias', 'favoritos', 'manifiesto', 'spotlight', 'colecciones', 'carplay', 'exploradoras', 'comparar', 'por-que', 'comprar', 'cta-final']

test.describe('Home', () => {
  test('presenta las secciones comerciales en orden y sin errores', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto(ROUTES.home)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const tops: number[] = []
    for (const id of SECTIONS) {
      const section = page.locator(`[data-section="${id}"]`)
      await expect(section, `sección ${id}`).toHaveCount(1)
      tops.push(await section.evaluate((el) => el.getBoundingClientRect().top + scrollY))
    }
    expect([...tops].sort((a, b) => a - b)).toEqual(tops)

    await scrollThrough(page)
    await expect(page.locator('#contacto')).toBeVisible()
    await expectNoHorizontalOverflow(page)
    expect(errors).toEqual([])
  })

  test('las acciones del hero llevan a cada categoría', async ({ page }) => {
    await page.goto(ROUTES.home)
    const hero = page.locator('[data-section="hero"]')
    await hero.locator('.hero__actions a[href$="/intercomunicadores"]').click()
    await expect(page).toHaveURL(/\/intercomunicadores$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(/\/alonso-landing\/?$/)
    await hero.locator('.hero__actions a[href$="/carplay"]').click()
    await expect(page).toHaveURL(/\/carplay$/)
  })

  test('favoritos: las pestañas cambian los modelos y son accesibles por teclado', async ({ page }) => {
    await page.goto(ROUTES.home)
    const section = page.locator('#favoritos')
    await section.scrollIntoViewIfNeeded()
    const tabs = section.getByRole('tab')
    await expect(tabs).toHaveCount(4)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')

    const slugs = () => section.getByTestId('product-tile').evaluateAll((els) => els.map((e) => e.getAttribute('data-slug')))
    const first = await slugs()
    expect(first.length).toBeGreaterThan(0)

    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    const second = await slugs()
    expect(second.length).toBeGreaterThan(0)
    expect(second).not.toEqual(first)

    await tabs.nth(1).focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.nth(2)).toBeFocused()
  })

  test('una tarjeta abre su ficha y "atrás" vuelve a la home', async ({ page }) => {
    await page.goto(ROUTES.home)
    const tile = page.locator('#favoritos').getByTestId('product-tile').first()
    await tile.scrollIntoViewIfNeeded()
    const slug = await tile.getAttribute('data-slug')
    const name = (await tile.getByRole('heading').textContent())!.trim()

    await tile.getByRole('heading').getByRole('link').click()
    await expect(page).toHaveURL(new RegExp(`/${slug}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)

    await page.goBack()
    await expect(page).toHaveURL(/\/alonso-landing\/?$/)
    await expect(page.locator('#favoritos')).toBeInViewport({ ratio: 0.1 })
  })

  test('comparador de la home: elegir modelos actualiza la tabla', async ({ page }) => {
    await page.goto(ROUTES.home)
    const section = page.locator('#comparar-home')
    const board = section.getByTestId('comparison-board')
    const mobile = (page.viewportSize()?.width ?? 0) < 640
    await expect(board.locator('[data-comparison-product]')).toHaveCount(mobile ? 2 : 3)
    await board.getByRole('button', { name: /^Cambiar modelo 1:/ }).click()
    await page.getByRole('dialog', { name: 'Elige tu primer modelo.' }).getByRole('button', { name: 'Elegir Y13 Pro', exact: true }).click()
    await expect(board.locator('[data-comparison-product]').first()).toHaveAttribute('data-comparison-product', 'y13-pro')
    await expect(board.locator('thead')).toContainText('Y13 Pro')
    await section.getByRole('button', { name: 'Pantallas CarPlay', exact: true }).click()
    await expect(section.locator('.fcompare__table')).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })

  test('header de escritorio: navegación principal y acceso al catálogo', async ({ page }) => {
    test.skip(!isDesktop(page), 'navegación completa solo en escritorio')
    await page.goto(ROUTES.home)
    const nav = page.getByRole('navigation', { name: 'Principal' })
    for (const label of ['Inicio', 'Intercomunicadores', 'CarPlay', 'Accesorios', 'Exploradoras', 'Contacto']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
    await page.getByTestId('site-header').getByRole('link', { name: 'Ver catálogo' }).click()
    await expect(page.locator('#favoritos')).toBeInViewport({ ratio: 0.2 })
    await nav.getByRole('link', { name: 'Accesorios', exact: true }).click()
    await expect(page).toHaveURL(/\/accesorios$/)
    await expect(nav.getByRole('link', { name: 'Accesorios', exact: true })).toHaveAttribute('aria-current', 'page')
  })

  test('precios en soles y consultas por WhatsApp contextuales', async ({ page }) => {
    await page.goto(ROUTES.home)
    await scrollThrough(page)
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/US\$|USD|\$\s?\d/)
    const prices = await page.locator('.price .sr-only').allTextContents()
    expect(prices.length).toBeGreaterThan(10)
    for (const p of prices) expect(p).toMatch(/^S\/\s?\d{1,3}(,\d{3})*\.\d{2}$/)

    const wa = page.locator('a[href*="wa.me/"]')
    expect(await wa.count()).toBeGreaterThan(3)
    for (const href of await wa.evaluateAll((els) => els.map((e) => e.getAttribute('href')!))) {
      expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
    }
    await expect(wa.first()).toHaveAttribute('target', '_blank')
  })
})
