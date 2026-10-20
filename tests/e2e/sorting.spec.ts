import { expect, test, type Locator } from '@playwright/test'
import { expectNoHorizontalOverflow, trackErrors } from './helpers'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

async function expectPriceOrder(cards: Locator, ascending: boolean) {
  const values = (await cards.locator('.price .sr-only').allTextContents()).map((text) => Number(text.replace(/[^\d.]/g, '')))
  expect(values.length).toBeGreaterThan(1)
  expect(values.every((value) => Number.isFinite(value) && value > 0)).toBe(true)
  expect(values).toEqual([...values].sort((a, b) => ascending ? a - b : b - a))
}

for (const category of [
  { path: 'intercomunicadores', count: 9, originalFirst: 'y13-pro' },
  { path: 'carplay', count: 7, originalFirst: 'carplay-625-freedconn' },
  { path: 'accesorios', count: 2, originalFirst: 'tpms-kit-solar' },
  { path: 'exploradoras', count: 9, originalFirst: 'neblineros-led-proyector' },
]) {
  test(`Orden: ${category.path} empieza de menor a mayor y permite cambiar libremente`, async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto(`./${category.path}`)
    const select = page.getByRole('combobox', { name: 'Ordenar', exact: true })
    const cards = page.getByTestId('product-tile')
    await expect(cards).toHaveCount(category.count)
    await expect(select).toHaveValue('price-asc')
    await expectPriceOrder(cards, true)
    const initial = await cards.evaluateAll((items) => items.map((item) => item.getAttribute('data-slug')).sort())

    await select.selectOption('price-desc')
    await expect(select).toHaveValue('price-desc')
    await expectPriceOrder(cards, false)
    await select.selectOption('featured')
    await expect(cards.first()).toHaveAttribute('data-slug', category.originalFirst)
    await select.selectOption('price-asc')
    await expectPriceOrder(cards, true)
    expect(await cards.evaluateAll((items) => items.map((item) => item.getAttribute('data-slug')).sort())).toEqual(initial)
    await expectNoHorizontalOverflow(page)
    expect(errors).toEqual([])
  })
}

test('Orden: Favoritos permite ordenar y conserva la elección al cambiar de categoría', async ({ page }) => {
  await page.goto('./')
  const favorites = page.locator('#favoritos')
  const select = favorites.getByRole('combobox', { name: 'Ordenar favoritos', exact: true })
  const cards = favorites.getByTestId('product-tile')
  await expect(select).toHaveValue('price-asc')
  await expectPriceOrder(cards, true)
  await select.selectOption('price-desc')
  for (const name of ['Pantallas CarPlay', 'Sensores TPMS', 'Luces exploradoras', 'Intercomunicadores']) {
    await favorites.getByRole('tab', { name: new RegExp(name) }).click()
    await expect(select).toHaveValue('price-desc')
    await expectPriceOrder(cards, false)
  }
  await select.selectOption('price-asc')
  await expectPriceOrder(cards, true)
  await favorites.screenshot({ path: test.info().outputPath('favoritos-ordenables.png') })
  await expectNoHorizontalOverflow(page)
})

test('Orden: los filtros respetan el orden elegido y no eliminan modelos al restaurarlos', async ({ page }) => {
  await page.goto('./intercomunicadores')
  const select = page.getByRole('combobox', { name: 'Ordenar', exact: true })
  const cards = page.getByTestId('product-tile')
  await select.selectOption('price-desc')
  const filters = page.getByRole('group', { name: 'Filtrar por tipo' })
  await filters.getByRole('button', { name: 'Audífonos para casco', exact: true }).click()
  await expect(cards).toHaveCount(2)
  await expect(select).toHaveValue('price-desc')
  await expectPriceOrder(cards, false)
  await filters.getByRole('button', { name: 'Todos', exact: true }).click()
  await expect(cards).toHaveCount(9)
  await expectPriceOrder(cards, false)

  await page.goto('./carplay')
  await expect(select).toHaveValue('price-asc')
  const sizes = page.getByRole('group', { name: 'Filtrar por tamaño de pantalla' })
  await select.selectOption('price-desc')
  await sizes.getByRole('button', { name: '5"', exact: true }).click()
  await expect(cards).toHaveCount(3)
  await expectPriceOrder(cards, false)
  await sizes.getByRole('button', { name: 'Todos', exact: true }).click()
  await expect(cards).toHaveCount(7)
  await expect(select).toHaveValue('price-desc')
  await expectPriceOrder(cards, false)
})
