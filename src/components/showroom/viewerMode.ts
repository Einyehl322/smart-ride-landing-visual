import type { Model3D, Product } from '../../data/types'

/** Qué material visual permite explorar el producto en la ficha. */
export function viewerMode(product: Product): '3d' | 'spin' | 'photo' | 'render' | 'pending' {
  if (modelFor(product)) return '3d'
  if ((product.view360?.frames.length ?? 0) >= 24) return 'spin'
  if (product.visual.kind === 'image') return 'photo'
  return product.visual.render === 'pending' ? 'pending' : 'render'
}

/**
 * Banco de pruebas del visor 3D, solo en desarrollo: añade `?modelo3d=prueba`
 * a la URL de una ficha. Carga un modelo de muestra de Khronos (no es el producto).
 */
function devTestModel(): Model3D | undefined {
  if (!import.meta.env.DEV) return undefined
  if (new URLSearchParams(window.location.search).get('modelo3d') !== 'prueba') return undefined
  return {
    src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    isTestModel: true,
  }
}

/** Modelo 3D del producto o, en desarrollo, el de prueba. */
export function modelFor(product: Product) {
  return product.model3d ?? devTestModel()
}
