import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { productPath } from '../../data/catalog'
import { carplayProfile } from '../../data/carplayComparison'
import { formatPEN, priceValue } from '../../data/price'
import type { Product } from '../../data/types'
import { Link } from '../../router/Link'
import { Price } from '../showroom/Price'
import { Icon } from '../ui/Icon'
import { ProductVisual } from '../visuals/ProductVisual'
import './compare.css'

export interface ComparisonValue {
  /** Clave comparable; null significa que el catálogo no confirma el dato. */
  value: string | null
  content: ReactNode
}

export interface ComparisonRow {
  key: string
  label: string
  group?: string
  note?: string
  cells: ComparisonValue[]
}

interface Props {
  products: Product[]
  availableProducts?: Product[]
  current?: Product
  caption: string
  rows: ComparisonRow[]
  className?: string
  tableClassName?: string
  legend: ReactNode
  footer?: ReactNode | ((products: Product[]) => ReactNode)
}

const MOBILE_QUERY = '(max-width: 639px)'
const subscribeMobile = (notify: () => void) => {
  const media = window.matchMedia(MOBILE_QUERY)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const getMobile = () => window.matchMedia(MOBILE_QUERY).matches
const getServerMobile = () => false

function ProductPicker({ products, selected, slot, onChoose, onClose }: {
  products: Product[]; selected: Product[]; slot: number; onChoose: (product: Product) => void; onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [query, setQuery] = useState('')
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const matches = products.filter((p) => normalize(p.name).includes(normalize(query)))

  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <dialog ref={ref} className="comparison-picker" aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose() }}
      onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose() } }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <header className="comparison-picker__header">
        <div><p className="eyebrow">Arma tu comparación</p><h3 id={titleId}>Elige tu {slot + 1 === 1 ? 'primer' : slot + 1 === 2 ? 'segundo' : 'tercer'} modelo.</h3><p>La foto, el precio y los detalles. Tú decides.</p></div>
        <button type="button" className="comparison__icon-button" aria-label="Cerrar selector de modelos" onClick={onClose}><Icon name="close" /></button>
      </header>
      <label className="comparison-picker__search"><Icon name="grid" /><span className="sr-only">Buscar modelo</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca por nombre o modelo…" autoFocus /></label>
      <div className="comparison-picker__list">
        {matches.map((p) => {
          const active = selected[slot]?.slug === p.slug
          const elsewhere = selected.some((item, index) => index !== slot && item.slug === p.slug)
          return (
            <button type="button" key={p.slug} className={`comparison-picker__option ${active ? 'is-selected' : ''}`} disabled={elsewhere}
              onClick={() => onChoose(p)} aria-label={`Elegir ${p.name}`} aria-pressed={active}>
              <span className="comparison-picker__photo"><ProductVisual visual={p.visual} sizes="130px" /></span>
              <span className="comparison-picker__info"><strong>{p.name}</strong><Price product={p} /><span>{active ? 'Modelo actual' : elsewhere ? 'Ya está en tu comparación' : 'Añadir a la comparación'}</span></span>
              <span className="comparison-picker__choose"><Icon name={active || elsewhere ? 'check' : 'plus'} /></span>
            </button>
          )
        })}
        {matches.length === 0 && <p className="comparison-picker__empty">No encontramos ese modelo. Prueba con otro nombre.</p>}
      </div>
      <footer className="comparison-picker__footer"><Icon name="compare" />Compara hasta 3 modelos · 2 a la vez en celular</footer>
    </dialog>
  )
}

