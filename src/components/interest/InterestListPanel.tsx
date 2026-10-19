import { useEffect, useRef } from 'react'
import { site } from '../../config/site'
import { getCategory, productCategoryLabel, products } from '../../data/catalog'
import { specDisplay } from '../ui/Placeholders'
import type { Product } from '../../data/types'
import { gsap, prefersReducedMotion } from '../../motion/gsap'
import { Link } from '../../router/Link'
import { Icon } from '../ui/Icon'
import { useInterestList } from './InterestListContext'
import './interest-list.css'

/** Builds the WhatsApp message for the selected products. */
function buildInterestMessage(items: Product[]): string {
  const lines = items.map((p) => {
    const cat = productCategoryLabel(p)
    const price = specDisplay(p.commerce.price) ? ` — ${specDisplay(p.commerce.price)}` : ''
    return `• ${cat} ${p.name}${price}`
  })
  return [
    'Hola, vengo de SMART RIDE. Me interesan estos productos:',
    '',
    ...lines,
    '',
    '¿Tienen disponibilidad?',
  ].join('\n')
}

export function InterestListPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, remove, clear, count } = useInterestList()
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (!open) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.ilist__panel', { x: '100%', autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: reduced ? 0 : 0.5, ease: 'expo.out' })
      gsap.fromTo('.ilist__backdrop', { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.4, ease: 'power2.out' })
    }, panelRef)
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { ctx.revert(); document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, reduced, onClose])

  const productMap = new Map<string, Product>()
  products.forEach((p) => productMap.set(p.slug, p))

  const selected = items.map((slug) => productMap.get(slug)).filter(Boolean) as Product[]
  const href = selected.length > 0 ? `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(buildInterestMessage(selected))}` : null

  return (
    <div ref={panelRef} className={`ilist ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="ilist__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="ilist__panel" role="dialog" aria-modal="true" aria-label="Mi lista de interés">
        <header className="ilist__header">
          <div>
            <h2 className="t-h3">Mi selección</h2>
            <p className="t-muted">{count} {count === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button className="ilist__close" onClick={onClose} aria-label="Cerrar lista de interés">
            <Icon name="close" />
          </button>
        </header>

        {selected.length === 0 ? (
          <div className="ilist__empty">
            <p>No has seleccionado ningún producto todavía.</p>
            <p className="t-muted">Explora el catálogo y marca los que te interesen con el botón <strong>Me interesa</strong>.</p>
          </div>
        ) : (
          <>
            <ul className="ilist__items">
              {selected.map((p) => (
                <li key={p.slug} className="ilist__item">
                  <Link to={`/${getCategory(p.category).slug}/${p.slug}`} className="ilist__item-info" onClick={onClose}>
                    <span className="eyebrow">{productCategoryLabel(p)}</span>
                    <strong>{p.name}</strong>
                    {specDisplay(p.commerce.price) ? <span>{specDisplay(p.commerce.price)}</span> : null}
                  </Link>
                  <button className="ilist__remove" onClick={() => remove(p.slug)} aria-label={`Quitar ${p.name} de la lista`}>
                    <Icon name="close" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="ilist__footer">
              {href ? (
                <a className="btn btn--primary ilist__wa" href={href} target="_blank" rel="noopener" onClick={onClose}>
                  <Icon name="whatsapp" />
                  Consultar {count === 1 ? 'producto' : `${count} productos`}
                </a>
              ) : null}
              <button className="ilist__clear" onClick={clear} disabled={selected.length === 0}>
                Vaciar lista
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
