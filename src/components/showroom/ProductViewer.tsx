import type { Product, Visual } from '../../data/types'
import { ModelStage } from './model/ModelStage'
import { ShowroomObject } from './ShowroomObject'
import { modelFor } from './viewerMode'

/**
 * Visor protagonista de la ficha, con la mejor opción disponible:
 * modelo 3D real → (giro 360° real en su visor a pantalla completa) → imagen
 * con inclinación interactiva acotada.
 */
export function ProductViewer({ product, view }: { product: Product; view?: Visual }) {
  const model = modelFor(product)
  if (model) return <ModelStage key={model.src} product={product} model={model} shared />
  return <ShowroomObject product={product} size="spotlight" interaction="drag" priority shared view={view} withAccessories />
}
