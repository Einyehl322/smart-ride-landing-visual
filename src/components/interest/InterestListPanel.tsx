import { useEffect, useRef, useState } from 'react'
import { whatsappHref } from '../../config/site'
import { productCategoryLabel, productPath, products } from '../../data/catalog'
import { keyFacts } from '../../data/merchandising'
import type { Product } from '../../data/types'
import { gsap, prefersReducedMotion } from '../../motion/gsap'
import { Link } from '../../router/Link'
import { SpecCompare } from '../product/ProductCompare'
import { Price } from '../showroom/Price'
import { FeatureCompare } from '../showroom/FeatureCompare'
import { Icon } from '../ui/Icon'
import { ProductVisual } from '../visuals/ProductVisual'
import { useInterestList } from './InterestListContext'
import { interestMessage, selectionUrl } from './selection'
import './interest-list.css'

const productMap = new Map(products.map((product) => [product.slug, product]))

export function InterestListPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, add, remove, clear, sharedSelection } = useInterestList()
  const panelRef = useRef<HTMLDialogElement>(null)
  const [compareSlugs, setCompareSlugs] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [undo, setUndo] = useState<{ product: Product; index: number } | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [notice, setNotice] = useState('')
  const selected = items.map((slug) => productMap.get(slug)).filter((p): p is Product => Boolean(p))
  const compared = selected.filter((p) => compareSlugs.includes(p.slug))
  const comparing = showCompare && compared.length >= 2
  const activeProducts = comparing ? compared : selected
  const href = activeProducts.length ? whatsappHref(interestMessage(activeProducts)) : null

  useEffect(() => {
    const panel = panelRef.current
    if (!open || !panel) return
    panel.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const animation = gsap.fromTo(panel, { x: '100%', opacity: 0 }, {
      x: 0, opacity: 1, duration: prefersReducedMotion() ? 0 : 0.4, ease: 'expo.out',
    })
    return () => {
      animation.kill()
      panel.close()
      document.body.style.overflow = overflow
    }
  }, [open])

  function closePanel() {
    setConfirmClear(false)
    setShowShare(false)
    setShowCompare(false)
    setUndo(null)
    setNotice('')
    onClose()
  }

  function removeProduct(product: Product) {
    setUndo({ product, index: items.indexOf(product.slug) })
    remove(product.slug)
    setCompareSlugs((prev) => prev.filter((slug) => slug !== product.slug))
    setConfirmClear(false)
    setNotice('')
  }

  function toggleComparison(product: Product) {
    const checked = compared.some((p) => p.slug === product.slug)
    setCompareSlugs(checked ? compared.filter((p) => p !== product).map((p) => p.slug) : [...compared.map((p) => p.slug), product.slug])
  }

  async function shareSelection() {
    const url = selectionUrl(selected)
    setUndo(null)
    setShowShare(true)
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Enlace copiado. Ábrelo en otro dispositivo o compártelo con alguien.')
    } catch {
      setNotice('Selecciona y copia el enlace para compartir tus productos.')
    }
  }

  return (
    <dialog
      ref={panelRef}
      className={`ilist__panel ${comparing ? 'ilist__panel--compare' : ''}`}
      data-scheme="light"
      aria-labelledby="ilist-title"
      aria-describedby="ilist-description"
      onCancel={(event) => { event.preventDefault(); closePanel() }}
      onClick={(event) => { if (event.target === event.currentTarget) closePanel() }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const panel = event.currentTarget
        const controls = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex]'))
          .filter((el) => el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0)
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      <header className="ilist__header">
        <span className="ilist__mark" aria-hidden="true"><Icon name={comparing ? 'compare' : 'interest'} /></span>
        <div className="ilist__heading">
          <p className="ilist__eyebrow">GUARDADOS PARA TU RUTA</p>
          <h2 id="ilist-title">{comparing ? 'Compara tu selección' : 'Mi selección'}</h2>
          <p id="ilist-description">{activeProducts.length} {activeProducts.length === 1 ? 'producto' : 'productos'} · Tú eliges, nosotros te asesoramos.</p>
        </div>
        <button className="ilist__close" onClick={closePanel} aria-label="Cerrar lista de interés" autoFocus>
          <Icon name="close" />
        </button>
      </header>

      <div className="ilist__body">
        {comparing ? (
          <div className="ilist__comparison">
            <button className="text-link ilist__back" onClick={() => setShowCompare(false)} autoFocus>
              <Icon name="arrow-left" /> Volver a mi selección
            </button>
            <p className="ilist__hint">{productCategoryLabel(compared[0])} · Desliza la tabla para ver todos los modelos.</p>
            <div onClick={(event) => {
              if ((event.target as Element).closest('a')) closePanel()
            }}>
              {compared.every((product) => product.category === 'carplay')
                ? <FeatureCompare products={compared} caption="Comparativa de mi selección CarPlay" />
                : <SpecCompare products={compared} caption="Comparativa de mi selección" />}
            </div>
          </div>
        ) : selected.length === 0 ? (
          <div className="ilist__empty">
            <span className="ilist__empty-icon"><Icon name="interest" /></span>
            <h3>Tu próxima aventura empieza aquí.</h3>
            <p>Guarda los modelos que te gusten para compararlos y consultarnos cuando quieras.</p>
            <Link to="/#favoritos" className="btn btn--primary" onClick={closePanel}>Explorar catálogo <Icon name="arrow" /></Link>
          </div>
        ) : (
          <>
            <div className="ilist__tools">
              <button className="ilist__share" onClick={() => { void shareSelection() }}><Icon name="link" /> Compartir selección</button>
              <Link to="/#favoritos" onClick={closePanel}>Seguir explorando <Icon name="plus" /></Link>
            </div>
            {sharedSelection && <p className="ilist__shared"><Icon name="check" /> Los productos del enlace se añadieron a tu selección.</p>}
            {showShare && (
              <label className="ilist__share-field">
                Enlace de tu selección
                <input type="url" readOnly value={selectionUrl(selected)} onFocus={(event) => event.currentTarget.select()} />
                <span>Incluye tus modelos; los precios se actualizan desde el catálogo.</span>
              </label>
            )}
            <p className="ilist__hint" id="ilist-compare-hint">
              {compared.length === 3
                ? 'Ya elegiste 3 modelos. Desmarca uno para cambiarlo.'
                : compared.length > 0
                  ? `Elige hasta 3 modelos de ${productCategoryLabel(compared[0]).toLowerCase()} para comparar.`
                  : 'Marca de 2 a 3 modelos del mismo tipo para compararlos.'}
            </p>
            <ul className="ilist__items" aria-label="Productos guardados">
              {selected.map((product) => {
                const checked = compared.some((p) => p.slug === product.slug)
                const disabled = !checked && (compared.length >= 3 || (compared.length > 0 && productCategoryLabel(compared[0]) !== productCategoryLabel(product)))
                const individualHref = whatsappHref(interestMessage([product]))
                const facts = keyFacts(product, 3)
                return (
                  <li key={product.slug} className="ilist__item" data-slug={product.slug}>
                    <div className="ilist__item-top">
                      <Link to={productPath(product)} className="ilist__thumb" style={{ background: product.visual.kind === 'image' && product.visual.presentation === 'photograph' ? product.theme.bg : undefined }} onClick={closePanel} aria-label={`Ver ${product.name}`}>
                        <ProductVisual visual={product.visual} sizes="112px" />
                      </Link>
                      <div className="ilist__item-info">
                        <span className="ilist__category">{productCategoryLabel(product)}</span>
                        <Link to={productPath(product)} onClick={closePanel}><h3>{product.name}</h3></Link>
                        <Price product={product} />
                        {product.showroom?.reference && <span className="ilist__reference">Imagen referencial</span>}
                      </div>
                      <button className="ilist__remove" onClick={() => removeProduct(product)} aria-label={`Quitar ${product.name} de la lista`}><Icon name="close" /></button>
                    </div>
                    {facts.length > 0 && <ul className="ilist__facts" aria-label={`Datos clave de ${product.name}`}>{facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}
                    <div className="ilist__item-actions">
                      <label className={`ilist__check ${disabled ? 'is-disabled' : ''}`}>
                        <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleComparison(product)} aria-label={`Comparar ${product.name}`} aria-describedby="ilist-compare-hint" />
                        Comparar
                      </label>
                      {individualHref && <a href={individualHref} target="_blank" rel="noopener" aria-label={`Consultar ${product.name} por WhatsApp`}><Icon name="whatsapp" /> Consultar modelo <Icon name="external" /></a>}
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="ilist__saved"><Icon name="check" /> Tu selección se guarda en este navegador.</p>
          </>
        )}
      </div>

      {(undo || notice) && <div className="ilist__notice" role="status">
        {undo ? <><span>{undo.product.name} eliminado.</span><button onClick={() => { add(undo.product.slug, undo.index); setUndo(null) }}>Deshacer</button></> : <span>{notice}</span>}
      </div>}
      <footer className="ilist__footer">
        {!comparing && selected.length > 0 && (
          <button className="btn btn--ghost ilist__compare-button" disabled={compared.length < 2} onClick={() => { setShowCompare(true); setConfirmClear(false) }}>
            <Icon name="compare" /> Comparar{compared.length > 0 ? ` (${compared.length}/3)` : ' modelos'}
          </button>
        )}
        {href && <a className="btn btn--primary ilist__wa" href={href} target="_blank" rel="noopener">
          <Icon name="whatsapp" /> Consultar {activeProducts.length === 1 ? 'producto' : `${activeProducts.length} productos`}
        </a>}
        {selected.length > 0 && <p className="ilist__footer-note">Confirmamos stock y compatibilidad por WhatsApp.</p>}
        {!comparing && selected.length > 0 && (confirmClear ? (
          <div className="ilist__confirm" role="group" aria-label="Confirmar vaciado de selección">
            <p>¿Quitar los {selected.length} {selected.length === 1 ? 'producto guardado' : 'productos guardados'}?</p>
            <div>
              <button onClick={() => setConfirmClear(false)} autoFocus>Conservar selección</button>
              <button className="ilist__confirm-delete" onClick={() => { clear(); setCompareSlugs([]); setConfirmClear(false); setUndo(null); setNotice('Selección vaciada.'); setShowShare(false) }}>Sí, vaciar</button>
            </div>
          </div>
        ) : <button className="ilist__clear" onClick={() => setConfirmClear(true)}>Vaciar lista</button>)}
      </footer>
    </dialog>
  )
}
