import { ProductTile } from '../../components/product/ProductTile'
import { Price } from '../../components/showroom/Price'
import { Icon } from '../../components/ui/Icon'
import { ProductVisual } from '../../components/visuals/ProductVisual'
import { categoryPath, getProducts, productPath } from '../../data/catalog'
import { lightingCatalogueUrl } from '../../data/lighting'
import { minPrice } from '../../data/merchandising'
import { formatPEN } from '../../data/price'
import { Link } from '../../router/Link'
import './lighting.css'

const products = getProducts('exploradoras')
const hero = products.find((product) => product.slug === 'exploradoras-5-ojos')!
const selection = ['exploradoras-para-moto', 'exploradoras-3-ojos-compactas', 'exploradoras-2-ojos'].map((slug) => products.find((p) => p.slug === slug)!)

/** Luces del PDF del propietario: beneficios de formato, modos y presupuesto. */
export function LightingFeature() {
  const from = minPrice(products)
  return (
    <section id="exploradoras" className="lighting-home section" data-scheme="light" data-section="exploradoras" aria-labelledby="lighting-title">
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Luces exploradoras</p>
            <h2 id="lighting-title" className="t-h2">Dale luz a<br />tu próxima ruta.</h2>
            <p>Elige el formato, las opciones de luz y la inversión que encajan con tu equipo.</p>
          </div>
          <Link to={categoryPath('exploradoras')} className="text-link">Ver los {products.length} modelos<Icon name="arrow" /></Link>
        </header>

        <div className="lighting-home__feature">
          <div className="lighting-home__visual">
            <ProductVisual visual={hero.visual} sizes="(min-width: 900px) 45vw, 90vw" />
            <span className="lighting-home__caption">{hero.name} · Imagen del catálogo</span>
          </div>
          <div className="lighting-home__copy">
            <p className="eyebrow">Blanco · Amarillo · Mixto</p>
            <h3>Un formato para cada montaje.</h3>
            <p>Tipo cañón, óptica circular y diseños de dos a cinco ojos. Compara las opciones antes de decidir cómo equipar tu moto.</p>
            <ul className="lighting-home__reasons">
              <li><Icon name="check" /><span><strong>Elige tu formato</strong>Compara la disposición de las lentes y confirma las medidas para tu soporte.</span></li>
              <li><Icon name="check" /><span><strong>Alterna la luz</strong>Blanco, amarillo y mixto en toda la colección; algunas referencias añaden parpadeante.</span></li>
              <li><Icon name="check" /><span><strong>Define tu inversión</strong>{products.length} referencias{from !== null ? ` desde ${formatPEN(from)}` : ''}, con precios y diferencias a la vista.</span></li>
            </ul>
            <Price product={hero} size="lg" />
            <div className="lighting-home__actions">
              <Link to={productPath(hero)} className="btn btn--primary">Explorar las de 5 ojos<Icon name="arrow" /></Link>
              <Link to={`${categoryPath('exploradoras')}#comparar`} className="text-link">Comparar luces<Icon name="compare" /></Link>
            </div>
          </div>
        </div>

        <div className="lighting-home__selection-head"><h3>Tres formas de empezar.</h3><span>Todos los modelos permiten consulta por WhatsApp.</span></div>
        <ul className="tile-grid lighting-home__selection">{selection.map((product) => <li key={product.slug}><ProductTile product={product} /></li>)}</ul>
        <div className="lighting-home__note"><p>Los lúmenes son cifras declaradas del catálogo. Te confirmamos medidas, consumo, compatibilidad y contenido del kit para tu moto.</p><a href={lightingCatalogueUrl} target="_blank" rel="noopener">Ver catálogo de luces (PDF)<Icon name="external" /></a></div>
      </div>
    </section>
  )
}
