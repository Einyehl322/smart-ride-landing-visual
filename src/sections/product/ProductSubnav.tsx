import { useEffect, useRef, useState } from 'react'
import { ContactActions } from '../../components/ui/ContactActions'
import type { Product } from '../../data/types'
import { gsap, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import './product.css'

export interface SubnavItem {
  id: string
  label: string
}

/**
 * Navegación propia de la ficha: queda fija bajo la cabecera, marca la sección
 * activa y mantiene la acción de consulta siempre a mano.
 */
export function ProductSubnav({ product, items }: { product: Product; items: SubnavItem[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [items])

  useGSAP(
    () => {
      gsap.fromTo(
        '.psubnav__progress',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="psubnav" data-scheme="light">
      <div className="psubnav__bar container">
        <p className="psubnav__name">{product.name}</p>
        <nav aria-label={`Secciones de ${product.name}`} className="psubnav__links">
          {items.map((i) => (
            <Link key={i.id} to={`#${i.id}`} className={active === i.id ? 'is-active' : ''}>
              {i.label}
            </Link>
          ))}
        </nav>
        <ContactActions product={product} size="sm" className="psubnav__cta" />
      </div>
      <span className="psubnav__progress" aria-hidden="true" />
    </div>
  )
}
