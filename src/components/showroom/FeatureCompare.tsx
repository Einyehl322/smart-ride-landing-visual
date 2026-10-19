import type { CSSProperties } from 'react'
import { feature } from '../../data/features'
import { productPath } from '../../data/catalog'
import type { Product } from '../../data/types'
import { Link } from '../../router/Link'
import { Icon } from '../ui/Icon'
import { Price } from './Price'
import { ShowroomObject } from './ShowroomObject'

interface Props {
  products: Product[]
  /** Modelo que se está viendo: se resalta y no enlaza a sí mismo. */
  current?: Product
  caption: string
}

interface Row {
  label: string
  cells: (string | true | null)[]
}

/**
 * Comparativa con las características del catálogo. Una celda vacía significa
 * que la característica no figura en el catálogo de ese modelo, no que falte.
 */
export function FeatureCompare({ products, current, caption }: Props) {
  const rows: Row[] = []
  const hasScreen = products.some((p) => p.showroom?.screen)
  if (hasScreen) rows.push({ label: 'Pantalla', cells: products.map((p) => p.showroom?.screen ?? null) })

  const labels: string[] = []
  for (const p of products) {
    for (const key of p.showroom?.features ?? []) {
      const { row } = feature(key)
      if (!labels.includes(row)) labels.push(row)
    }
  }
  for (const label of labels) {
    rows.push({
      label,
      cells: products.map((p) => {
        const key = p.showroom?.features.find((k) => feature(k).row === label)
        return key ? (feature(key).value ?? true) : null
      }),
    })
  }

  return (
    <div className="fcompare">
      <div className="fcompare__scroller" tabIndex={0} role="region" aria-label={`${caption}, desplazable horizontalmente`}>
        <table className="fcompare__table" style={{ '--cols': products.length } as CSSProperties}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="fcompare__corner">
                <span className="sr-only">Característica</span>
              </th>
              {products.map((p) => (
                <th key={p.slug} scope="col" className={p === current ? 'is-current' : undefined}>
                  <div className="fcompare__product">
                    <div className="fcompare__thumb">
                      <ShowroomObject product={p} size="card" interaction="none" sizes="160px" />
                    </div>
                    <span className="fcompare__name">{p.name}</span>
                    <Price product={p} />
                    {p === current ? (
                      <span className="fcompare__here">Estás viendo este modelo</span>
                    ) : (
                      <Link to={productPath(p)} className="text-link">
                        <span>Explorar</span>
                        <Icon name="arrow" />
                      </Link>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell, i) => (
                  <td key={products[i].slug} className={products[i] === current ? 'is-current' : undefined}>
                    {cell === true ? (
                      <span className="fcompare__yes">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        <span className="sr-only">Sí</span>
                      </span>
                    ) : cell === null ? (
                      <span className="fcompare__none" title="No figura en el catálogo">
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">No figura en el catálogo</span>
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fcompare__legend t-muted">— No figura en el catálogo del modelo. Consúltanos por WhatsApp si necesitas confirmarlo.</p>
    </div>
  )
}
