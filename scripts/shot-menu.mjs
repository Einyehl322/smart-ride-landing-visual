/** Captura del menú móvil abierto (390×844). */
import { chromium } from '@playwright/test'

const BASE = process.env.LOCAL_URL ?? 'http://localhost:5174/alonso-landing'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.getByRole('button', { name: 'Abrir menú' }).click()
await page.waitForTimeout(1000)
await page.screenshot({ path: 'artifacts/design-audit/iter/menu-mobile.png' })
await browser.close()
