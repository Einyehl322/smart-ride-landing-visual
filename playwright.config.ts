import { defineConfig, devices } from '@playwright/test'

/**
 * Validación de SMART RIDE con Playwright.
 *
 *   npm run test:e2e              todas las pruebas, en escritorio, tablet y móvil
 *   npm run test:e2e -- --project=mobile
 *
 * Levanta el servidor de desarrollo (reutiliza uno ya abierto en el puerto).
 * Las capturas de tests/e2e/visual.spec.ts se guardan en test-results/ como
 * material de revisión: no son golden snapshots ni se comparan con nada.
 */
const PORT = Number(process.env.E2E_PORT ?? 5199)
const PREVIEW = process.env.E2E_PREVIEW === '1'
const BASE_PATH = process.env.E2E_BASE_PATH ?? '/alonso-landing/'
const BASE = `http://localhost:${PORT}${BASE_PATH}`

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    },
  ],
  webServer: {
    command: `npx vite ${PREVIEW ? 'preview' : ''} --port ${PORT} --strictPort --base=${BASE_PATH}`,
    url: BASE,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
