/**
 * Router mínimo sobre la History API con View Transitions.
 *
 * - Enlaces directos y recarga: la ruta se deriva siempre de `location.pathname`.
 * - Historial: push/pop reales; atrás y adelante restauran el scroll guardado.
 * - Transiciones: si el navegador soporta `document.startViewTransition` y el
 *   usuario no pidió reducir el movimiento, el cambio de vista se anima y los
 *   elementos con el mismo `view-transition-name` se transforman entre páginas.
 *   Sin soporte, la navegación funciona igual, sin animación compartida.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { ScrollTrigger, prefersReducedMotion } from '../motion/gsap'

import { RouterContext, type NavKind, type RouterState } from './context'
import { scrollToHash } from './scroll'
import { stripBase, toHref } from './base'

const supportsViewTransitions = () =>
  typeof document !== 'undefined' && 'startViewTransition' in document

function readLocation() {
  return { pathname: normalize(stripBase(normalize(window.location.pathname))), hash: window.location.hash }
}

function normalize(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

function saveScroll() {
  window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, '')
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RouterState>(() => ({
    ...readLocation(),
    nav: { kind: 'initial', shared: false },
  }))

  async function commit(kind: NavKind, scrollY: number | null) {
    const next = readLocation()
    const animate = supportsViewTransitions() && !prefersReducedMotion()

    const update = () => {
      flushSync(() => setState({ ...next, nav: { kind, shared: animate } }))
      // Las páginas crean sus ScrollTriggers en layout effects; recalculamos
      // antes de restaurar el scroll para que los pines tengan su altura real.
      ScrollTrigger.refresh()
      if (scrollY !== null) window.scrollTo(0, scrollY)
      else if (!scrollToHash(next.hash, false)) window.scrollTo(0, 0)
      if (kind === 'push') {
        document.getElementById('main')?.focus({ preventScroll: true })
      }
    }

    if (!animate) {
      update()
      return
    }

    const root = document.documentElement
    root.dataset.nav = kind === 'pop' ? 'back' : 'forward'
    const transition = document.startViewTransition(update)
    try {
      await transition.finished
    } finally {
      delete root.dataset.nav
    }
  }

  async function navigate(to: string, opts: { replace?: boolean } = {}) {
    const url = new URL(toHref(to), window.location.href)
    if (url.origin !== window.location.origin) {
      window.location.assign(url)
      return
    }
    const pathname = normalize(url.pathname)

    // Ancla dentro de la misma página: desplazamiento suave, sin re-render.
    if (pathname === normalize(window.location.pathname) && url.hash) {
      window.history.replaceState(window.history.state, '', url.hash)
      scrollToHash(url.hash, true)
      return
    }
    if (pathname === normalize(window.location.pathname) && !url.hash) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
      return
    }

    saveScroll()
    const target = pathname + url.search + url.hash
    if (opts.replace) window.history.replaceState({ scrollY: 0 }, '', target)
    else window.history.pushState({ scrollY: 0 }, '', target)
    await commit('push', null)
  }

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const onPop = (e: PopStateEvent) => {
      const y = typeof e.state?.scrollY === 'number' ? e.state.scrollY : null
      void commit('pop', y)
    }
    // Guardamos el scroll de forma continua para que "atrás" desde fuera de la
    // web (o tras una recarga) también lo recupere.
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(saveScroll)
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('scroll', onScroll, { passive: true })

    const restore = window.history.state?.scrollY
    if (typeof restore === 'number' && restore > 0) {
      requestAnimationFrame(() => window.scrollTo(0, restore))
    } else if (window.location.hash) {
      requestAnimationFrame(() => scrollToHash(window.location.hash, false))
    }

    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <RouterContext value={{ ...state, navigate }}>{children}</RouterContext>
}
