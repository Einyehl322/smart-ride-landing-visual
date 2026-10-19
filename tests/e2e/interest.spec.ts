import { expect, test, type Page } from '@playwright/test'
import { ROUTES, trackErrors } from './helpers'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

const STORAGE = 'smartride-interest-list'
const saved = ['y13-pro', 's7-pro', 'q58-max', 'p30-pro', 'carplay-625-freedconn', 'v12-earphone']

async function seed(page: Page, slugs: unknown = saved) {
  await page.addInitScript(({ key, value }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value))
  }, { key: STORAGE, value: slugs })
}

async function openList(page: Page) {
  await page.getByRole('button', { name: /^Ver mi lista de interés/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Mi selección', exact: true })
  await expect(dialog).toBeVisible()
  return dialog
}

test('Mi selección: añadir desde el catálogo, fotos, datos, enlaces y persistencia', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto(ROUTES.intercom)
  const tile = page.getByTestId('product-tile').filter({ has: page.locator('[href$="/y13-pro"]') }).first()
  await tile.scrollIntoViewIfNeeded()
  await tile.getByRole('button', { name: 'Agregar a mi lista de interés' }).click()
  const dialog = await openList(page)
  const card = dialog.locator('.ilist__item')
  await expect(card.getByRole('heading', { name: 'Y13 Pro' })).toBeVisible()
  await expect(card.locator('img')).toBeVisible()
  expect(await card.locator('img').evaluate((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)).toBe(true)
  expect(await card.locator('.ilist__facts li').count()).toBeGreaterThanOrEqual(2)
  await expect(card.locator('.price')).toBeVisible()
  const href = await card.getByRole('link', { name: 'Consultar Y13 Pro por WhatsApp' }).getAttribute('href')
  const message = new URL(href!).searchParams.get('text')!
  expect(message).toContain('Y13 Pro')
  expect(message).toContain('S/ 75.00')
  expect(message).toContain('compatibilidad')
  await expect(dialog.getByRole('button', { name: 'Comparar modelos' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button', { name: /^Ver mi lista de interés/ })).toBeFocused()
  await page.reload()
  await openList(page)
  await page.getByRole('dialog').getByRole('link', { name: 'Y13 Pro', exact: true }).click()
  await expect(page).toHaveURL(/\/intercomunicadores\/y13-pro$/)
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(errors).toEqual([])
})

test('Mi selección: comparar hasta tres modelos del mismo tipo y consultar solo los comparados', async ({ page }) => {
  await seed(page)
  await page.goto(ROUTES.home)
  const dialog = await openList(page)
  await dialog.getByRole('checkbox', { name: 'Comparar Y13 Pro', exact: true }).check()
  await expect(dialog.getByRole('checkbox', { name: 'Comparar CarPlay 6.25" FreedConn', exact: true })).toBeDisabled()
  await expect(dialog.getByRole('checkbox', { name: /Comparar V12/ })).toBeDisabled()
  await dialog.getByRole('checkbox', { name: 'Comparar S7 PRO', exact: true }).check()
  await dialog.getByRole('checkbox', { name: 'Comparar Q58 MAX', exact: true }).check()
  await expect(dialog.getByRole('checkbox', { name: 'Comparar P30 PRO', exact: true })).toBeDisabled()
  await dialog.getByRole('button', { name: 'Comparar (3/3)', exact: true }).click()
  const comparison = page.getByRole('dialog', { name: 'Compara tu selección' })
  await expect(comparison.getByRole('table')).toBeVisible()
  await expect(comparison.locator('thead th[scope="col"]')).toHaveCount(4)
  const href = await comparison.getByRole('link', { name: 'Consultar 3 productos', exact: true }).getAttribute('href')
  const message = new URL(href!).searchParams.get('text')!
  for (const name of ['Y13 Pro', 'S7 PRO', 'Q58 MAX']) expect(message).toContain(name)
  expect(message).not.toContain('CarPlay')
  expect(message).not.toContain('P30 PRO')
  await comparison.getByRole('button', { name: 'Volver a mi selección' }).click()
  await dialog.getByRole('checkbox', { name: 'Comparar Y13 Pro', exact: true }).uncheck()
  await expect(dialog.getByRole('checkbox', { name: 'Comparar P30 PRO', exact: true })).toBeEnabled()
})

test('Mi selección: quitar, deshacer en el mismo orden y confirmar al vaciar', async ({ page }) => {
  await seed(page, ['y13-pro', 's7-pro'])
  await page.goto(ROUTES.home)
  const dialog = await openList(page)
  await dialog.getByRole('button', { name: 'Quitar Y13 Pro de la lista' }).click()
  await expect(dialog.locator('.ilist__item')).toHaveCount(1)
  await dialog.getByRole('button', { name: 'Deshacer' }).click()
  await expect(dialog.locator('.ilist__item').first()).toHaveAttribute('data-slug', 'y13-pro')
  await dialog.getByRole('button', { name: 'Vaciar lista', exact: true }).click()
  await dialog.getByRole('button', { name: 'Conservar selección' }).click()
  await expect(dialog.locator('.ilist__item')).toHaveCount(2)
  await dialog.getByRole('button', { name: 'Vaciar lista', exact: true }).click()
  await dialog.getByRole('button', { name: 'Sí, vaciar' }).click()
  await expect(dialog.getByRole('link', { name: 'Explorar catálogo' })).toBeVisible()
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE)).toEqual([])
})

test('Mi selección: deshacer también funciona al quitar el último producto', async ({ page }) => {
  await seed(page, ['y13-pro'])
  await page.goto(ROUTES.home)
  const dialog = await openList(page)
  await dialog.getByRole('button', { name: 'Quitar Y13 Pro de la lista' }).click()
  await expect(dialog.getByRole('link', { name: 'Explorar catálogo' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Deshacer' }).click()
  await expect(dialog.locator('.ilist__item')).toHaveCount(1)
})

test('Mi selección: compartir importa modelos en otro navegador y conserva los favoritos existentes', async ({ page, context, browser, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await seed(page, ['y13-pro', 's7-pro'])
  await page.goto(ROUTES.home)
  const dialog = await openList(page)
  await dialog.getByRole('button', { name: 'Compartir selección' }).click()
  await expect(dialog.getByRole('status')).toContainText('Enlace copiado')
  const url = await dialog.getByRole('textbox', { name: 'Enlace de tu selección' }).inputValue()
  expect(new URL(url).searchParams.get('seleccion')).toBe('y13-pro,s7-pro')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url)
  const other = await browser.newContext({ baseURL, reducedMotion: 'reduce' })
  try {
    const recipient = await other.newPage()
    await seed(recipient, ['q58-max'])
    await recipient.goto(url)
    const imported = recipient.getByRole('dialog', { name: 'Mi selección', exact: true })
    await expect(imported).toBeVisible()
    await expect(imported.locator('.ilist__item')).toHaveCount(3)
    await expect(imported.locator('.ilist__shared')).toBeVisible()
    expect(new URL(recipient.url()).searchParams.has('seleccion')).toBe(false)
    await imported.getByRole('button', { name: 'Quitar Y13 Pro de la lista' }).click()
    await recipient.reload()
    const reopened = await openList(recipient)
    await expect(reopened.locator('.ilist__item')).toHaveCount(2)
    await expect(reopened.locator('[data-slug="y13-pro"]')).toHaveCount(0)
  } finally {
    await other.close()
  }
})

test('Mi selección: ofrece copiar el enlace manualmente si el portapapeles falla', async ({ page }) => {
  await seed(page, ['y13-pro'])
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Permiso denegado')) }, configurable: true })
  })
  await page.goto(ROUTES.home)
  const dialog = await openList(page)
  await dialog.getByRole('button', { name: 'Compartir selección' }).click()
  await expect(dialog.getByRole('status')).toContainText('Selecciona y copia')
  await expect(dialog.getByRole('textbox', { name: 'Enlace de tu selección' })).toHaveValue(/seleccion=y13-pro/)
})

test('Mi selección: filtra slugs inválidos, duplicados y entradas de almacenamiento ajenas al catálogo', async ({ page }) => {
  const errors = trackErrors(page)
  await seed(page, ['y13-pro', 42, {}, 'no-existe', 'y13-pro'])
  await page.goto('./?seleccion=s7-pro,s7-pro,no-existe')
  const dialog = page.getByRole('dialog', { name: 'Mi selección', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.ilist__item')).toHaveCount(2)
  await expect(dialog.locator('.ilist__item').first()).toHaveAttribute('data-slug', 's7-pro')
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE)).toEqual(['s7-pro', 'y13-pro'])
  expect(errors).toEqual([])
})

test('Mi selección: el diálogo mantiene el foco y las acciones caben en la pantalla', async ({ page }) => {
  await seed(page, ['y13-pro', 'carplay-625-freedconn'])
  await page.goto(ROUTES.home)
  const dialog = await openList(page)
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  }
  const box = await dialog.boundingBox()
  const viewport = page.viewportSize()!
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.width).toBeLessThanOrEqual(viewport.width + 1)
  expect(await dialog.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1)
  await expect(dialog.getByRole('link', { name: 'Consultar 2 productos', exact: true })).toBeInViewport()
  await page.screenshot({ path: test.info().outputPath('mi-seleccion.png') })
})