/** Selección acotada y filas alineadas: la comparación nunca requiere arrastre horizontal. */
export function ComparisonBoard({ products, availableProducts = products, current, caption, rows, className = '', tableClassName = '', legend, footer }: Props) {
  const tableId = useId()
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, getServerMobile)
  const [slugs, setSlugs] = useState(() => products.slice(0, 3).map((p) => p.slug))
  const [onlyDifferences, setOnlyDifferences] = useState(true)
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)
  const pickerTrigger = useRef<HTMLButtonElement | null>(null)
  const [notice, setNotice] = useState('')
  // Conserva la tercera elección al pasar a celular; puede elegirse desde el selector.
  const selected = slugs.map((slug) => availableProducts.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p))
  const list = selected.slice(0, mobile ? 2 : 3)
  const indices = list.map((p) => availableProducts.findIndex((item) => item.slug === p.slug))
  const selectedRows = rows.map((row) => ({ ...row, cells: indices.map((index) => row.cells[index]) }))
    .filter((row) => row.cells.some((cell) => cell.value !== null))
  const differs = (row: ComparisonRow) => row.cells.some((cell) => cell.value !== row.cells[0].value)
  const different = selectedRows.filter(differs)
  const common = selectedRows.filter((row) => !differs(row))
  const visibleRows = onlyDifferences ? different : [...different, ...common]
  const prices = list.map(priceValue).filter((value): value is number => value !== null)
  const minimum = prices.length ? Math.min(...prices) : null
  const samePrice = prices.length === list.length && new Set(prices).size === 1
  const canAdd = !mobile && selected.length < 3 && availableProducts.length > selected.length
  const style = { '--comparison-cols': Math.max(1, list.length) } as CSSProperties

  function openPicker(slot: number, trigger: HTMLButtonElement) {
    pickerTrigger.current = trigger
    setPickerSlot(slot)
  }

  function closePicker() {
    setPickerSlot(null)
    requestAnimationFrame(() => pickerTrigger.current?.focus({ preventScroll: true }))
  }

  function choose(product: Product) {
    setSlugs((previous) => {
      const next = [...previous]
      const existing = next.indexOf(product.slug)
      const slot = pickerSlot!
      if (existing >= 0) [next[slot], next[existing]] = [next[existing], next[slot]]
      else next[slot] = product.slug
      return next
    })
    setNotice(`${product.name} añadido a la comparación.`)
    closePicker()
  }

  return (
    <div className={`comparison ${className}`} style={style} data-testid="comparison-board">
      <div className="comparison__toolbar">
        <div className="comparison__selection"><span className="comparison__mark"><Icon name="compare" /></span><div><strong>Tu selección, frente a frente.</strong><span>{list.length} de {availableProducts.length} modelos · Cambia cualquiera</span></div></div>
        <div className="comparison__tools">
          {canAdd && <button type="button" className="comparison__add" onClick={(event) => openPicker(selected.length, event.currentTarget)}><Icon name="plus" />Añadir modelo</button>}
          <label className="comparison__toggle"><input type="checkbox" checked={onlyDifferences} onChange={(event) => setOnlyDifferences(event.target.checked)} aria-controls={tableId} /><span className="comparison__switch" aria-hidden="true" />Solo diferencias</label>
        </div>
      </div>

      <div className="comparison__cards">
        <aside className="comparison__aside"><span className="comparison__eyebrow">MENOS DUDAS.<br />MÁS RUTA.</span><Icon name="compare" /><p>Encuentra lo que<br /><strong>va contigo.</strong></p><span>Fotos, precios y diferencias.<br />Todo en el mismo lugar.</span></aside>
        {list.map((p, index) => {
          const price = priceValue(p)
          const lowest = price !== null && price === minimum && !samePrice
          const profile = p.category === 'carplay' ? carplayProfile(p) : null
          return (
            <article key={index} className={`comparison__card ${lowest ? 'is-lowest' : ''} ${p.slug === current?.slug ? 'is-current' : ''}`} data-comparison-product={p.slug}>
              <div className="comparison__card-top"><span>MODELO 0{index + 1}</span><div>
                <button type="button" className="comparison__change" aria-label={`Cambiar modelo ${index + 1}: ${p.name}`} onClick={(event) => openPicker(index, event.currentTarget)}>Cambiar<Icon name="chevron-right" /></button>
                {!mobile && list.length > 2 && p.slug !== current?.slug && <button type="button" className="comparison__remove" aria-label={`Quitar ${p.name} de la comparación`} onClick={() => { setSlugs((previous) => previous.filter((slug) => slug !== p.slug)); setNotice(`${p.name} quitado de la comparación.`) }}><Icon name="close" /></button>}
              </div></div>
              <button type="button" className="comparison__photo" aria-label={`Elegir otro modelo en lugar de ${p.name}`} onClick={(event) => openPicker(index, event.currentTarget)}>
                <ProductVisual visual={p.visual} sizes="(max-width: 639px) 42vw, 240px" />
                {lowest && <span className="comparison__value-badge"><Icon name="check" />Menor precio</span>}
              </button>
              <div className="comparison__card-body">
                <h3 className="comparison__name"><Link to={productPath(p)}>{p.name}</Link></h3>
                <p className="comparison__profile">{profile?.title ?? p.lighting?.format ?? (p.productType === 'helmet-audio' ? 'Audífono para casco' : p.category === 'intercomunicadores' ? 'Intercomunicador para casco' : 'Accesorio para tu moto')}</p>
                <Price product={p} size="lg" />
                <span className={`comparison__price-gap ${lowest ? 'is-lowest' : ''}`}>{price === null ? 'Consulta el precio' : samePrice ? 'Mismo precio' : lowest ? 'Menor precio de esta selección' : `+ ${formatPEN(price - minimum!)} frente al menor precio`}</span>
                {(p.referencePhoto || p.showroom?.reference) && <span className="comparison__reference">Imagen referencial</span>}
                <Link to={productPath(p)} className="comparison__explore">{p.slug === current?.slug ? 'Ver este modelo' : 'Ver detalles'}<Icon name="arrow" /></Link>
              </div>
            </article>
          )
        })}
      </div>

      {common.length > 0 && <div className="comparison__common" aria-label="Características compartidas"><span>EN COMÚN</span>{common.map((row) => <span key={row.key}><Icon name="check" /><span>{row.label}: {row.cells[0].content}</span></span>)}</div>}

      <div className="comparison__table-wrap" role="region" aria-label={caption}>
        <table id={tableId} className={`comparison__table ${tableClassName}`}>
          <caption className="sr-only">{caption}</caption>
          <thead><tr><th scope="col" className="comparison__corner">{onlyDifferences ? 'Lo que cambia' : 'Características'}<small>{visibleRows.length} {visibleRows.length === 1 ? 'aspecto para comparar' : 'aspectos para comparar'}</small></th>
            {list.map((p) => <th key={p.slug} scope="col" className={p.slug === current?.slug ? 'is-current' : undefined}><span>{p.name}</span><Price product={p} /></th>)}
          </tr></thead>
          <tbody>
            {visibleRows.map((row) => <tr key={row.key} className={differs(row) ? 'comparison__difference' : undefined}>
              <th scope="row">{row.group && <span className="comparison__group">{row.group}</span>}{row.label}{row.note && <small className="comparison__row-note">{row.note}</small>}</th>
              {row.cells.map((cell, index) => <td key={list[index].slug} className={list[index].slug === current?.slug ? 'is-current' : undefined}>{cell.content}</td>)}
            </tr>)}
            {visibleRows.length === 0 && <tr className="comparison__matching"><td colSpan={list.length + 1}><Icon name="check" /><span>Estos modelos comparten sus características publicadas.<br /><strong>Compara el precio y revisa los detalles de cada kit.</strong></span></td></tr>}
          </tbody>
        </table>
      </div>

      <div className="comparison__footnote"><Icon name="sheet" /><p>{legend}</p></div>
      {typeof footer === 'function' ? footer(list) : footer}
      <span className="sr-only" role="status">{notice}</span>
      {pickerSlot !== null && <ProductPicker products={availableProducts} selected={list} slot={pickerSlot} onChoose={choose} onClose={closePicker} />}
    </div>
  )
}
