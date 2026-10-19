import { useRef } from 'react'
import { ShowroomObject } from '../../components/showroom/ShowroomObject'
import { Icon } from '../../components/ui/Icon'
import { ProductVisual } from '../../components/visuals/ProductVisual'
import { categoryPath, getCategory, getProducts } from '../../data/catalog'
import { categoryCovers, minPrice } from '../../data/merchandising'
import { formatPEN } from '../../data/price'
import type { CategoryId } from '../../data/types'
import { gsap, MQ, MQ_CONDITIONS, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import './home.css'

function summary(id: CategoryId) {
  const list = getProducts(id)
  const from = minPrice(list)
  return `${list.length} ${list.length === 1 ? 'modelo' : 'modelos'}${from !== null ? ` · Desde ${formatPEN(from)}` : ''}`
}

/**
 * Categorías destacadas: intercomunicadores y CarPlay como protagonistas; los
 * accesorios en una franja más discreta. En escritorio, el panel bajo el
 * cursor gana espacio y el otro cede.
 */
export function CategoryChooser() {
  const ref = useRef<HTMLElement>(null)
  const intercom = getCategory('intercomunicadores')
  const carplay = getCategory('carplay')
  const accesorios = getCategory('accesorios')
  const exploradoras = getCategory('exploradoras')
  const carplayCover = categoryCovers.carplay
  const tpmsCover = categoryCovers.accesorios

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.chooser__grid', start: 'top 80%' } })
        tl.fromTo(
          '.chooser__panel',
          { clipPath: 'inset(100% 0% 0% 0% round 28px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, stagger: 0.12, ease: 'expo.inOut', clearProps: 'clipPath' },
        )
          .from('.chooser__visual', { yPercent: 12, scale: 1.08, duration: 1.6, stagger: 0.12, ease: 'expo.out' }, 0.3)
          .from('.chooser__copy > *', { autoAlpha: 0, y: 16, stagger: 0.05, duration: 0.9 }, 0.55)
        gsap.from('.chooser__strip', {
          autoAlpha: 0,
          y: 24,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.chooser__strip', start: 'top 92%' },
        })
      })
      mm.add(MQ_CONDITIONS.desktop, () => {
        gsap.to('.chooser__visual', {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: '.chooser__grid', start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="categorias" className="chooser section" data-scheme="light" aria-labelledby="chooser-title" data-section="categorias">
      <div className="container">
        <header className="section-head" data-fade-on-enter>
          <div className="section-head__copy">
            <p className="eyebrow">Categorías</p>
            <h2 id="chooser-title" className="t-h2">
              Equipa cada parte de tu ruta.
            </h2>
          </div>
        </header>

        <div className="chooser__grid">
          <Link to={categoryPath(intercom.id)} className="chooser__panel chooser__panel--photo" data-scheme="dark" data-fade-on-enter>
            <ProductVisual visual={intercom.visual} className="chooser__visual chooser__visual--cover" sizes="(min-width: 1024px) 50vw, 92vw" />
            <span className="chooser__veil" aria-hidden="true" />
            <div className="chooser__copy">
              <p className="eyebrow">{intercom.eyebrow}</p>
              <h3 className="chooser__title">{intercom.name}</h3>
              <p className="chooser__benefit">{intercom.benefit}</p>
            </div>
            <div className="chooser__foot">
              <span className="chooser__count">{summary(intercom.id)}</span>
              <span className="chooser__cta">
                Explorar
                <Icon name="arrow" />
              </span>
            </div>
          </Link>

          <Link to={categoryPath(carplay.id)} className="chooser__panel chooser__panel--studio" data-scheme="light" data-fade-on-enter data-tilt-zone>
            <div className="chooser__copy">
              <p className="eyebrow">{carplay.eyebrow}</p>
              <h3 className="chooser__title">{carplay.name}</h3>
              <p className="chooser__benefit">{carplay.benefit}</p>
            </div>
            <div className="chooser__visual chooser__visual--object">
              {carplayCover ? <ShowroomObject product={carplayCover} size="card" sizes="(min-width: 1024px) 40vw, 80vw" /> : null}
            </div>
            <div className="chooser__foot">
              <span className="chooser__count">{summary(carplay.id)}</span>
              <span className="chooser__cta">
                Explorar
                <Icon name="arrow" />
              </span>
            </div>
          </Link>
        </div>

        <Link to={categoryPath(exploradoras.id)} className="chooser__strip" data-scheme="light">
          <span className="chooser__strip-visual"><ProductVisual visual={exploradoras.visual} sizes="240px" /></span>
          <span className="chooser__strip-copy">
            <span className="eyebrow">Luces exploradoras</span>
            <span className="chooser__strip-title">Elige tu formato de luz auxiliar.</span>
            <span className="chooser__strip-body">{exploradoras.benefit}</span>
          </span>
          <span className="chooser__strip-foot">
            <span className="chooser__count">{summary(exploradoras.id)}</span>
            <span className="chooser__cta">Ver exploradoras<Icon name="arrow" /></span>
          </span>
        </Link>

        <Link to={categoryPath(accesorios.id)} className="chooser__strip" data-scheme="light" data-tilt-zone>
          <span className="chooser__strip-visual">
            {tpmsCover ? <ShowroomObject product={tpmsCover} size="card" sizes="240px" /> : null}
          </span>
          <span className="chooser__strip-copy">
            <span className="eyebrow">{accesorios.name}</span>
            <span className="chooser__strip-title">{accesorios.eyebrow}</span>
            <span className="chooser__strip-body">{accesorios.benefit}</span>
          </span>
          <span className="chooser__strip-foot">
            <span className="chooser__count">{summary(accesorios.id)}</span>
            <span className="chooser__cta">
              Ver accesorios
              <Icon name="arrow" />
            </span>
          </span>
        </Link>
      </div>
    </section>
  )
}
