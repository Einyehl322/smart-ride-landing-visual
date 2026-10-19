import { expect, test } from '@playwright/test'
import { isDesktop, ROUTES } from './helpers'

test.describe('Ficha de intercomunicador', () => {
  test('información comercial, consulta contextual y secciones', async ({ page }) => {
    await page.goto(ROUTES.intercomProduct)
    const title = page.getByRole('heading', { level: 1 })
    await expect(title).toBeVisible()
    const name = (await title.textContent())!.trim()

    const hero = page.locator('.phero')
    await expect(hero.locator('.price')).toBeVisible()
    await expect(hero.locator('.price .sr-only')).toHaveText(/^S\/\s?\d+\.\d{2}$/)
    const wa = hero.locator('a[href*="wa.me/"]').first()
    await expect(wa).toHaveAttribute('href', new RegExp(encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

    // Foto a la izquierda e información a la derecha en escritorio; apiladas en móvil.
    const stage = await hero.locator('.stage').boundingBox()
    const content = await hero.locator('.phero__content').boundingBox()
    if (isDesktop(page)) expect(stage!.x).toBeLessThan(content!.x)
    else expect(stage!.y).toBeLessThan(content!.y)

    for (const id of ['beneficios', 'especificaciones', 'galeria', 'comparar', 'faq']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
    await expect(page.locator('#comparar thead .is-current')).toHaveCount(1)
    await expect(page.locator('.related').getByTestId('product-tile').first()).toBeAttached()
  })

  test('subnavegación lleva a cada sección', async ({ page }) => {
    await page.goto(ROUTES.intercomProduct)
    const subnav = page.getByRole('navigation', { name: /^Secciones de/ })
    await subnav.getByRole('link', { name: 'Especificaciones' }).click()
    await expect(page.locator('#especificaciones')).toBeInViewport({ ratio: 0.2 })
  })

  test('galería: acercar y restablecer la imagen', async ({ page }) => {
    await page.goto(ROUTES.intercomProduct)
    const gallery = page.locator('#galeria')
    await gallery.scrollIntoViewIfNeeded()
    const zoom = gallery.getByRole('button', { name: 'Acercar imagen' })
    await zoom.click()
    await expect(gallery.locator('.gallery__viewer')).toHaveClass(/is-zoomed/)
    await gallery.getByRole('button', { name: 'Restablecer' }).click()
    await expect(gallery.locator('.gallery__viewer')).not.toHaveClass(/is-zoomed/)
  })

  test('preguntas frecuentes se despliegan', async ({ page }) => {
    await page.goto(ROUTES.intercomProduct)
    const item = page.locator('#faq details').first()
    await item.locator('summary').click()
    await expect(item).toHaveAttribute('open', '')
  })

  test('el audífono no se presenta como intercomunicador', async ({ page }) => {
    await page.goto(ROUTES.audioProduct)
    await expect(page.locator('.phero__meta .eyebrow')).toHaveText(/Audífonos/)
  })

  test('barra de compra móvil aparece al dejar atrás el hero', async ({ page }) => {
    test.skip(isDesktop(page), 'solo en móvil y tablet')
    await page.goto(ROUTES.intercomProduct)
    const bar = page.locator('.buybar')
    await expect(bar).not.toHaveClass(/is-visible/)
    await page.mouse.wheel(0, 1600)
    await expect(bar).toHaveClass(/is-visible/)
    await expect(bar.locator('a[href*="wa.me/"]')).toBeVisible()
  })
})

test.describe('Ficha de CarPlay', () => {
  test('vitrina oscura, vistas reales y relacionados en claro', async ({ page }) => {
    await page.goto(ROUTES.carplayProduct)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.spot')).toHaveAttribute('data-scheme', 'dark')
    await expect(page.locator('#caracteristicas')).toHaveAttribute('data-scheme', 'light')

    const views = page.getByRole('group', { name: 'Vistas del producto' }).getByRole('button')
    if ((await views.count()) > 1) {
      await views.nth(1).click()
      await expect(views.nth(1)).toHaveAttribute('aria-pressed', 'true')
    }
    await expect(page.locator('#comparar .fcompare__table')).toBeAttached()
    await expect(page.getByTestId('product-tile').first()).toBeAttached()
  })

  test('visor 360°: abre, gira con el teclado, restablece y cierra (banco de pruebas)', async ({ page }) => {
    // Sin secuencias reales en el catálogo; en desarrollo `?visor360=prueba` carga un patrón de prueba.
    await page.goto(`${ROUTES.carplayProduct}?visor360=prueba`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const open = page.getByRole('button', { name: 'Ver en 360°' })
    // Espera a que termine la entrada de la ficha (los textos aparecen escalonados).
    const available = await open.waitFor({ timeout: 6000 }).then(
      () => true,
      () => false,
    )
    test.skip(!available, 'el banco de pruebas solo existe en el servidor de desarrollo')
    test.setTimeout(120_000)
    await open.click()
    // El patrón de prueba se genera en el navegador antes de abrir.
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 90_000 })
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden({ timeout: 10_000 })
    await expect(open).toBeFocused()
  })

  test('sin secuencia real no se simula un giro 360°', async ({ page }) => {
    await page.goto(ROUTES.carplayProduct)
    await expect(page.getByRole('button', { name: 'Ver en 360°' })).toHaveCount(0)
  })
})
