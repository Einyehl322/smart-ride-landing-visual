import { expect, test } from '@playwright/test'
import { trackErrors } from './helpers'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

const intercom = ['y13-pro', 'freedconn-hero', 's7-pro', 's7', 'q58-max', 'p30-pro', 'v12-earphone', 'ejeas-q8', 'ejeas-v6-pro-plus']
const carplay = ['carplay-625-freedconn', 'carplay-625-magnetico', 'carplay-7-waterproof', 'carplay-5-camaras-2k', 'carplay-5-dual-bt', 'carplay-5-navegacion']
const accessories = ['tpms-kit-solar', 'tpms-compacto']
const routes = [
  ...intercom.map((slug) => `intercomunicadores/${slug}`),
  ...carplay.map((slug) => `carplay/${slug}`),
  ...accessories.map((slug) => `accesorios/${slug}`),
]

for (const route of routes) {
  test(`Beneficios: ${route} presenta público, razones y respaldo sin desbordes`, async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto(`./${route}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const hero = page.locator('.phero, .spot')
    await expect(hero.locator('[data-product-choice]')).toContainText('Especialmente para')
    expect((await hero.locator('.product-choice p').innerText()).length).toBeGreaterThan(35)
    const benefits = page.locator('#beneficios')
    await benefits.scrollIntoViewIfNeeded()
    await expect(benefits.locator('.benefit')).toHaveCount(3)
    for (const item of await benefits.locator('.benefit').all()) {
      await expect(item.locator('h3')).not.toBeEmpty()
      expect((await item.locator('.benefit__body').innerText()).length).toBeGreaterThan(30)
      await expect(item.locator('.benefit__proof')).not.toBeEmpty()
    }
    await benefits.getByText('Datos y condiciones para elegir', { exact: true }).click()
    await expect(benefits.locator('.product-evidence')).toHaveAttribute('open', '')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
    const contact = hero.locator('a[href*="wa.me/"]').first()
    await expect(contact).toHaveAttribute('href', /text=/)
    expect(errors).toEqual([])
    if (route === 'intercomunicadores/y13-pro' || route === 'carplay/carplay-625-magnetico') {
      await benefits.screenshot({ path: test.info().outputPath('beneficios.png') })
    }
  })
}

for (const [category, count] of [['intercomunicadores', 9], ['carplay', 6], ['accesorios', 2]] as const) {
  test(`Beneficios: todas las tarjetas de ${category} tienen una propuesta de uso`, async ({ page }) => {
    await page.goto(`./${category}`)
    const cards = page.getByTestId('product-tile')
    await expect(cards).toHaveCount(count)
    await expect(cards.locator('.ptile__promise')).toHaveCount(count)
    const promises = await cards.locator('.ptile__promise').allTextContents()
    expect(new Set(promises).size).toBe(count)
  })
}

test('Beneficios: Q8 distingue reconexión y audio Mesh con fuente oficial', async ({ page }) => {
  await page.goto('./intercomunicadores/ejeas-q8')
  const benefits = page.locator('#beneficios')
  await expect(benefits).toContainText('Al regresar al alcance válido')
  await expect(benefits).toContainText('En modo Mesh, dos Q8')
  await benefits.getByText('Datos y condiciones para elegir', { exact: true }).click()
  await expect(benefits.getByRole('link', { name: 'Ficha oficial EJEAS Q8' })).toHaveAttribute('href', 'https://www.ejeas.com/products/q8')
  await expect(page.locator('#especificaciones')).toContainText('Automática al recuperar alcance')
  expect(await page.locator('main').innerText()).not.toMatch(/sin desconexiones|nunca se desconecta/i)
})

test('Beneficios: V6 diferencia seis vinculados de dos en conversación y señala discrepancias', async ({ page }) => {
  await page.goto('./intercomunicadores/ejeas-v6-pro-plus')
  await expect(page.locator('.phero')).toContainText('solo 2 conversan a la vez')
  await expect(page.locator('#beneficios')).toContainText('Hasta 6 vinculados; conversación simultánea de 2')
  expect(await page.locator('#especificaciones .specs__verification').count()).toBeGreaterThan(1)
})

test('Beneficios: V12 y S7 se venden como audio individual y no como comunicación grupal', async ({ page }) => {
  for (const slug of ['v12-earphone', 's7']) {
    await page.goto(`./intercomunicadores/${slug}`)
    await expect(page.locator('.phero__meta')).toContainText('Audífonos Bluetooth para casco')
    await expect(page.locator('.phero__facts')).toContainText('Audio individual')
  }
  await page.goto('./intercomunicadores/v12-earphone')
  const copy = await page.locator('.phero, #resumen, #beneficios').allInnerTexts()
  expect(copy.join(' ')).not.toMatch(/40\s?mm|graves profundos|aumenta tu visibilidad|sin distracciones|controles con guantes|hasta 12 h/i)
  await expect(page.locator('#especificaciones')).not.toContainText('IP55')
  await expect(page.locator('.phero .product-choice__check')).toContainText('Autonomía y resistencia por confirmar')
})

test('Beneficios: los TPMS no inventan una prestación superior por tener mayor precio', async ({ page }) => {
  await page.goto('./?seleccion=tpms-kit-solar,tpms-compacto')
  const dialog = page.getByRole('dialog', { name: 'Mi selección', exact: true })
  for (const box of await dialog.getByRole('checkbox').all()) await box.check()
  await dialog.getByRole('button', { name: 'Comparar (2/3)', exact: true }).click()
  const compare = page.getByRole('dialog', { name: 'Compara tu selección' }).locator('.fcompare')
  await expect(compare.getByLabel('Características compartidas')).toContainText('Presión y temperatura')
  await expect(compare.locator('.fcompare__matching')).toContainText('Las funciones publicadas coinciden')
  await expect(compare.locator('thead')).toContainText('140.00')
  await expect(compare.locator('thead')).toContainText('Menor precio de esta selección')
  await page.keyboard.press('Escape')
  await page.goto('./accesorios/tpms-kit-solar')
  await expect(page.locator('.spot .product-choice__check')).toContainText('Carga solar por confirmar')
})
