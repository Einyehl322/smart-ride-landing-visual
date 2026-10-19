import { useId, useState, type CSSProperties } from 'react'
import { whatsappHref } from '../../config/site'
import { carplayProfile, comparisonNotes, comparisonPriority } from '../../data/carplayComparison'
import { feature } from '../../data/features'
import { productPath } from '../../data/catalog'
import { formatPEN, priceValue } from '../../data/price'
import type { Product } from '../../data/types'
import { Link } from '../../router/Link'
import { Icon } from '../ui/Icon'
import { Price } from './Price'
import { ProductChoice } from '../product/ProductChoice'
import { ShowroomObject } from './ShowroomObject'

interface Props {
  products: Product[]
  current?: Product
  caption: string
}

interface Row {
  label: string
  cells: (string | true | null)[]
}

function differs(row: Row) {
  return row.cells.some((cell) => cell !== row.cells[0])
}

/** Las funciones no publicadas siguen siendo desconocidas, nunca un «No». */
export function FeatureCompare({ products, current, caption }: Props) {
  const tableId = useId()
  const [onlyDifferences, setOnlyDifferences] = useState(true)
  const carplay = products.length > 0 && products.every((p) => p.category === 'carplay')
  const positioned = products.length > 0 && products.every((p) => p.positioning)
  const rows: Row[] = []
  if (products.some((p) => p.showroom?.screen)) {
    rows.push({ label: 'Pantalla', cells: products.map((p) => p.showroom?.screen ?? null) })
  }
  const labels = [...new Set(products.flatMap((p) => (p.showroom?.features ?? []).map((key) => feature(key).row)))]
  for (const label of labels) {
    rows.push({
      label,
      cells: products.map((p) => {
        const key = p.showroom?.features.find((k) => feature(k).row === label)
        return key ? (feature(key).value ?? true) : null
      }),
    })
  }
  const differences = rows.filter(differs)
  const common = rows.filter((row) => !differs(row))
  const orderedDifferences = [...differences].sort((a, b) => {
    const order = (label: string) => {
      const index = comparisonPriority.indexOf(label)
      return index < 0 ? comparisonPriority.length : index
    }
    return order(a.label) - order(b.label)
  })
  const visibleRows = positioned ? [...orderedDifferences, ...(onlyDifferences ? [] : common)] : rows
  const prices = products.map(priceValue).filter((price): price is number => price !== null)
  const minimum = prices.length > 0 ? Math.min(...prices) : null
  const samePrice = prices.length === products.length && new Set(prices).size === 1
  const technicalHref = carplay ? whatsappHref([
    'Hola, quiero comparar estas pantallas CarPlay:',
    ...products.map((p) => `• ${p.name}`),
    '',
    '¿Me confirman el modelo y versión exactos, resolución y brillo de pantalla, compatibilidad de audio y qué cámaras, sensores y soportes incluye cada kit?',
  ].join('\n')) : null

  return (
    <div className="fcompare">
      {positioned && <>
        <div className="fcompare__intro">
          <div>
            <p className="fcompare__eyebrow">LO QUE CAMBIA TU ELECCIÓN</p>
            <p className="fcompare__intro-title">{carplay ? 'Elige lo que suma a tu ruta.' : 'Compara lo que ganas por tu inversión.'}</p>
            <p className="fcompare__intro-note">Revisa para quién conviene cada equipo y los datos que respaldan su propuesta.</p>
          </div>
          <label className="fcompare__toggle">
            <input type="checkbox" checked={onlyDifferences} onChange={(event) => setOnlyDifferences(event.target.checked)} aria-controls={tableId} />
            Solo diferencias
          </label>
        </div>
        {common.length > 0 && <div className="fcompare__common" aria-label="Características compartidas">
          <span className="fcompare__common-label">En todos los elegidos</span>
          {common.map((row) => <span key={row.label} className="fcompare__common-feature"><Icon name="check" />
            {row.cells[0] === true ? row.label : `${row.label}: ${row.cells[0]}`}
          </span>)}
        </div>}
      </>}
      <div className="fcompare__scroller" tabIndex={0} role="region" aria-label={`${caption}, desplazable horizontalmente`}>
        <table id={tableId} className="fcompare__table" style={{ '--cols': products.length } as CSSProperties}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="fcompare__corner">
                {positioned ? <span className="fcompare__corner-label">{onlyDifferences ? 'Diferencias publicadas' : 'Características'}<small>{differences.length} {differences.length === 1 ? 'aspecto a revisar' : 'aspectos a revisar'}</small></span> : <span className="sr-only">Característica</span>}
              </th>
              {products.map((p) => {
                const profile = carplay ? carplayProfile(p) : null
                const price = priceValue(p)
                return <th key={p.slug} scope="col" className={p === current ? 'is-current' : undefined}>
                  <div className="fcompare__product">
                    <div className="fcompare__thumb"><ShowroomObject product={p} size="card" interaction="none" sizes="160px" /></div>
                    <span className="fcompare__name">{p.name}</span>
                    <Price product={p} />
                    {positioned && minimum !== null && price !== null && <span className={`fcompare__price-gap ${price === minimum ? 'is-lowest' : ''}`}>
                      {samePrice ? 'Mismo precio' : price === minimum ? 'Menor precio de esta selección' : `+ ${formatPEN(price - minimum)} frente al menor precio`}
                    </span>}
                    {profile && <div className="fcompare__decision"><span>{profile.title}</span><ProductChoice product={p} compact /></div>}
                    {!profile && p.positioning && <ProductChoice product={p} compact />}
                    {carplay && p.showroom?.reference && <span className="fcompare__reference">Imagen referencial</span>}
                    {p === current ? <span className="fcompare__here">Estás viendo este modelo</span> : (
                      <Link to={productPath(p)} className="text-link"><span>Explorar</span><Icon name="arrow" /></Link>
                    )}
                  </div>
                </th>
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.label} className={positioned && differs(row) ? 'fcompare__difference' : undefined}>
                <th scope="row">{row.label}{carplay && comparisonNotes[row.label] && <small className="fcompare__row-note">{comparisonNotes[row.label]}</small>}</th>
                {row.cells.map((cell, i) => (
                  <td key={products[i].slug} className={products[i] === current ? 'is-current' : undefined}>
                    {cell === true ? (
                      <span className="fcompare__yes">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        <span className={carplay ? undefined : 'sr-only'}>{carplay && row.label === 'Base magnética' ? 'Sí, desmontable' : carplay && row.label === 'Control remoto multifuncional' ? 'Mando externo' : 'Sí'}</span>
                      </span>
                    ) : cell === null ? (
                      <span className="fcompare__none" title="Dato sin especificar para este modelo">
                        {carplay ? 'Por confirmar' : <><span aria-hidden="true">—</span><span className="sr-only">No figura en el catálogo</span></>}
                      </span>
                    ) : cell === 'TPMS' && carplay ? (
                      <><span>TPMS anunciado</span><small className="fcompare__cell-note">Confirmar sensores del kit</small></>
                    ) : cell}
                  </td>
                ))}
              </tr>
            ))}
            {positioned && visibleRows.length === 0 && <tr><td colSpan={products.length + 1} className="fcompare__matching">Las funciones publicadas coinciden. Compara el precio y confirma qué cambia en el kit antes de elegir.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="fcompare__legend t-muted">{carplay
        ? 'Por confirmar: consúltanos sobre esa función y el contenido del kit. Las funciones comunes se agrupan arriba.'
        : '— No figura en el catálogo del modelo. Consúltanos por WhatsApp si necesitas confirmarlo.'}</p>
      {technicalHref && <div className="fcompare__technical"><p>¿Tu decisión depende del brillo, la resolución o el audio? Te confirmamos la versión exacta de estos modelos.</p><a href={technicalHref} target="_blank" rel="noopener"><Icon name="whatsapp" /> Consultar fichas técnicas <Icon name="external" /></a></div>}
    </div>
  )
}
