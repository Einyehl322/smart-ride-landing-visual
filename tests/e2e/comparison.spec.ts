import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, trackErrors } from './helpers'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

test('comparador: muestra modelos completos y permite acceder a todo el catálogo sin arrastrar', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('./exploradoras')
  const board = page.locator('#comparar .comparison')
  const mobile = (page.viewportSize()?.width ?? 0) < 640
  await expect(board.locator('[data-comparison-product]')).toHaveCount(mobile ? 2 : 3)
  await expect(board.getByRole('checkbox', { name: 'Solo diferencias' })).toBeChecked()
  await expect(board.getByLabel('Características compartidas')).toContainText('12–24 V')
  for (const element of [board.locator('table'), ...await board.locator('[data-comparison-product]').all()]) {
    const box = await element.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  }
  await board.getByRole('button', { name: /^Cambiar modelo 1:/ }).click()
  const picker = page.getByRole('dialog', { name: 'Elige tu primer modelo.' })
  await expect(picker.getByRole('button', { name: /^Elegir / })).toHaveCount(9)
  await expect(picker.getByRole('button', { name: 'Elegir Exploradoras de 3 ojos', exact: true })).toBeDisabled()
  await picker.getByRole('searchbox', { name: 'Buscar modelo' }).fill('canon')
  await expect(picker.getByRole('button', { name: /^Elegir / })).toHaveCount(1)
  await expect(picker.getByRole('button', { name: 'Elegir Exploradoras para tipo cañón', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(picker).toHaveCount(0)
  await expect(board.getByRole('button', { name: /^Cambiar modelo 1:/ })).toBeFocused()
  await expectNoHorizontalOverflow(page)
  expect(errors).toEqual([])
})

test('comparador: sustituir un modelo actualiza foto, precio y características', async ({ page }) => {
  await page.goto('./exploradoras')
  const board = page.locator('#comparar .comparison')
  await board.getByRole('button', { name: /^Cambiar modelo 1:/ }).click()
  await page.getByRole('dialog', { name: 'Elige tu primer modelo.' }).getByRole('button', { name: 'Elegir Exploradoras de 5 ojos', exact: true }).click()
  const card = board.locator('[data-comparison-product="exploradoras-5-ojos"]')
  await expect(card.locator('.price')).toContainText('85.00')
  await expect(card.locator('img')).toBeVisible()
  await expect.poll(() => card.locator('img').evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await expect(board.locator('[data-comparison-product="neblineros-led-proyector"]')).toHaveCount(0)
  await expect(board.locator('thead th').nth(1)).toContainText('Exploradoras de 5 ojos')
  const format = board.getByRole('row').filter({ has: page.getByRole('rowheader', { name: /Formato/ }) })
  await expect(format.locator('td').first()).toHaveText('5 ojos')
  await expect(board.locator('.comparison__price-gap').first()).toContainText('20.00')
  await expect(board.getByRole('rowheader', { name: /Voltaje declarado/ })).toHaveCount(0)
  await board.getByRole('checkbox', { name: 'Solo diferencias' }).uncheck()
  await expect(board.getByRole('rowheader', { name: /Voltaje declarado/ })).toHaveCount(1)
})

test('comparador: nombres y precios permanecen visibles al recorrer las filas', async ({ page }) => {
  await page.goto('./exploradoras')
  const board = page.locator('#comparar .comparison')
  await page.evaluate(() => {
    const body = document.querySelector('#comparar .comparison tbody')!
    scrollTo(0, body.getBoundingClientRect().top + scrollY + 100)
  })
  const head = board.locator('thead')
  await expect.poll(() => head.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(68)
  await expect(head.locator('.price').first()).toBeInViewport()
  await expect(head.locator('th').nth(1)).toContainText('Neblineros LED tipo proyector')
})

test('comparador: quitar y añadir conserva un mínimo de dos y evita duplicados', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 640, 'el celular muestra dos modelos y se cambian desde su selector')
  await page.goto('./exploradoras')
  const board = page.locator('#comparar .comparison')
  await board.getByRole('button', { name: 'Quitar Exploradoras para tipo cañón de la comparación', exact: true }).click()
  await expect(board.locator('[data-comparison-product]')).toHaveCount(2)
  await expect(board.getByRole('button', { name: /^Quitar / })).toHaveCount(0)
  await board.getByRole('button', { name: 'Añadir modelo', exact: true }).click()
  const picker = page.getByRole('dialog', { name: 'Elige tu tercer modelo.' })
  await expect(picker.getByRole('button', { name: 'Elegir Exploradoras de 3 ojos', exact: true })).toBeDisabled()
  await picker.getByRole('button', { name: 'Elegir Exploradoras de 5 ojos', exact: true }).click()
  await expect(board.locator('[data-comparison-product]')).toHaveCount(3)
  await expect(board.getByRole('button', { name: 'Añadir modelo', exact: true })).toHaveCount(0)
})

test('comparador: pasar de escritorio a celular conserva las elecciones y permite recuperar la tercera', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'comprobación del cambio de tamaño en una sola sesión')
  await page.goto('./exploradoras')
  const board = page.locator('#comparar .comparison')
  await expect(board.locator('[data-comparison-product]')).toHaveCount(3)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(board.locator('[data-comparison-product]')).toHaveCount(2)
  await board.getByRole('button', { name: /^Cambiar modelo 1:/ }).click()
  await page.getByRole('dialog', { name: 'Elige tu primer modelo.' }).getByRole('button', { name: 'Elegir Exploradoras para tipo cañón', exact: true }).click()
  await expect(board.locator('[data-comparison-product]').first()).toHaveAttribute('data-comparison-product', 'exploradoras-canon-10000')
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(board.locator('[data-comparison-product]')).toHaveCount(3)
  expect(await board.locator('[data-comparison-product]').evaluateAll((elements) => elements.map((el) => el.getAttribute('data-comparison-product')))).toEqual(['exploradoras-canon-10000', 'exploradoras-3-ojos', 'neblineros-led-proyector'])
})
