import { whatsappHref } from '../../config/site'
import { comparisonNotes, comparisonPriority } from '../../data/carplayComparison'
import { feature } from '../../data/features'
import type { Product } from '../../data/types'
import { ComparisonBoard, type ComparisonRow, type ComparisonValue } from '../product/ComparisonBoard'
import { Icon } from '../ui/Icon'

interface Props { products: Product[]; availableProducts?: Product[]; current?: Product; caption: string }

function featureValue(cell: string | true | null, label: string, carplay: boolean): ComparisonValue {
  if (cell === true) return { value: 'Sí', content: <span className="fcompare__yes"><Icon name="check" /><span>{carplay && label === 'Base magnética' ? 'Sí, desmontable' : carplay && label === 'Control remoto multifuncional' ? 'Mando externo' : 'Sí'}</span></span> }
  if (cell === null) return { value: null, content: <span className="fcompare__none" title="Dato sin especificar para este modelo">{carplay ? 'Por confirmar' : <><span aria-hidden="true">—</span><span className="sr-only">No figura en el catálogo</span></>}</span> }
  if (cell === 'TPMS' && carplay) return { value: cell, content: <span>TPMS anunciado<small className="fcompare__cell-note">Confirmar sensores del kit</small></span> }
  return { value: cell, content: cell }
}

/** Las funciones no publicadas siguen siendo desconocidas, nunca un «No». */
export function FeatureCompare({ products, availableProducts = products, current, caption }: Props) {
  const carplay = availableProducts.length > 0 && availableProducts.every((p) => p.category === 'carplay')
  const rows: ComparisonRow[] = []
  if (availableProducts.some((p) => p.showroom?.screen)) rows.push({ key: 'screen', label: 'Pantalla', cells: availableProducts.map((p) => featureValue(p.showroom?.screen ?? null, 'Pantalla', carplay)) })
  const labels = [...new Set(availableProducts.flatMap((p) => (p.showroom?.features ?? []).map((key) => feature(key).row)))]
  const order = (label: string) => {
    const index = comparisonPriority.indexOf(label)
    return index < 0 ? comparisonPriority.length : index
  }
  for (const label of labels.sort((a, b) => order(a) - order(b))) {
    rows.push({ key: label, label, note: carplay ? comparisonNotes[label] : undefined,
      cells: availableProducts.map((p) => {
        const key = p.showroom?.features.find((k) => feature(k).row === label)
        return featureValue(key ? (feature(key).value ?? true) : null, label, carplay)
      }),
    })
  }
  return <ComparisonBoard products={products} availableProducts={availableProducts} current={current} caption={caption} rows={rows}
    className="fcompare" tableClassName="fcompare__table"
    legend={carplay ? 'Por confirmar: consúltanos sobre esa función y el contenido del kit. Las funciones comunes se agrupan arriba.' : '— No figura en el catálogo del modelo. Consúltanos por WhatsApp si necesitas confirmarlo.'}
    footer={carplay ? (selected) => {
      const href = whatsappHref(['Hola, quiero comparar estas pantallas CarPlay:', ...selected.map((p) => `• ${p.name}`), '', '¿Me confirman el modelo y versión exactos, resolución y brillo de pantalla, compatibilidad de audio y qué cámaras, sensores y soportes incluye cada kit?'].join('\n'))
      return href && <div className="fcompare__technical"><p>¿Tu decisión depende del brillo, la resolución o el audio? Te confirmamos la versión exacta.</p><a href={href} target="_blank" rel="noopener"><Icon name="whatsapp" />Consultar fichas técnicas<Icon name="external" /></a></div>
    } : undefined} />
}
