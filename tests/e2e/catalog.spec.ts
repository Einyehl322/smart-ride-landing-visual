import { expect, test, type Locator } from '@playwright/test'
import { ROUTES, scrollThrough } from './helpers'

async function prices(tiles: Locator) {
  const texts = await tiles.locator('.price .sr-only').allTextContents()
  return texts.map((t) => Number(t.replace(/[^\d.]/g, '')))
}

test.describe('Catálogo de intercomunicadores', () => {
  test('grilla, filtro por tipo y orden por precio', async ({ page }) => {
    await page.goto(ROUTES.intercom)
    // Las tarjetas se revelan al entrar en pantalla.
    await scrollThrough(page)
    const catalog = page.locator('#catalogo')
    const tiles = catalog.getByTestId('product-tile')
    const total = await tiles.count()
    expect(total).toBeGreaterThan(3)

    // Cada tarjeta muestra nombre, imagen, precio, disponibilidad y acceso a la ficha.
    for (const tile of await tiles.all()) {
      await expect(tile.getByRole('heading')).not.toBeEmpty()
      await expect(tile.locator('img').first()).toHaveAttribute('alt', /.+/)
      await expect(tile.locator('.price')).toBeVisible()
      await expect(tile.locator('.ptile__avail')).toBeVisible()
      await expect(tile.locator('.ptile__explore')).toHaveAttribute('href', /\/intercomunicadores\/[\w-]+$/)
    }

    const filters = catalog.getByRole('group', { name: 'Filtrar por tipo' }).getByRole('button')
    await filters.nth(2).click()
    const audio = await tiles.count()
    expect(audio).toBeGreaterThan(0)
    expect(audio).toBeLessThan(total)
    // Los audífonos no se presentan como intercomunicadores.
    for (const type of await tiles.locator('.ptile__type').allTextContents()) expect(type).not.toMatch(/^Intercomunicador/)

    await filters.first().click()
    await expect(tiles).toHaveCount(total)

    await catalog.locator('select').selectOption('price-asc')
    const asc = await prices(tiles)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    await catalog.locator('select').selectOption('price-desc')
    const desc = await prices(tiles)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  test('comparador sin campos "Pendiente" y con datos reales', async ({ page }) => {
    await page.goto(ROUTES.intercom)
    const compare = page.locator('#comparar')
    await compare.scrollIntoViewIfNeeded()
    await expect(compare.locator('table')).toBeVisible()
    // Ningún valor de la tabla se muestra como "Pendiente".
    for (const cell of await compare.locator('tbody td').allInnerTexts()) expect(cell).not.toMatch(/Pendiente/i)
    // "Consultar" queda solo para datos pendientes de verificar; nunca para celdas vacías.
    const cells = await compare.locator('tbody td').count()
    const consult = await compare.locator('tbody td .pending').count()
    expect(consult).toBeLessThan(cells * 0.1)
    // Precio visible para cada modelo.
    const header = await compare.locator('thead th[scope="col"]').count()
    await expect(compare.locator('tbody tr').first().locator('.price')).toHaveCount(header - 1)
  })
})

test.describe('Showroom CarPlay', () => {
  test('filtrar por pulgadas y comparar modelos en el diálogo', async ({ page }) => {
    await page.goto(ROUTES.carplay)
    const grid = page.locator('.showroom__grid')
    const tiles = grid.getByTestId('product-tile')
    const total = await tiles.count()
    expect(total).toBeGreaterThan(2)

    const sizes = page.getByRole('group', { name: 'Filtrar por tamaño de pantalla' }).getByRole('button')
    await sizes.nth(1).click()
    await expect.poll(() => tiles.count()).toBeLessThan(total)
    await sizes.first().click()
    await expect(tiles).toHaveCount(total)

    const boxes = grid.getByRole('checkbox')
    await boxes.nth(0).check()
    const tray = page.getByRole('region', { name: 'Modelos para comparar' })
    await expect(tray).toBeVisible()
    await expect(tray.getByRole('button', { name: 'Comparar' })).toBeDisabled()
    await boxes.nth(1).check()
    await boxes.nth(2).check()
    // Máximo tres: el resto queda deshabilitado.
    await expect(boxes.nth(3)).toBeDisabled()

    await tray.getByRole('button', { name: 'Comparar' }).click()
    const dialog = page.getByRole('dialog', { name: 'Comparar modelos' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('thead th[scope="col"]')).toHaveCount(4)
    await dialog.getByRole('button', { name: 'Cerrar comparación' }).click()
    await expect(dialog).toBeHidden()

    await tray.getByRole('button', { name: /^Quitar/ }).first().click()
    await expect(boxes.nth(3)).toBeEnabled()
  })

  test('las fotos referenciales se identifican como tales', async ({ page }) => {
    await page.goto(ROUTES.carplay)
    const tiles = page.locator('.showroom__grid').getByTestId('product-tile')
    const withRef = await tiles.filter({ has: page.locator('.ptile__ref') }).count()
    expect(withRef).toBeGreaterThan(0)
  })
})
