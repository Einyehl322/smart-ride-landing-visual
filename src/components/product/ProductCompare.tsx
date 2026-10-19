import { useState } from 'react'
import { getCategory, getProducts, productCategoryLabel, productPath } from '../../data/catalog'
import { formatPEN, priceValue } from '../../data/price'
import { lightingCatalogueUrl } from '../../data/lighting'
import type { CategoryId, Product, SpecCell } from '../../data/types'
import { Link } from '../../router/Link'
import { Price } from '../showroom/Price'
import { Icon } from '../ui/Icon'
import { DemoBadge, Pending } from '../ui/Placeholders'
import { ProductVisual } from '../visuals/ProductVisual'
import { ProductChoice } from './ProductChoice'
import './compare.css'

/** Una fila del comparador: etiqueta + un valor por producto. */
interface CompareRow {
  key: string
  groupLabel: string
  itemLabel: string
  cells: SpecCell[]
}

/** Devuelve true si al menos una celda de la fila tiene un dato confirmado o con discrepancia. */
function rowHasData(row: CompareRow): boolean {
  return row.cells.some((c) => c !== null && c.status !== 'pending')
}

function compareLabel(label: string) {
  if (label === 'Alcance') return 'Alcance declarado'
  if (label === 'Music Sharing') return 'Compartir música'
  return label
}

/** Funciones de intercomunicación que no aplican a un audífono individual. */
const INTERCOM_ONLY = ['Alcance declarado', 'Participantes', 'Autonomía (intercom)']

function Cell({ product, row, cell }: { product: Product; row: CompareRow; cell: SpecCell }) {
  if (product.productType === 'helmet-audio' && INTERCOM_ONLY.includes(row.itemLabel)) return <span className="t-muted">No aplica</span>
  if (cell === null) {
    return (
      <span className="none-mark" title="No figura en el catálogo del modelo">
        <span aria-hidden="true">—</span>
        <span className="sr-only">No figura en el catálogo</span>
      </span>
    )
  }
  if (cell.status === 'pending') return <Pending />
  if (cell.status === 'discrepancy') return <span>{cell.display}<small className="compare__verification">Dato de catálogo · confirmar versión</small></span>
  return <>{cell.display}</>
}

/**
 * Tabla comparativa de especificaciones.
 * Reglas:
 *  - Filas sin ningún dato confirmado → se ocultan.
 *  - Celda sin dato en el catálogo del modelo → "—".
 *  - Celda pendiente de verificación → "Consultar".
 *  - Celdas con discrepancia → valor del catálogo mostrado normalmente.
 *  - El precio siempre se muestra.
 */
