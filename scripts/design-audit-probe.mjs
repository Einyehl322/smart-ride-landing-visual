/**
 * Sonda interactiva de la referencia: estados que una captura estática no
 * muestra (hero sin el popup de newsletter, hover de tarjetas, cabecera al
 * desplazarse, menú móvil). Salida en artifacts/design-audit/before/probe/.
 */
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const OUT = 'artifacts/design-audit/before/probe'
const BASE = 'https://vexora-nextjs.vercel.app'

async function dismissPopup(page) {
  await page.waitForTimeout(1500)
  await page.keyboard.press('Escape')
  const close = page.locator('button[aria-label*="lose" i], .modal button:has(svg), [class*="close" i]').first()
  if (await close.isVisible().catch(() => false)) await close.click().catch(() => {})
  await page.waitForTimeout(500)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
const notes = {}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await dismissPopup(page)
  await page.screenshot({ path: `${OUT}/home-hero.png` })

  // Cabecera tras desplazarse.
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/home-header-scrolled.png`, clip: { x: 0, y: 0, width: 1440, height: 220 } })
  notes.headerScrolled = await page.evaluate(() => {
    const h = document.querySelector('header')
    const cs = getComputedStyle(h)
    return { position: cs.position, top: cs.top, bg: cs.backgroundColor, shadow: cs.boxShadow, h: h.getBoundingClientRect().height, y: h.getBoundingClientRect().top }
  })

  // Hover sobre la primera tarjeta de producto "New in".
  const card = page.locator('text=New in').locator('xpath=ancestor::section[1]').locator('a:has(img)').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  const box = await card.boundingBox()
  if (box) {
    const clip = { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 20), width: Math.min(1400, box.width * 4 + 120), height: box.height + 140 }
    await page.screenshot({ path: `${OUT}/card-rest.png`, clip })
    await card.hover()
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/card-hover.png`, clip })
    notes.cardHover = await card.evaluate((el) => {
      const img = el.querySelector('img')
      const cs = getComputedStyle(el)
      return { transform: getComputedStyle(img).transform, transition: getComputedStyle(img).transition, cardBg: cs.backgroundColor, radius: cs.borderRadius }
    })
  }

  // Ritmo de secciones: distancia vertical entre bloques principales.
  notes.rhythm = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll('section, footer')].map((s) => {
      const r = s.getBoundingClientRect()
      const cs = getComputedStyle(s)
      return { tag: s.tagName, cls: s.className.toString().slice(0, 50), top: Math.round(r.top + scrollY), h: Math.round(r.height), pt: cs.paddingTop, pb: cs.paddingBottom, mt: cs.marginTop, bg: cs.backgroundColor }
    })
    const container = [...document.querySelectorAll('div')].find((d) => {
      const cs = getComputedStyle(d)
      return cs.maxWidth !== 'none' && parseFloat(cs.maxWidth) > 1000 && cs.marginLeft === cs.marginRight
    })
    return { blocks, container: container ? { max: getComputedStyle(container).maxWidth, padX: getComputedStyle(container).paddingLeft, w: container.getBoundingClientRect().width } : null }
  })
  notes.fonts = await page.evaluate(() => [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button')].map((e) => getComputedStyle(e).fontFamily.split(',')[0]))])
  await page.close()
}

{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await dismissPopup(page)
  await page.screenshot({ path: `${OUT}/mobile-hero.png` })
  const burger = page.locator('header button').filter({ has: page.locator('svg') }).first()
  if (await burger.isVisible().catch(() => false)) {
    await burger.click().catch(() => {})
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/mobile-menu.png` })
  }
  await page.close()
}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE + '/product-details', { waitUntil: 'networkidle' })
  await dismissPopup(page)
  await page.screenshot({ path: `${OUT}/product-fold.png` })
  await page.goto(BASE + '/compare', { waitUntil: 'networkidle' })
  await dismissPopup(page)
  await page.screenshot({ path: `${OUT}/compare-fold.png` })
  await page.close()
}

await writeFile(`${OUT}/notes.json`, JSON.stringify(notes, null, 2))
await browser.close()
console.log('probe ok')
