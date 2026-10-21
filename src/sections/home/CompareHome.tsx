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

const GROUPS: { id: Extract<CategoryId, 'intercomunicadores' | 'carplay' | 'exploradoras'>; label: string; initial: string[] }[] = [
  { id: 'intercomunicadores', label: 'Intercomunicadores', initial: ['freedconn-hero', 'ejeas-q8', 'p30-pro'] },
  { id: 'carplay', label: 'Pantallas CarPlay', initial: ['carplay-625-freedconn', 'carplay-7-waterproof', 'carplay-5-dual-bt'] },
  { id: 'exploradoras', label: 'Luces exploradoras', initial: ['exploradoras-3-ojos', 'exploradoras-5-ojos', 'exploradoras-2-ojos'] },
]

/** Selección visual de modelos, compartida con los comparadores de las fichas. */
export function CompareHome() {
  const ref = useRef<HTMLElement>(null)
  const [group, setGroup] = useState(0)
  const g = GROUPS[group]
  const all = getProducts(g.id)
  const products = g.initial.map((slug) => all.find((p) => p.slug === slug)).filter((p) => p !== undefined)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ.motion, () => {
      gsap.from('.cmph .section-head > *, .cmph__controls', {
        autoAlpha: 0, y: 24, stagger: 0.07, duration: 1, ease: EASE.cinematic,
        scrollTrigger: { trigger: ref.current, start: 'top 78%' },
      })
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="comparar-home" className="cmph section" data-scheme="light" aria-labelledby="cmph-title" data-section="comparar">
      <div className="container">
        <header className="section-head"><div className="section-head__copy">
          <p className="eyebrow">Encuentra tu equipo</p>
          <h2 id="cmph-title" className="t-h2">Tu próxima elección,<br />más clara.</h2>
          <p>Elige tus modelos, mira las diferencias y encuentra lo que va contigo.</p>
        </div><Link to={categoryPath(g.id)} className="text-link"><span>Ver catálogo completo</span><Icon name="arrow" /></Link></header>
        <div className="cmph__controls"><div className="seg" role="group" aria-label="Tipo de producto">
          {GROUPS.map((x, i) => <button key={x.id} type="button" className="seg__btn" aria-pressed={i === group} onClick={() => setGroup(i)}>{x.label}</button>)}
        </div></div>
        <div className="cmph__table" data-testid="home-compare" key={g.id}>
          {g.id === 'carplay'
            ? <FeatureCompare products={products} availableProducts={all} caption="Comparación de pantallas CarPlay elegidas" />
            : <SpecCompare products={products} availableProducts={all} caption={`Comparación de ${g.id === 'exploradoras' ? 'luces exploradoras' : 'intercomunicadores'} elegidos`} />}
        </div>
      </div>
    </section>
  )
}
