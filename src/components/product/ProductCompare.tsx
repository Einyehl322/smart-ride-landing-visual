import { getCategory, getProducts } from '../../data/catalog'
import { lightingCatalogueUrl } from '../../data/lighting'
import type { CategoryId, Product, SpecCell } from '../../data/types'
import { Icon } from '../ui/Icon'
import { Pending } from '../ui/Placeholders'
import { ComparisonBoard, type ComparisonRow } from './ComparisonBoard'

function compareLabel(label: string) {
  if (label === 'Alcance') return 'Alcance declarado'
  if (label === 'Music Sharing') return 'Compartir música'
  return label
}

const INTERCOM_ONLY = ['Alcance declarado', 'Participantes', 'Autonomía (intercom)']

function specValue(product: Product, label: string, cell: SpecCell) {
  if (product.productType === 'helmet-audio' && INTERCOM_ONLY.includes(label)) return { value: 'No aplica', content: <span className="t-muted">No aplica</span> }
  if (cell === null) return { value: null, content: <span className="none-mark" title="No figura en el catálogo del modelo"><span aria-hidden="true">—</span><span className="sr-only">No figura en el catálogo</span></span> }
  if (cell.status === 'pending') return { value: null, content: <Pending /> }
  if (cell.status === 'discrepancy') return { value: cell.display, content: <span>{cell.display}<small className="compare__verification">Dato de catálogo · confirmar versión</small></span> }
  return { value: cell.display, content: cell.display }
}

/** Conserva los datos publicados y permite elegir hasta tres modelos sin desplazar la tabla. */
export function SpecCompare({ products, availableProducts = products, current, caption = 'Comparativa de modelos' }: {
  products: Product[]; availableProducts?: Product[]; current?: Product; caption?: string
}) {
  const lighting = availableProducts.length > 0 && availableProducts.every((p) => p.lighting)
  const groups = new Map<string, Set<string>>()
  for (const product of availableProducts) {
    for (const group of product.specs) {
      const labels = groups.get(group.group) ?? new Set<string>()
      group.items.forEach((item) => labels.add(compareLabel(item.label)))
      groups.set(group.group, labels)
    }
  }
  const rows: ComparisonRow[] = Array.from(groups).flatMap(([group, labels]) => Array.from(labels).map((label) => ({
    key: `${group}-${label}`, group, label,
    cells: availableProducts.map((p) => specValue(p, label, p.specs.find((sg) => sg.group === group)?.items.find((si) => compareLabel(si.label) === label)?.value ?? null)),
  })))

  return <ComparisonBoard products={products} availableProducts={availableProducts} current={current} caption={caption} rows={rows}
    className={`compare__wrap ${lighting ? 'compare__wrap--lighting' : ''}`} tableClassName="compare__table"
    legend={lighting ? 'Lúmenes declarados por el catálogo, sin medición publicada. Confirma medidas, consumo y contenido del kit. «Consultar»: dato pendiente de confirmar.' : '— No figura en el catálogo del modelo. «Consultar»: dato pendiente de confirmar.'}
    footer={lighting && <a className="text-link light-compare__source" href={lightingCatalogueUrl} target="_blank" rel="noopener">Ver catálogo de luces (PDF)<Icon name="external" /></a>} />
}

interface Props { category: CategoryId; current?: Product; id?: string }

export function ProductCompare({ category, current, id = 'comparar' }: Props) {
  const all = getProducts(category)
  if (all.length < 2) return null
  const list = current ? [current, ...all.filter((p) => p !== current)] : all

  return (
    <section id={id} className="compare section" data-scheme="light" aria-labelledby={`${id}-title`}>
      <div className="container">
        <header className="section-head"><div className="section-head__copy">
          <p className="eyebrow">Encuentra tu equipo</p>
          <h2 id={`${id}-title`} className="t-h2">Tu próxima elección,<br />más clara.</h2>
          <p>Compara {getCategory(category).name.toLowerCase()}, cambia modelos y descubre qué hace diferente a cada uno.</p>
        </div></header>
        <SpecCompare products={list} current={current} caption={`Comparativa de ${getCategory(category).name.toLowerCase()}`} />
      </div>
    </section>
  )
}