export function SpecCompare({ products: list, current, caption = 'Comparativa de modelos' }: { products: Product[]; current?: Product; caption?: string }) {
  const lighting = list.length > 0 && list.every((p) => p.lighting)
  const [onlyDifferences, setOnlyDifferences] = useState(true)
  // Unión de especificaciones: el modelo actual no determina las filas ajenas.
  const groups = new Map<string, Set<string>>()
  for (const product of list) {
    for (const group of product.specs) {
      const labels = groups.get(group.group) ?? new Set<string>()
      group.items.forEach((item) => labels.add(compareLabel(item.label)))
      groups.set(group.group, labels)
    }
  }

  const rows: CompareRow[] = Array.from(groups).flatMap(([group, labels]) =>
    Array.from(labels).map((label) => ({
      key: `${group}-${label}`,
      groupLabel: group,
      itemLabel: label,
      cells: list.map((p) =>
        p.specs.find((sg) => sg.group === group)?.items.find((si) => compareLabel(si.label) === label)?.value ?? null,
      ),
    })),
  )

  const hasDifference = (row: CompareRow) => new Set(row.cells.map((c) => c?.status === 'pending' || !c ? '' : c.display)).size > 1
  const common = rows.filter((row) => rowHasData(row) && !hasDifference(row))
  const groupedRows: { group: string; rows: CompareRow[] }[] = []
  for (const row of rows.filter((row) => rowHasData(row) && (!lighting || !onlyDifferences || hasDifference(row)))) {
    const last = groupedRows[groupedRows.length - 1]
    if (last && last.group === row.groupLabel) last.rows.push(row)
    else groupedRows.push({ group: row.groupLabel, rows: [row] })
  }

  return (
    <div className={`compare__wrap ${lighting ? 'compare__wrap--lighting' : ''}`}>
      {lighting && <>
        <div className="light-compare__intro">
          <div><p className="eyebrow">Lo que cambia tu elección</p><p>Formato, modos y precio para elegir tu luz auxiliar.</p></div>
          <label className="light-compare__toggle"><input type="checkbox" checked={onlyDifferences} onChange={(event) => setOnlyDifferences(event.target.checked)} />Solo diferencias</label>
        </div>
        {common.length > 0 && <div className="light-compare__common" aria-label="Características compartidas"><strong>En estos modelos:</strong>{common.map((row) => <span key={row.key}>{row.itemLabel}: {row.cells[0]!.display}</span>)}</div>}
      </>}
      <div className="compare__scroller" tabIndex={0} role="region" aria-label={`${caption}, desplazable horizontalmente`}>
        <table className="compare__table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="compare__corner">
                <span className="sr-only">Característica</span>
              </th>
              {list.map((p) => (
                <th key={p.slug} scope="col" className={p === current ? 'is-current' : ''}>
                  <div className="compare__product">
                    <Link to={productPath(p)} className="compare__thumb" style={{ background: p.theme.bg }} tabIndex={-1} aria-hidden="true">
                      <ProductVisual visual={p.visual} sizes="160px" />
                    </Link>
                    <span className="compare__name">{p.name}</span>
                    <span className="compare__category">{productCategoryLabel(p)}</span>
                    {lighting && <>
                      <Price product={p} />
                      <span className="light-compare__price-gap">{(() => {
                        const minimum = Math.min(...list.map((item) => priceValue(item) ?? Infinity))
                        const price = priceValue(p)
                        return price === null ? 'Consulta el precio' : price === minimum ? 'Menor precio de esta selección' : `+ ${formatPEN(price - minimum)} frente al menor precio`
                      })()}</span>
                      <span className="light-compare__stock">{p.lighting?.soldOut ? 'Agotado en catálogo' : 'Disponibilidad a consultar'}</span>
                    </>}
                    <ProductChoice product={p} compact />
                    {p.isDemo && <DemoBadge>Fotos pendientes</DemoBadge>}
                    {p === current ? (
                      <span className="compare__here">Estás viendo este modelo</span>
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
            <tr>
              <th scope="row">Precio</th>
              {list.map((p) => (
                <td key={p.slug} className={`compare__price ${p === current ? 'is-current' : ''}`}>
                  <Price product={p} size="md" />
                </td>
              ))}
            </tr>
          </tbody>

          {groupedRows.map((grp) => (
            <tbody key={grp.group}>
              {grp.rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">
                    <span className="compare__group">{row.groupLabel}</span>
                    {row.itemLabel}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={`${row.key}-${list[i].slug}`} className={list[i] === current ? 'is-current' : undefined}>
                      <Cell product={list[i]} row={row} cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="compare__legend t-muted">{lighting ? 'Lúmenes declarados por el catálogo, sin medición publicada. No permiten deducir distancia ni amplitud del haz. Confirma medidas, consumo y contenido del kit.' : '— No figura en el catálogo del modelo. «Consultar»: dato pendiente de confirmar.'}</p>
      {lighting && <a className="text-link light-compare__source" href={lightingCatalogueUrl} target="_blank" rel="noopener">Ver catálogo de luces (PDF)<Icon name="external" /></a>}
    </div>
  )
}

interface Props {
  category: CategoryId
  /** Modelo actual (se resalta y se muestra primero). */
  current?: Product
  id?: string
}

/** Sección de comparación entre todos los modelos de una categoría. */
export function ProductCompare({ category, current, id = 'comparar' }: Props) {
  const all = getProducts(category)
  if (all.length < 2) return null
  const list = current ? [current, ...all.filter((p) => p !== current)] : all

  return (
    <section id={id} className="compare section" data-scheme="light" aria-labelledby={`${id}-title`}>
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Comparar</p>
            <h2 id={`${id}-title`} className="t-h2">
              {current ? '¿Cuál es el tuyo?' : `Compara ${getCategory(category).name.toLowerCase()}`}
            </h2>
            <p>Desliza la tabla para ver todos los modelos. La primera columna queda fija.</p>
          </div>
        </header>
        <SpecCompare products={list} current={current} caption={`Comparativa de ${getCategory(category).name.toLowerCase()}`} />
      </div>
    </section>
  )
}
