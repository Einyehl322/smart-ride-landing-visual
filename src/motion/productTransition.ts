/**
 * Transición "entrar al producto".
 *
 * Fase 1 (aquí, GSAP): la tarjeta elegida se adelanta ligeramente y todo lo
 * secundario se retira de forma coordinada.
 * Fase 2 (View Transitions API, ver styles/transitions.css): el escenario de la
 * tarjeta se expande hasta el hero de la ficha y el producto viaja al centro.
 * Fase 3 (ProductHero): aparecen nombre, descripción y acciones.
 */
import { gsap, prefersReducedMotion } from './gsap'

export const vtName = {
  stage: (slug: string) => `pstage-${slug}`,
  visual: (slug: string) => `pvisual-${slug}`,
}

export async function playProductExit(card: HTMLElement) {
  if (prefersReducedMotion()) return

  const others = Array.from(
    document.querySelectorAll<HTMLElement>('[data-product-card], [data-fade-on-enter]'),
  ).filter((el) => el !== card && !card.contains(el) && isInViewport(el))
  const text = card.querySelectorAll('[data-card-text]')
  const stage = card.querySelector('[data-card-stage]')

  const tl = gsap.timeline({ defaults: { ease: 'power2.in' } })
  tl.to(others, { autoAlpha: 0, y: -14, duration: 0.32, stagger: 0.03 }, 0)
    .to(text, { autoAlpha: 0, y: 12, duration: 0.28, stagger: 0.03 }, 0)
    .to(stage, { scale: 1.03, duration: 0.42, ease: 'power2.inOut' }, 0)
  await tl
}

function isInViewport(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight
}
