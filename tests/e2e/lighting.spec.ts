import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, trackErrors } from './helpers'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

const products = [
  { slug: 'exploradoras-tipo-canon', name: 'Exploradoras tipo cañón', price: '89.90', lumens: '12,000+' },
  { slug: 'exploradoras-3-ojos', name: 'Exploradoras de 3 ojos', price: '65.00', lumens: '8,000+' },
  { slug: 'exploradoras-canon-10000', name: 'Exploradoras para tipo cañón', price: '85.90', lumens: '10,000+' },
  { slug: 'exploradoras-5-ojos', name: 'Exploradoras de 5 ojos', price: '85.00', lumens: '14,000+' },
  { slug: 'exploradoras-4-ojos', name: 'Exploradoras de 4 ojos', price: '75.00', lumens: '11,000+' },
  { slug: 'exploradoras-3-ojos-compactas', name: 'Exploradoras de 3 ojos — Compactas', price: '70.00', lumens: '9,000+' },
  { slug: 'luces-exploradoras-12000', name: 'Luces exploradoras', price: '85.90', lumens: '12,000+' },
  { slug: 'exploradoras-2-ojos', name: 'Exploradoras de 2 ojos ultra potentes', price: '125.00', lumens: '15,000+' },
  { slug: 'exploradoras-para-moto', name: 'Exploradoras para moto', price: '60.00', lumens: '7,500+' },
]

