import { useEffect, useRef, useState } from 'react'
import { productWhatsappMessage, whatsappHref } from '../../config/site'
import { getCategory, getProducts, productPath } from '../../data/catalog'
import { feature } from '../../data/features'
import { priceValue } from '../../data/price'
import type { CategoryId, Product, ScreenSize } from '../../data/types'
import { EASE, gsap, MQ, revealOnEnter, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import { useRouter } from '../../router/context'
import { ProductTile } from '../product/ProductTile'
import { Icon } from '../ui/Icon'
import { specDisplay } from '../ui/Placeholders'
import { FeatureCompare } from './FeatureCompare'
import { FeatureIcon } from './FeatureIcon'
import { Price } from './Price'
import { ShowroomObject } from './ShowroomObject'
import '../product/product-tile.css'
import './showroom.css'

type Sort = 'featured' | 'price-asc' | 'price-desc'
const SIZES: ScreenSize[] = ['5"', '6.25"', '7"']
const MAX_COMPARE = 3

interface Props {
  category: Extract<CategoryId, 'carplay' | 'accesorios'>
  /** h1 en la página de la categoría, h2 en la home. */
  level: 'h1' | 'h2'
  /** Enlace a la página de la categoría (home). */
  linkToCategory?: boolean
}

function sortProducts(list: Product[], sort: Sort) {
  if (sort === 'featured') return list
  const dir = sort === 'price-asc' ? 1 : -1
  return [...list].sort((a, b) => ((priceValue(a) ?? Infinity) - (priceValue(b) ?? Infinity)) * dir)
}

/**
 * Showroom: el modelo destacado como protagonista, y el resto de la colección
 * como objetos flotantes que se filtran por pantalla, se ordenan por precio y
 * se comparan (hasta tres).
 */
export function Showroom({ category, level, linkToCategory }: Props) {
  const ref = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const { nav } = useRouter()
  const c = getCategory(category)
  const all = getProducts(category)
  const featured = all.find((p) => p.showroom?.featured)
  const sizes = SIZES.filter((s) => all.some((p) => p.showroom?.screen === s))

  const [size, setSize] = useState<ScreenSize | 'all'>('all')
  const [sort, setSort] = useState<Sort>('featured')
  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)

  const list = sortProducts(size === 'all' ? all : all.filter((p) => p.showroom?.screen === size), sort)
  const selectedProducts = selected.map((slug) => all.find((p) => p.slug === slug)!).filter(Boolean)
  const Heading = level

  useGSAP(
    () => {
      // Al volver desde una ficha la tarjeta es el destino de la transición: sin re-animar.
      if (nav.kind === 'pop') return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.showroom__head > *', {
          autoAlpha: 0,
          y: 28,
          stagger: 0.08,
          duration: 1.1,
          ease: EASE.cinematic,
          scrollTrigger: { trigger: '.showroom__head', start: 'top 82%' },
        })
        if (featured) {
          const tl = gsap.timeline({ scrollTrigger: { trigger: '.showroom__feature', start: 'top 72%' } })
          tl.from('.showroom__feature .sobj', { autoAlpha: 0, scale: 0.9, y: 60, duration: 1.6, ease: EASE.cinematic })
            .from('.showroom__feature-copy > *', { autoAlpha: 0, y: 20, stagger: 0.07, duration: 1, ease: EASE.cinematic }, 0.25)
        }
        revealOnEnter('.showroom__grid .ptile')
      })
    },
    { scope: ref },
  )

  // Al filtrar, las tarjetas que quedan entran con un desplazamiento corto.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (window.matchMedia(MQ.reduced).matches) return
    gsap.fromTo(
      ref.current!.querySelectorAll('.showroom__grid .ptile'),
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05, ease: EASE.snappy, overwrite: true },
    )
  }, [size, sort])

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (comparing && !d.open) d.showModal()
    else if (!comparing && d.open) d.close()
  }, [comparing])

  const toggle = (slug: string, on: boolean) =>
    setSelected((s) => (on ? (s.length < MAX_COMPARE && !s.includes(slug) ? [...s, slug] : s) : s.filter((x) => x !== slug)))

  const featuredWa = featured ? whatsappHref(productWhatsappMessage(featured.name, specDisplay(featured.commerce.price))) : null

  return (
    <section ref={ref} className={`showroom showroom--${category}`} data-scheme="light" aria-labelledby={`showroom-${category}`}>
      <div className="container">
        <header className="showroom__head" data-fade-on-enter>
          {level === 'h1' ? (
            <nav className="showroom__crumbs" aria-label="Ruta de navegación">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{c.name}</span>
            </nav>
          ) : null}
          <p className="eyebrow">{category === 'carplay' ? 'Showroom CarPlay' : c.eyebrow}</p>
          <Heading id={`showroom-${category}`} className="showroom__title">
            {c.headline}
          </Heading>
          <p className="showroom__lede">{c.lede}</p>
        </header>

        {featured ? (
          <article className="showroom__feature" data-tilt-zone aria-labelledby="showroom-featured">
            <Link to={productPath(featured)} className="showroom__feature-stage" tabIndex={-1} aria-hidden="true">
              <ShowroomObject product={featured} size="feature" priority={level === 'h1'} sizes="(min-width: 1000px) 56vw, 92vw" withAccessories />
            </Link>
            <div className="showroom__feature-copy">
              <p className="eyebrow">Modelo destacado · {featured.showroom?.screen}</p>
              <h3 id="showroom-featured" className="showroom__feature-name">
                {featured.name}
              </h3>
              <p className="showroom__feature-tagline">{featured.tagline}</p>
              <ul className="showroom__feature-list">
                {featured.showroom?.features.map((key) => (
                  <li key={key}>
                    <FeatureIcon name={feature(key).icon} />
                    {feature(key).label}
                  </li>
                ))}
              </ul>
              <Price product={featured} size="xl" />
              <div className="showroom__feature-actions">
                <Link to={productPath(featured)} className="btn btn--primary">
                  Explorar en detalle
                  <Icon name="arrow" />
                </Link>
                {featuredWa ? (
                  <a href={featuredWa} className="btn btn--ghost" target="_blank" rel="noopener">
                    <Icon name="whatsapp" />
                    Consultar
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ) : null}

        <div className="showroom__toolbar">
          <div>
            <h3 className="showroom__count">
              {list.length} {list.length === 1 ? 'modelo' : 'modelos'}
            </h3>
            {linkToCategory ? (
              <Link to={`/${c.slug}`} className="text-link">
                <span>Ver la página de {c.name}</span>
                <Icon name="arrow" />
              </Link>
            ) : null}
          </div>
          <div className="showroom__controls">
            {sizes.length > 1 ? (
              <div className="seg" role="group" aria-label="Filtrar por tamaño de pantalla">
                {(['all', ...sizes] as const).map((s) => (
                  <button key={s} type="button" className="seg__btn" aria-pressed={size === s} onClick={() => setSize(s)}>
                    {s === 'all' ? 'Todos' : s}
                  </button>
                ))}
              </div>
            ) : null}
            <label className="sort">
              <span className="sr-only">Ordenar</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="featured">Orden del catálogo</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
            </label>
          </div>
        </div>

        <ul className="showroom__grid tile-grid">
          {list.map((p) => (
            <li key={p.slug}>
              <ProductTile
                product={p}
                shared
                compare={{
                  checked: selected.includes(p.slug),
                  disabled: !selected.includes(p.slug) && selected.length >= MAX_COMPARE,
                  onChange: (on) => toggle(p.slug, on),
                }}
              />
            </li>
          ))}
        </ul>
      </div>

      {selected.length ? (
        <div className="ctray" data-scheme="light" role="region" aria-label="Modelos para comparar">
          <ul className="ctray__list">
            {selectedProducts.map((p) => (
              <li key={p.slug}>
                <span>{p.name}</span>
                <button type="button" onClick={() => toggle(p.slug, false)} aria-label={`Quitar ${p.name} de la comparación`}>
                  <Icon name="close" />
                </button>
              </li>
            ))}
          </ul>
          <span className="ctray__hint">{selected.length < 2 ? 'Elige otro modelo' : `${selected.length} de ${MAX_COMPARE}`}</span>
          <button type="button" className="btn btn--primary btn--sm" disabled={selected.length < 2} onClick={() => setComparing(true)}>
            Comparar
          </button>
        </div>
      ) : null}

      <dialog ref={dialog} className="cdialog" data-scheme="light" aria-labelledby="cdialog-title" onClose={() => setComparing(false)} onClick={(e) => e.target === e.currentTarget && setComparing(false)}>
        <div className="cdialog__inner">
          <header className="cdialog__head">
            <h2 id="cdialog-title" className="t-h3">Comparar modelos</h2>
            <button type="button" className="cdialog__close" onClick={() => setComparing(false)} aria-label="Cerrar comparación">
              <Icon name="close" />
            </button>
          </header>
          {comparing ? <FeatureCompare products={selectedProducts} caption="Comparación de los modelos elegidos" /> : null}
        </div>
      </dialog>
    </section>
  )
}
