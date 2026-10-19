import { useEffect, useRef, useState } from 'react'
import { ProductCompare } from '../components/product/ProductCompare'
import { ProductTile } from '../components/product/ProductTile'
import { Showroom } from '../components/showroom/Showroom'
import { Icon } from '../components/ui/Icon'
import { ProductVisual } from '../components/visuals/ProductVisual'
import { categories, categoryPath, getProducts } from '../data/catalog'
import { minPrice } from '../data/merchandising'
import { formatPEN, priceValue } from '../data/price'
import type { Category, Product } from '../data/types'
import { EASE, gsap, MQ, revealOnEnter, useGSAP } from '../motion/gsap'
import { Link } from '../router/Link'
import { useRouter } from '../router/context'
import { usePageMeta } from '../router/usePageMeta'
import '../components/product/product-tile.css'
import '../components/showroom/showroom.css'
import './pages.css'

export function CategoryPage({ category }: { category: Category }) {
  usePageMeta(category.name, category.lede)
  const others = categories.filter((c) => c.id !== category.id)

  return (
    <>
      {category.id === 'intercomunicadores' ? (
        <CollectionCategory category={category} />
      ) : (
        <Showroom category={category.id} level="h1" />
      )}

      <section className="cross section section--alt" data-scheme="light" aria-label="Otras categorías">
        <div className="container cross__list">
          {others.map((other) => (
            <Link key={other.id} to={categoryPath(other.id)} className="cross__link">
              <span className="eyebrow">También te puede interesar</span>
              <span className="cross__title">{other.name}</span>
              <span className="cross__body">{other.benefit}</span>
              <span className="text-link">
                <span>Explorar {other.name.toLowerCase()}</span>
                <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

type TypeFilter = 'all' | 'intercom' | 'helmet-audio'
type Sort = 'featured' | 'price-asc' | 'price-desc'

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: 'Todos',
  intercom: 'Intercomunicadores',
  'helmet-audio': 'Audífonos para casco',
}

const typeOf = (p: Product): Exclude<TypeFilter, 'all'> => (p.productType === 'helmet-audio' ? 'helmet-audio' : 'intercom')

function sortProducts(list: Product[], sort: Sort) {
  if (sort === 'featured') return list
  const dir = sort === 'price-asc' ? 1 : -1
  return [...list].sort((a, b) => ((priceValue(a) ?? Infinity) - (priceValue(b) ?? Infinity)) * dir)
}

/** Colección (intercomunicadores): hero de categoría, catálogo en grilla y comparador. */
function CollectionCategory({ category }: { category: Category }) {
  const ref = useRef<HTMLElement>(null)
  const catalog = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const { nav } = useRouter()
  const all = getProducts(category.id)
  const types = (['intercom', 'helmet-audio'] as const).filter((t) => all.some((p) => typeOf(p) === t))
  const [type, setType] = useState<TypeFilter>('all')
  const [sort, setSort] = useState<Sort>('featured')
  const list = sortProducts(type === 'all' ? all : all.filter((p) => typeOf(p) === type), sort)
  const from = minPrice(all)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        // Entrada: el visual se "enfoca" mientras los textos se apilan.
        const tl = gsap.timeline({ defaults: { ease: EASE.cinematic } })
        tl.fromTo(
          '.chero__stage',
          { clipPath: 'inset(10% 8% 10% 8% round 28px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' },
          0,
        )
          .from('.chero__visual', { scale: 1.15, duration: 1.8 }, 0.05)
          .from('.chero__title .line-mask > span', { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.3)
          .from('.chero__copy > :not(h1)', { autoAlpha: 0, y: 16, duration: 1, stagger: 0.06 }, 0.5)
        gsap.to('.chero__visual', {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: ref, dependencies: [category.id], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      // Al volver desde una ficha, la tarjeta es el destino de la transición.
      if (nav.kind === 'pop') return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => revealOnEnter('.ptile'))
    },
    { scope: catalog },
  )

  // Al filtrar u ordenar, las tarjetas que quedan entran con un desplazamiento corto.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (window.matchMedia(MQ.reduced).matches) return
    gsap.fromTo(
      grid.current!.querySelectorAll('.ptile'),
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04, ease: EASE.snappy, overwrite: true },
    )
  }, [type, sort])

  return (
    <>
      <section ref={ref} className="chero" data-scheme="light" aria-labelledby="chero-title">
        <div className="container chero__layout">
          <div className="chero__copy">
            <nav className="phero__crumbs" aria-label="Ruta de navegación">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{category.name}</span>
            </nav>
            <p className="eyebrow">{category.eyebrow}</p>
            <h1 id="chero-title" className="chero__title t-display">
              <span className="line-mask">
                <span>{category.name}</span>
              </span>
            </h1>
            <p className="t-lead chero__lede">{category.lede}</p>
            <ul className="chero__beats">
              {category.beats.map((b) => (
                <li key={b.title}>
                  <strong>{b.title}</strong>
                  <span className="t-muted">{b.body}</span>
                </li>
              ))}
            </ul>
            <div className="chero__actions">
              <Link to="#catalogo" className="btn btn--primary">
                Ver {all.length} modelos
                <Icon name="arrow-down" />
              </Link>
              {from !== null ? <span className="chero__from">Desde {formatPEN(from)}</span> : null}
            </div>
          </div>
          <div className="chero__stage" data-scheme="dark">
            <ProductVisual visual={category.visual} priority className="chero__visual" sizes="(min-width: 1024px) 50vw, 92vw" />
          </div>
        </div>
      </section>

      <section ref={catalog} id="catalogo" className="catalog section" data-scheme="light" aria-labelledby="catalog-title">
        <div className="container">
          <div className="showroom__toolbar catalog__toolbar">
            <div>
              <h2 id="catalog-title" className="showroom__count">
                {list.length} {list.length === 1 ? 'modelo' : 'modelos'}
              </h2>
              <p className="t-muted catalog__hint">Precios en soles. Confirma disponibilidad por WhatsApp.</p>
            </div>
            <div className="showroom__controls">
              {types.length > 1 ? (
                <div className="seg" role="group" aria-label="Filtrar por tipo">
                  {(['all', ...types] as const).map((t) => (
                    <button key={t} type="button" className="seg__btn" aria-pressed={type === t} onClick={() => setType(t)}>
                      {TYPE_LABELS[t]}
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
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </label>
            </div>
          </div>
          <div ref={grid}>
            <ul className="tile-grid catalog__grid">
              {list.map((p) => (
                <li key={p.slug}>
                  <ProductTile product={p} shared level="h3" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ProductCompare category={category.id} />
    </>
  )
}
