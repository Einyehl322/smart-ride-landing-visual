import { prefersReducedMotion } from '../motion/gsap'

export function scrollToHash(hash: string, smooth: boolean) {
  if (!hash) return false
  const el = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!el) return false
  el.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'instant', block: 'start' })
  return true
}