for (const product of products) {
  test(`Exploradoras: ${product.slug} tiene ficha, foto del PDF y beneficios respaldados`, async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto(`./exploradoras/${product.slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(product.name)
    const hero = page.locator('.phero')
    await expect(hero.locator('.price')).toContainText(product.price)
    await expect(hero.locator('.phero__facts')).toContainText(product.lumens)
    await expect(hero.locator('.phero__facts')).toContainText('declarados')
    await expect(hero.locator('.product-choice')).toContainText('Especialmente para')
    const photo = hero.locator('img').first()
    await expect(photo).toBeVisible()
    await expect.poll(() => photo.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(page.locator('#beneficios .benefit')).toHaveCount(3)
    await expect(page.locator('#beneficios .benefit__proof')).toHaveCount(3)
    await page.locator('#beneficios summary').click()
    await expect(page.locator('#beneficios')).toContainText('precio por unidad o par')
    await expect(page.locator('#beneficios a')).toHaveAttribute('href', /\/smart-ride-landing-visual\/catalogo-exploradoras\.pdf$/)
    await expect(page.locator('#especificaciones')).toContainText('12–24 V')
    await expect(page.locator('#especificaciones')).not.toContainText('IP67')
    await expectNoHorizontalOverflow(page)
    expect(errors).toEqual([])
  })
}

test('Exploradoras: sección propia en la landing y pestaña de favoritos', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('./')
  const section = page.locator('#exploradoras')
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(section.getByRole('link', { name: 'Ver los 9 modelos' })).toHaveAttribute('href', /\/exploradoras$/)
  await expect(section).toContainText('S/ 60.00')
  await expect(section.getByTestId('product-tile')).toHaveCount(3)
  await section.screenshot({ path: test.info().outputPath('luces-landing.png') })
  const favorites = page.locator('#favoritos')
  await favorites.getByRole('tab', { name: /Luces exploradoras/ }).click()
  await expect(favorites.getByTestId('product-tile')).toHaveCount(6)
  await expect(favorites.locator('.ptile__promise')).toHaveCount(6)
  await expectNoHorizontalOverflow(page)
  expect(errors).toEqual([])
})

test('Exploradoras: las nueve tarjetas conservan precios, fotos y agotados del PDF; se pueden ordenar', async ({ page }) => {
  await page.goto('./exploradoras')
  const cards = page.getByTestId('product-tile')
  await expect(cards).toHaveCount(9)
  await expect(page.getByRole('group', { name: 'Filtrar por tipo' })).toHaveCount(0)
  for (const product of products) {
    const card = page.locator(`[data-testid="product-tile"][data-slug="${product.slug}"]`)
    await expect(card.locator('.price')).toContainText(product.price)
    await expect(card.locator('.ptile__type')).toHaveText('Luz exploradora')
    await expect(card.locator('.ptile__facts')).toContainText(product.lumens)
    await card.scrollIntoViewIfNeeded()
    await expect.poll(() => card.locator('img').evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  }
  await expect(cards.locator('.ptile__avail').filter({ hasText: 'Agotado en catálogo' })).toHaveCount(2)
  await page.getByRole('combobox', { name: 'Ordenar', exact: true }).selectOption('price-asc')
  await expect(cards.first()).toHaveAttribute('data-slug', 'exploradoras-para-moto')
  await page.getByRole('combobox', { name: 'Ordenar', exact: true }).selectOption('price-desc')
  await expect(cards.first()).toHaveAttribute('data-slug', 'exploradoras-2-ojos')
  await expectNoHorizontalOverflow(page)
})

test('Exploradoras: comparación con diferencias, precios y voltaje compartido', async ({ page }) => {
  await page.goto('./')
  const section = page.locator('#comparar-home')
  await section.getByRole('button', { name: 'Luces exploradoras', exact: true }).click()
  const comparison = section.locator('.compare__wrap--lighting')
  await expect(comparison.locator('thead th')).toHaveCount(4)
  await expect(comparison.getByLabel('Características compartidas')).toContainText('12–24 V')
  await expect(comparison.locator('thead')).toContainText('20.00')
  await expect(comparison.locator('thead')).toContainText('60.00')
  await expect(comparison.getByRole('checkbox', { name: 'Solo diferencias' })).toBeChecked()
  await expect(comparison.getByRole('rowheader', { name: /Voltaje declarado/ })).toHaveCount(0)
  await comparison.getByRole('checkbox', { name: 'Solo diferencias' }).uncheck()
  await expect(comparison.getByRole('rowheader', { name: /Voltaje declarado/ })).toHaveCount(1)
  const scroller = comparison.locator('.compare__scroller')
  await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth })
  if ((page.viewportSize()?.width ?? 0) < 1100) expect(await scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  await expectNoHorizontalOverflow(page)
  await comparison.screenshot({ path: test.info().outputPath('luces-comparacion.png') })
})

test('Exploradoras: cuarto modo sin inventar y referencias agotadas con reposición', async ({ page }) => {
  for (const slug of ['exploradoras-4-ojos', 'exploradoras-5-ojos']) {
    await page.goto(`./exploradoras/${slug}`)
    await expect(page.locator('.phero .product-choice__check')).toContainText('solo se nombran 3')
    await expect(page.locator('#especificaciones')).toContainText('cuarto modo por confirmar')
    expect((await page.locator('.phero, #especificaciones').allInnerTexts()).join(' ')).not.toContain('parpadeante')
  }
  for (const slug of ['exploradoras-tipo-canon', 'luces-exploradoras-12000']) {
    await page.goto(`./exploradoras/${slug}`)
    const hero = page.locator('.phero')
    await expect(hero.locator('.phero__avail')).toHaveText('Agotado en catálogo')
    const link = hero.getByRole('link', { name: 'Consultar reposición', exact: true })
    const message = new URL((await link.getAttribute('href'))!).searchParams.get('text')!
    expect(message).toContain('reposición')
  }
})

test('Exploradoras: lista de interés, comparación y consulta de modelos del mismo tipo', async ({ page }) => {
  await page.goto('./?seleccion=exploradoras-3-ojos,exploradoras-5-ojos,carplay-625-freedconn')
  const dialog = page.getByRole('dialog', { name: 'Mi selección', exact: true })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('checkbox', { name: 'Comparar Exploradoras de 3 ojos', exact: true }).check()
  await expect(dialog.getByRole('checkbox', { name: 'Comparar CarPlay 6.25" FreedConn', exact: true })).toBeDisabled()
  await dialog.getByRole('checkbox', { name: 'Comparar Exploradoras de 5 ojos', exact: true }).check()
  await dialog.getByRole('button', { name: 'Comparar (2/3)' }).click()
  const comparison = page.getByRole('dialog', { name: 'Compara tu selección', exact: true })
  await expect(comparison.locator('.compare__wrap--lighting')).toBeVisible()
  const href = await comparison.getByRole('link', { name: 'Consultar 2 productos', exact: true }).getAttribute('href')
  const message = new URL(href!).searchParams.get('text')!
  expect(message).toContain('Exploradoras de 3 ojos')
  expect(message).toContain('Exploradoras de 5 ojos')
  expect(message).not.toContain('CarPlay')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /^Ver mi lista de interés/ }).click()
  await dialog.getByRole('button', { name: 'Compartir selección' }).click()
  await expect(dialog.getByRole('textbox', { name: 'Enlace de tu selección' })).toHaveValue(/seleccion=exploradoras-3-ojos/)
})

test('Exploradoras: acceso desde menú y catálogo PDF descargable', async ({ page, request }) => {
  await page.goto('./')
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await page.getByRole('navigation', { name: 'Principal', exact: true }).getByRole('link', { name: 'Exploradoras', exact: true }).click()
  } else {
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.locator('#mobile-menu').getByRole('link', { name: /^Exploradoras\s*9$/ }).click()
    await expect(page.locator('#mobile-menu')).toBeHidden()
  }
  await expect(page).toHaveURL(/\/exploradoras$/)
  await expect(page.getByTestId('product-tile')).toHaveCount(9)
  const pdf = await request.get('./catalogo-exploradoras.pdf')
  expect(pdf.status()).toBe(200)
  expect(pdf.headers()['content-type']).toContain('application/pdf')
  expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF')
})

test('Exploradoras: cabecera sin desbordes en escritorio pequeño y sección visible con movimiento', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'comprobación adicional de puntos de quiebre de escritorio')
  for (const width of [1024, 1100, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await expectNoHorizontalOverflow(page)
    const header = await page.locator('.site-header__bar').boundingBox()
    const cta = await page.locator('.site-header__cta').boundingBox()
    expect(cta!.x + cta!.width).toBeLessThanOrEqual(header!.x + header!.width + 1)
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('#exploradoras').scrollIntoViewIfNeeded()
  await expect(page.locator('#exploradoras h2')).toBeVisible()
  await expect(page.locator('#exploradoras .lighting-home__feature img')).toBeVisible()
})
