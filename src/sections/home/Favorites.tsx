import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ProductTile } from '../../components/product/ProductTile'
import { Icon } from '../../components/ui/Icon'
import { categoryPath, getProducts } from '../../data/catalog'
import { favorites } from '../../data/merchandising'
import { EASE, gsap, MQ, prefersReducedMotion, revealOnEnter, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import { useRouter } from '../../router/context'
import '../../components/product/product-tile.css'
import './home.css'

const tabs = favorites.filter((t) => t.products.length > 0)

/**
 * Favoritos por categoría, con pestañas. Las tarjetas llevan los nombres de
 * View Transition: al explorar, la foto viaja hasta la ficha.
 */
export function Favorites() {
  const ref = useRef<HTMLElement>(null)
  const { nav } = useRouter()
  const [active, setActive] = useState(0)
  const tab = tabs[active]
  const total = getProducts(tab.id).length

  useGSAP(
    () => {
      // Al volver desde una ficha, la tarjeta es el destino de la transición.
      if (nav.kind === 'pop') return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.favorites .section-head > *, .favorites .tabs', {
          autoAlpha: 0,
          y: 20,
          stagger: 0.06,
          duration: 1,
          ease: EASE.cinematic,
          scrollTrigger: { trigger: ref.current, start: 'top 80%' },
        })
        revealOnEnter('.favorites .ptile')
      })
    },
    { scope: ref },
  )

  // Al cambiar de pestaña, las tarjetas nuevas entran con un desplazamiento corto.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prefersReducedMotion()) return
    gsap.fromTo(
      ref.current!.querySelectorAll('.ptile'),
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05, ease: EASE.snappy, overwrite: true },
    )
  }, [active])

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (active + dir + tabs.length) % tabs.length
    setActive(next)
    ref.current?.querySelector<HTMLButtonElement>(`#fav-tab-${tabs[next].id}`)?.focus()
  }

  return (
    <section ref={ref} id="favoritos" className="favorites section" data-scheme="light" aria-labelledby="favorites-title" data-section="favoritos">
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Catálogo</p>
            <h2 id="favorites-title" className="t-h2">
              Descubre nuestros favoritos.
            </h2>
            <p>Una selección de cada categoría, con precio en soles y consulta directa.</p>
          </div>
          <Link to={categoryPath(tab.id)} className="text-link">
            <span>
              Ver {total === tab.products.length ? 'la categoría' : `los ${total} modelos`}
            </span>
            <Icon name="arrow" />
          </Link>
        </header>

        <div className="tabs" role="tablist" aria-label="Categorías de favoritos" onKeyDown={onKey}>
          {tabs.map((t, i) => (
            <button
              key={t.id}
              id={`fav-tab-${t.id}`}
              type="button"
              role="tab"
              className="tabs__btn"
              aria-selected={i === active}
              aria-controls="fav-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
            >
              {t.label}
              <span className="tabs__count">{t.products.length}</span>
            </button>
          ))}
        </div>

        <div id="fav-panel" role="tabpanel" aria-labelledby={`fav-tab-${tab.id}`}>
          <ul className="tile-grid">
            {tab.products.map((p) => (
              <li key={p.slug}>
                <ProductTile product={p} shared />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
