/**
 * Auditoría visual con Playwright.
 *
 *   node scripts/design-audit.mjs [etiqueta] [--only=vexora|smartride|local]
 *
 * Captura páginas completas y la primera pantalla en cuatro resoluciones y
 * extrae métricas de layout (cabecera, anchuras, espaciado, tipografía,
 * colores) en artifacts/design-audit/<etiqueta>/. Las capturas son material
 * de trabajo: no se usan como recursos de la landing ni como golden snapshots.
 */
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const label = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) ?? 'before'
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7)
const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:5174/alonso-landing'
const OUT = path.resolve('artifacts/design-audit', label)

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
}

const TARGETS = {
  vexora: [
    { name: 'home', url: 'https://vexora-nextjs.vercel.app/' },
    { name: 'shop', url: 'https://vexora-nextjs.vercel.app/shop' },
    { name: 'product', url: 'https://vexora-nextjs.vercel.app/product-details' },
    { name: 'category', url: 'https://vexora-nextjs.vercel.app/products/headphones' },
    { name: 'compare', url: 'https://vexora-nextjs.vercel.app/compare' },
  ],
  smartride: [{ name: 'home', url: 'https://einyehl322.github.io/alonso-landing/' }],
  local: [
    { name: 'home', url: `${LOCAL}/` },
    { name: 'intercomunicadores', url: `${LOCAL}/intercomunicadores` },
    { name: 'carplay', url: `${LOCAL}/carplay` },
    { name: 'accesorios', url: `${LOCAL}/accesorios` },
    { name: 'p-freedconn-hero', url: `${LOCAL}/intercomunicadores/freedconn-hero` },
    { name: 'p-ejeas-q8', url: `${LOCAL}/intercomunicadores/ejeas-q8` },
    { name: 'p-carplay-625-freedconn', url: `${LOCAL}/carplay/carplay-625-freedconn` },
    { name: 'p-tpms-kit-solar', url: `${LOCAL}/accesorios/tpms-kit-solar` },
  ],
}

/** Recorre la página para disparar lazy-loading y ScrollTriggers antes de capturar. */
async function settle(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 400))
  })
}

/** Métricas estructurales: lo que hace legible una arquitectura comercial. */
function metrics() {
  const px = (v) => Math.round(parseFloat(v) || 0)
  const style = (el) => getComputedStyle(el)
  const header = document.querySelector('header')
  const hs = header && style(header)
  const sections = [...document.querySelectorAll('main section, main > div > section, body > div section')]
    .filter((s) => s.getBoundingClientRect().height > 120)
    .slice(0, 30)
    .map((s) => {
      const r = s.getBoundingClientRect()
      const cs = style(s)
      const inner = s.querySelector(':scope > div')
      return {
        id: s.id || s.className.toString().slice(0, 60),
        top: Math.round(r.top + scrollY),
        height: Math.round(r.height),
        padY: `${px(cs.paddingTop)}/${px(cs.paddingBottom)}`,
        bg: cs.backgroundColor,
        innerMax: inner ? style(inner).maxWidth : null,
        innerWidth: inner ? Math.round(inner.getBoundingClientRect().width) : null,
        heading: s.querySelector('h1,h2')?.textContent?.trim().slice(0, 70) ?? null,
      }
    })
  const type = ['h1', 'h2', 'h3', 'p', 'a', 'button'].map((tag) => {
    const el = document.querySelector(`main ${tag}, body ${tag}`)
    if (!el) return { tag }
    const cs = style(el)
    return {
      tag,
      family: cs.fontFamily.split(',')[0],
      size: cs.fontSize,
      weight: cs.fontWeight,
      lh: cs.lineHeight,
      tracking: cs.letterSpacing,
      color: cs.color,
    }
  })
  const cards = [...document.querySelectorAll('a[href*="product"], article, [class*="card" i]')]
    .filter((c) => {
      const r = c.getBoundingClientRect()
      return r.width > 150 && r.width < 700 && r.height > 150
    })
    .slice(0, 6)
    .map((c) => {
      const cs = style(c)
      const r = c.getBoundingClientRect()
      const img = c.querySelector('img')
      return {
        cls: c.className.toString().slice(0, 80),
        w: Math.round(r.width),
        h: Math.round(r.height),
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
        border: cs.border,
        shadow: cs.boxShadow.slice(0, 60),
        img: img ? `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}` : null,
      }
    })
  const buttons = [...document.querySelectorAll('a,button')]
    .filter((b) => {
      const cs = style(b)
      return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && b.getBoundingClientRect().height >= 32
    })
    .slice(0, 6)
    .map((b) => {
      const cs = style(b)
      return { text: b.textContent.trim().slice(0, 30), bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, h: Math.round(b.getBoundingClientRect().height), pad: cs.padding, size: cs.fontSize }
    })
  const overflowX = document.documentElement.scrollWidth - innerWidth
  return {
    title: document.title,
    scrollHeight: document.documentElement.scrollHeight,
    overflowX,
    bodyBg: style(document.body).backgroundColor,
    header: header
      ? {
          height: Math.round(header.getBoundingClientRect().height),
          position: hs.position,
          bg: hs.backgroundColor,
          backdrop: hs.backdropFilter,
          links: [...header.querySelectorAll('a,button')].map((a) => a.textContent.trim()).filter(Boolean).slice(0, 16),
        }
      : null,
    sections,
    type,
    cards,
    buttons,
    links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))].slice(0, 60),
  }
}

async function run() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const report = {}
  const groups = only ? { [only]: TARGETS[only] } : TARGETS

  for (const [site, pages] of Object.entries(groups)) {
    for (const target of pages) {
      for (const [vp, size] of Object.entries(VIEWPORTS)) {
        const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1 })
        const page = await ctx.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(e.message))
        const key = `${site}-${target.name}-${vp}`
        try {
          const res = await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45000 })
          await page.waitForTimeout(1200)
          await settle(page)
          await page.waitForTimeout(800)
          await page.screenshot({ path: path.join(OUT, `${key}-fold.png`) })
          await page.screenshot({ path: path.join(OUT, `${key}-full.png`), fullPage: true })
          report[key] = { status: res?.status(), url: page.url(), errors, ...(vp === 'desktop' || vp === 'mobile' ? await page.evaluate(metrics) : {}) }
          console.log('ok', key, res?.status())
        } catch (e) {
          report[key] = { error: String(e).slice(0, 300) }
          console.log('FAIL', key, String(e).slice(0, 160))
        }
        await ctx.close()
      }
    }
  }
  await browser.close()
  await writeFile(path.join(OUT, `report${only ? `-${only}` : ''}.json`), JSON.stringify(report, null, 2))
}

run()
