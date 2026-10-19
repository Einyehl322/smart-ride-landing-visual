import { ProductCompare } from '../components/product/ProductCompare'
import { getProducts } from '../data/catalog'
import type { Product } from '../data/types'
import { usePageMeta } from '../router/usePageMeta'
import { MobileBuyBar } from '../sections/product/MobileBuyBar'
import { ProductBenefits } from '../sections/product/ProductBenefits'
import { ProductClosing } from '../sections/product/ProductClosing'
import { ProductDetails } from '../sections/product/ProductDetails'
import { ProductFaq } from '../sections/product/ProductFaq'
import { ProductGallery } from '../sections/product/ProductGallery'
import { ProductHero } from '../sections/product/ProductHero'
import { ProductIntro } from '../sections/product/ProductIntro'
import { ProductRelated } from '../sections/product/ProductRelated'
import { ProductSpecs } from '../sections/product/ProductSpecs'
import { ProductSubnav, type SubnavItem } from '../sections/product/ProductSubnav'

/**
 * Ficha de intercomunicadores y audífonos: hero claro con la foto a la
 * izquierda → beneficios → recorrido de cámara (banda oscura) → detalles →
 * especificaciones → galería → comparación → preguntas → relacionados → cierre.
 */
export function ProductPage({ product }: { product: Product }) {
  usePageMeta(product.name, `${product.tagline} ${product.isDemo ? '(Modelo demostrativo)' : ''}`.trim())
  const hasCompare = getProducts(product.category).length > 1
  // "Cada detalle" solo aporta si ofrece encuadres distintos de la foto principal.
  const hasDetails = product.details.length > 1

  const items: SubnavItem[] = [
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'resumen', label: 'En detalle' },
    { id: 'especificaciones', label: 'Especificaciones' },
    { id: 'galeria', label: 'Galería' },
    ...(hasCompare ? [{ id: 'comparar', label: 'Comparar' }] : []),
    { id: 'faq', label: 'Preguntas' },
  ]

  return (
    <div className={`product-page ${product.visual.kind === 'image' && product.visual.presentation === 'photograph' ? 'product-page--photograph' : ''}`}>
      <ProductHero product={product} />
      <div className="product-body">
        <ProductSubnav product={product} items={items} />
        <ProductBenefits product={product} />
        <ProductIntro product={product} />
        {hasDetails ? <ProductDetails product={product} /> : null}
        <ProductSpecs product={product} />
        <ProductGallery product={product} />
        {hasCompare ? <ProductCompare category={product.category} current={product} /> : null}
        <ProductFaq product={product} />
        <ProductRelated product={product} />
        <ProductClosing product={product} />
      </div>
      <MobileBuyBar product={product} />
    </div>
  )
}
