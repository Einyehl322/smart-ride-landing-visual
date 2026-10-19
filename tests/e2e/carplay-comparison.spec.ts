import { expect, test, type Page } from '@playwright/test'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

async function homeComparison(page: Page) {
  await page.goto('./')
  const section = page.locator('#comparar-home')
  await section.getByRole('button', { name: 'Pantallas CarPlay', exact: true }).click()
  return section.locator('.fcompare')
}

async function savedComparison(page: Page, slugs: string[]) {
  await page.goto(`./?seleccion=${slugs.join(',')}`)
  const dialog = page.getByRole('dialog', { name: 'Mi selección', exact: true })
  for (const checkbox of await dialog.getByRole('checkbox').all()) await checkbox.check()
  await dialog.getByRole('button', { name: `Comparar (${slugs.length}/3)`, exact: true }).click()
  return page.getByRole('dialog', { name: 'Compara tu selección' }).locator('.fcompare')
}

test('CarPlay: diferencias primero y funciones compartidas agrupadas', async ({ page }) => {
  const compare = await homeComparison(page)
  await expect(compare.getByRole('checkbox', { name: 'Solo diferencias' })).toBeChecked()
  const common = compare.getByLabel('Características compartidas')
  await expect(common).toContainText('Apple CarPlay inalámbrico')
  await expect(common).toContainText('Android Auto inalámbrico')
  await expect(common).toContainText('IP67')
  const body = compare.locator('tbody')
  await expect(body.getByRole('rowheader', { name: /Apple CarPlay/ })).toHaveCount(0)
  await expect(body.getByRole('rowheader', { name: /^Cámaras/ })).toBeVisible()
  await expect(body.getByRole('rowheader', { name: /^Velocímetro con GPS/ })).toBeVisible()
  const before = await body.locator('tr').count()
  await compare.getByRole('checkbox', { name: 'Solo diferencias' }).uncheck()
  expect(await body.locator('tr').count()).toBeGreaterThan(before)
  await expect(body.getByRole('rowheader', { name: 'Apple CarPlay inalámbrico', exact: true })).toBeVisible()
  await compare.getByRole('checkbox', { name: 'Solo diferencias' }).check()
  await expect(body.locator('tr')).toHaveCount(before)
})

test('CarPlay: 7 pulgadas, Dual BT y Magnético explican equipamiento y diferencia de precio', async ({ page }) => {
  const compare = await homeComparison(page)
  const chips = page.locator('.cmph__chips')
  await chips.getByRole('button', { name: 'CarPlay 6.25" FreedConn', exact: true }).click()
  await chips.getByRole('button', { name: 'CarPlay 6.25" Magnético', exact: true }).click()
  await expect(compare.locator('thead')).toContainText('7" + control remoto')
  await expect(compare.locator('thead')).toContainText('5" + Dual Bluetooth')
  await expect(compare.locator('thead')).toContainText('Base magnética + Single Bluetooth')
  await expect(compare.locator('thead')).toContainText('170.10')
  await expect(compare.locator('thead')).toContainText('90.10')
  await expect(compare.locator('thead')).toContainText('Menor precio de esta selección')
  const remote = compare.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: /^Control remoto/ }) })
  await expect(remote).toContainText('Mando externo')
  await expect(remote.locator('.fcompare__none')).toHaveCount(2)
  const magnetic = compare.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: /^Base magnética/ }) })
  await expect(magnetic).toContainText('Sí, desmontable')
  await expect(magnetic.locator('.fcompare__none')).toHaveCount(2)
  await expect(magnetic.locator('.fcompare__none').first()).toHaveText('Por confirmar')
})

test('CarPlay: dos pantallas de 5 pulgadas al mismo precio se distinguen por Single y Dual Bluetooth', async ({ page }) => {
  const compare = await savedComparison(page, ['carplay-5-dual-bt', 'carplay-5-navegacion'])
  await expect(compare.locator('tbody tr')).toHaveCount(1)
  await expect(compare.locator('tbody')).toContainText('Single Bluetooth + WiFi')
  await expect(compare.locator('tbody')).toContainText('Dual Bluetooth + WiFi')
  await expect(compare.locator('.fcompare__price-gap')).toHaveText(['Mismo precio', 'Mismo precio'])
  await expect(compare.getByLabel('Características compartidas')).toContainText('Sensores de llanta: Opcional')
  const href = await compare.getByRole('link', { name: 'Consultar fichas técnicas' }).getAttribute('href')
  const message = new URL(href!).searchParams.get('text')!
  expect(message).toContain('CarPlay 5" Dual BT')
  expect(message).toContain('CarPlay 5" Navegación')
  expect(message).toContain('resolución y brillo')
})

test('CarPlay: Waterproof comparte IP67 con el otro 7 y se diferencia por base y mando', async ({ page }) => {
  const compare = await savedComparison(page, ['carplay-7', 'carplay-7-waterproof'])
  await expect(compare.getByLabel('Características compartidas')).toContainText('Resistencia al agua: IP67')
  await expect(compare.locator('tbody tr')).toHaveCount(2)
  await expect(compare.locator('tbody').getByRole('rowheader', { name: /^Base magnética/ })).toBeVisible()
  await expect(compare.locator('tbody').getByRole('rowheader', { name: /^Control remoto/ })).toBeVisible()
  await expect(compare.locator('thead')).toContainText('20.00')
})

test('CarPlay: cámaras, GPS y contenido TPMS mantienen las distinciones del catálogo', async ({ page }) => {
  const compare = await savedComparison(page, ['carplay-625-freedconn', 'carplay-5-camaras-2k'])
  await expect(compare.locator('thead')).toContainText('Cámaras + velocidad GPS')
  await expect(compare.locator('thead')).toContainText('Cámaras + TPMS')
  const tpms = compare.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: /^Sensores de llanta/ }) })
  await expect(tpms).toContainText('TPMS anunciado')
  await expect(tpms).toContainText('Confirmar sensores del kit')
  await expect(tpms.locator('.fcompare__none')).toHaveText('Por confirmar')
})

test('CarPlay: las tarjetas de 5 pulgadas también muestran su diferencia de conectividad', async ({ page }) => {
  await page.goto('./carplay')
  const single = page.getByTestId('product-tile').filter({ has: page.locator('[href$="/carplay-5-navegacion"]') })
  const dual = page.getByTestId('product-tile').filter({ has: page.locator('[href$="/carplay-5-dual-bt"]') })
  await expect(single.locator('.ptile__facts')).toContainText('Single Bluetooth')
  await expect(dual.locator('.ptile__facts')).toContainText('Dual Bluetooth')
})

test('CarPlay: comparación desplazable sin desbordar la página', async ({ page }) => {
  const compare = await homeComparison(page)
  await compare.scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  const scroller = compare.locator('.fcompare__scroller')
  await scroller.focus()
  await page.keyboard.press('ArrowRight')
  await expect(compare.getByRole('checkbox', { name: 'Solo diferencias' })).toBeVisible()
  await compare.screenshot({ path: test.info().outputPath('carplay-diferencias.png') })
})
