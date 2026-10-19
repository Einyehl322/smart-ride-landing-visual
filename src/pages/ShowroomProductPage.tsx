import { useRef, useState } from 'react'
import { InterestToggleButton } from '../components/interest/InterestToggleButton'
import { ProductTile } from '../components/product/ProductTile'
import '../components/product/product-tile.css'
import { FeatureCompare } from '../components/showroom/FeatureCompare'
import { FeatureIcon } from '../components/showroom/FeatureIcon'
import { Price } from '../components/showroom/Price'
import { ProductViewer } from '../components/showroom/ProductViewer'
import { viewerMode } from '../components/showroom/viewerMode'
import '../components/showroom/showroom.css'
import { ContactActions } from '../components/ui/ContactActions'
import { Icon } from '../components/ui/Icon'
import { View360Button } from '../components/viewer360/View360Button'
import { categoryPath, getCategory, getProducts } from '../data/catalog'
import { feature } from '../data/features'
import type { Product } from '../data/types'
import { EASE, gsap, MQ, useGSAP } from '../motion/gsap'
import { Link } from '../router/Link'
import { useRouter } from '../router/context'
import { usePageMeta } from '../router/usePageMeta'
import { MobileBuyBar } from '../sections/product/MobileBuyBar'
import { ProductFaq } from '../sections/product/ProductFaq'
import { ProductGallery } from '../sections/product/ProductGallery'

const NOTES = {
  '3d': 'Modelo 3D · arrastra para girarlo en 360°',
  spin: 'Arrastra para inclinarlo · giro 360° real en «Ver en 360°»',
  photo: 'Fotografía del producto · arrastra para inclinarlo',
  render: 'Render ilustrativo · las fotografías del modelo real se incorporarán próximamente',
  pending: 'Fotografía del producto próximamente',
}

/**
 * Ficha tipo "product spotlight" para CarPlay y accesorios: el visor es el
 * protagonista; al lado, nombre, precio y la consulta por WhatsApp.
 */
export function ShowroomProductPage({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null)
  const { nav } = useRouter()
  const category = getCategory(product.category)
  const others = getProducts(product.category).filter((p) => p !== product)
  const features = product.showroom?.features ?? []
  const mode = viewerMode(product)
  const hasPhotos = product.gallery.length > 0
  const views = product.gallery
  const [viewIndex, setViewIndex] = useState(0)
  usePageMeta(product.name, product.summary)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.cinematic } })
        // Con View Transition el producto ya viajó desde la tarjeta.
        if (!nav.shared) tl.from('.spot__stage .sobj, .spot__stage .model', { autoAlpha: 0, scale: 0.92, y: 30, duration: 1.5 }, 0)
        tl.from('.spot__info > *', { autoAlpha: 0, y: 18, stagger: 0.06, duration: 1 }, nav.shared ? 0.35 : 0.3)
        gsap.utils.toArray<HTMLElement>('.spot-section').forEach((el) => {
          gsap.from(el.querySelectorAll('[data-reveal]'), {
            autoAlpha: 0,
            y: 32,
            stagger: 0.06,
            duration: 1,
            ease: EASE.cinematic,
            scrollTrigger: { trigger: el, start: 'top 80%' },
          })
        })
      })
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className="spot-page">
      <section className="spot" data-scheme="dark" aria-labelledby="product-title">
        <div className="container spot__layout">
          <div className="spot__stage">
            <div className="spot__object">
              <span className="spot__orbit" aria-hidden="true" />
              <ProductViewer product={product} view={views[viewIndex]?.visual} />
            </div>
            {views.length > 1 && mode === 'photo' ? (
              <div className="spot__views" role="group" aria-label="Vistas del producto">
                {views.map((v, i) => (
                  <button key={v.caption} type="button" className="spot__view" aria-pressed={i === viewIndex} onClick={() => setViewIndex(i)}>
                    <span className="spot__view-thumb">
                      {v.visual.kind === 'image' ? <img src={v.visual.src} srcSet={v.visual.srcSet} sizes="72px" alt="" loading="lazy" decoding="async" /> : null}
                    </span>
                    {v.caption}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="spot__note">
              {mode === 'photo' && product.showroom?.reference ? 'Imagen referencial del modelo · arrastra para inclinarlo' : NOTES[mode]}
            </p>
          </div>

          <div className="spot__info">
            <nav className="showroom__crumbs" aria-label="Ruta de navegación">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <Link to={categoryPath(category.id)}>{category.name}</Link>
            </nav>
            <p className="eyebrow">
              {product.category === 'carplay' ? `Pantalla CarPlay${product.showroom?.screen ? ` · ${product.showroom.screen}` : ''}` : category.eyebrow}
            </p>
            <h1 id="product-title" className="spot__name">
              {product.name}
            </h1>
            <p className="spot__tagline">{product.tagline}</p>
            <Price product={product} size="xl" />
            <ul className="spot__tags" aria-label="Características destacadas">
              {features
                .filter((k) => feature(k).tag)
                .map((key) => (
                  <li key={key}>
                    <FeatureIcon name={feature(key).icon} />
                    {feature(key).short}
                  </li>
                ))}
            </ul>
            <div className="spot__actions">
              <ContactActions product={product} withBuy />
              <InterestToggleButton slug={product.slug} />
              <View360Button product={product} />
            </div>
            <a href="#caracteristicas" className="text-link spot__more">
              <span>Ver características</span>
              <Icon name="arrow-down" />
            </a>
          </div>
        </div>
      </section>

      <section id="caracteristicas" className="spot-section section" data-scheme="light" aria-labelledby="features-title">
        <div className="container">
          <p className="eyebrow" data-reveal>Características</p>
          <h2 id="features-title" className="t-h2 spot-section__title" data-reveal>
            Lo que incluye el {product.name}
          </h2>
          <ul className="spot-features">
            {features.map((key) => (
              <li key={key} data-reveal>
                <span className="spot-features__icon">
                  <FeatureIcon name={feature(key).icon} />
                </span>
                <span>{feature(key).label}</span>
              </li>
            ))}
            {product.showroom?.screen ? (
              <li data-reveal>
                <span className="spot-features__icon spot-features__icon--text">{product.showroom.screen}</span>
                <span>Pantalla de {product.showroom.screen}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </section>

      {hasPhotos ? (
        <div id="galeria">
          <ProductGallery product={product} />
        </div>
      ) : null}

      {others.length ? (
        <section id="comparar" className="spot-section section" data-scheme="light" aria-labelledby="compare-title">
          <div className="container">
            <p className="eyebrow" data-reveal>Comparar</p>
            <h2 id="compare-title" className="t-h2 spot-section__title" data-reveal>
              ¿Cuál es el tuyo?
            </h2>
            <div data-reveal>
              <FeatureCompare products={[product, ...others]} current={product} caption={`Comparación de ${category.name.toLowerCase()}`} />
            </div>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <section className="spot-section section section--alt" data-scheme="light" aria-labelledby="others-title">
          <div className="container">
            <p className="eyebrow" data-reveal>Explora</p>
            <h2 id="others-title" className="t-h2 spot-section__title" data-reveal>
              Productos relacionados
            </h2>
            <ul className="tile-grid">
              {others.slice(0, 3).map((p) => (
                <li key={p.slug} data-reveal>
                  <ProductTile product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ProductFaq product={product} />
      <MobileBuyBar product={product} />
    </div>
  )
}
