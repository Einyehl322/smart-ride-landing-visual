import { useRef, useState } from 'react'
import { SpecCompare } from '../../components/product/ProductCompare'
import { FeatureCompare } from '../../components/showroom/FeatureCompare'
import { Icon } from '../../components/ui/Icon'
import { categoryPath, getProducts } from '../../data/catalog'
import type { CategoryId } from '../../data/types'
import { EASE, gsap, MQ, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import '../../components/showroom/showroom.css'
import './home.css'

const MAX = 3
const MIN = 2

const GROUPS: { id: Extract<CategoryId, 'intercomunicadores' | 'carplay' | 'exploradoras'>; label: string; initial: string[] }[] = [
  { id: 'intercomunicadores', label: 'Intercomunicadores', initial: ['freedconn-hero', 'ejeas-q8', 'p30-pro'] },
  { id: 'carplay', label: 'Pantallas CarPlay', initial: ['carplay-625-freedconn', 'carplay-7-waterproof', 'carplay-5-dual-bt'] },
  { id: 'exploradoras', label: 'Luces exploradoras', initial: ['exploradoras-3-ojos', 'exploradoras-5-ojos', 'exploradoras-2-ojos'] },
]

/** Elige 2 o 3 modelos y compáralos en la misma tabla que usan las fichas. */
export function CompareHome() {
  const ref = useRef<HTMLElement>(null)
  const [group, setGroup] = useState(0)
  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(GROUPS.map((g) => [g.id, g.initial.filter((s) => getProducts(g.id).some((p) => p.slug === s))])),
  )
  const g = GROUPS[group]
  const all = getProducts(g.id)
  const picked = selected[g.id]
  const products = picked.map((slug) => all.find((p) => p.slug === slug)!).filter(Boolean)

  const toggle = (slug: string) =>
    setSelected((s) => {
      const list = s[g.id]
      if (list.includes(slug)) return list.length > MIN ? { ...s, [g.id]: list.filter((x) => x !== slug) } : s
      return list.length < MAX ? { ...s, [g.id]: [...list, slug] } : s
    })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.cmph .section-head > *, .cmph__controls, .cmph__table', {
          autoAlpha: 0,
          y: 24,
          stagger: 0.07,
          duration: 1,
          ease: EASE.cinematic,
          scrollTrigger: { trigger: ref.current, start: 'top 78%' },
        })
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="comparar-home" className="cmph section" data-scheme="light" aria-labelledby="cmph-title" data-section="comparar">
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Comparar</p>
            <h2 id="cmph-title" className="t-h2">
              Compara antes de decidir.
            </h2>
            <p>Elige hasta tres modelos y revisa sus datos del catálogo lado a lado.</p>
          </div>
          <Link to={`${categoryPath(g.id)}#comparar`} className="text-link">
            <span>Comparar todos</span>
            <Icon name="arrow" />
          </Link>
        </header>

        <div className="cmph__controls">
          <div className="seg" role="group" aria-label="Tipo de producto">
            {GROUPS.map((x, i) => (
              <button key={x.id} type="button" className="seg__btn" aria-pressed={i === group} onClick={() => setGroup(i)}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="cmph__chips" role="group" aria-label={`Modelos a comparar (${picked.length} de ${MAX})`}>
            {all.map((p) => {
              const on = picked.includes(p.slug)
              const locked = on ? picked.length <= MIN : picked.length >= MAX
              return (
                <button
                  key={p.slug}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  aria-disabled={locked}
                  title={locked ? (on ? `Compara al menos ${MIN} modelos` : `Puedes comparar hasta ${MAX} modelos`) : undefined}
                  onClick={() => toggle(p.slug)}
                >
                  {on ? <Icon name="check" /> : null}
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="cmph__table" data-testid="home-compare">
          {g.id === 'carplay' ? (
            <FeatureCompare products={products} caption="Comparación de pantallas CarPlay elegidas" />
          ) : (
            <SpecCompare products={products} caption={`Comparación de ${g.id === 'exploradoras' ? 'luces exploradoras' : 'intercomunicadores'} elegidos`} />
          )}
        </div>
      </div>
    </section>
  )
}
