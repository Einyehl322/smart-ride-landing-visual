import { useRef } from 'react'
import { FeatureIcon } from '../../components/showroom/FeatureIcon'
import { Price } from '../../components/showroom/Price'
import { ShowroomObject } from '../../components/showroom/ShowroomObject'
import { Icon } from '../../components/ui/Icon'
import { categoryPath, getCategory, getProducts } from '../../data/catalog'
import type { FeatureIconName, FeatureKey } from '../../data/features'
import { minPrice } from '../../data/merchandising'
import type { ScreenSize } from '../../data/types'
import { EASE, gsap, MQ, MQ_CONDITIONS, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import './home.css'

const SIZE_ORDER: ScreenSize[] = ['5"', '6.25"', '7"']

const list = getProducts('carplay')
const has = (key: FeatureKey) => list.filter((p) => p.showroom?.features.includes(key)).length
const all = (key: FeatureKey) => list.length > 0 && has(key) === list.length
const sizes = SIZE_ORDER.filter((s) => list.some((p) => p.showroom?.screen === s))
const joinEs = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} y ${items.at(-1)}` : (items[0] ?? ''))

/** Beneficios que se cumplen en el catálogo publicado; nada se afirma sin verificarlo. */
const benefits: { icon: FeatureIconName; text: string }[] = [
  all('carplay') && all('androidAuto')
    ? { icon: 'carplay' as const, text: `Apple CarPlay y Android Auto inalámbricos en los ${list.length} modelos.` }
    : null,
  all('ip67') ? { icon: 'drop' as const, text: 'Resistencia al agua IP67 en toda la línea.' } : null,
  sizes.length > 1 ? { icon: 'gauge' as const, text: `Pantallas de ${joinEs(sizes)}.` } : null,
  (() => {
    const options = [
      has('cameras2k') ? 'cámaras 2K' : null,
      has('tpms') || has('tpmsOptional') ? 'sensores de llanta' : null,
      has('magnetic') ? 'base magnética' : null,
      has('btDual') ? 'Dual Bluetooth' : null,
    ].filter((o): o is string => Boolean(o))
    return options.length ? { icon: 'camera' as const, text: `Opciones con ${joinEs(options)}.` } : null
  })(),
].filter((b) => b !== null)

/**
 * Presentación de la línea CarPlay: fondo claro de estudio, el modelo
 * destacado como gran objeto y pocos datos verificables.
 */
export function CarPlayFeature() {
  const ref = useRef<HTMLElement>(null)
  const category = getCategory('carplay')
  const hero = list[0]
  const from = minPrice(list)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.cpf__copy > *', {
          autoAlpha: 0,
          y: 22,
          stagger: 0.06,
          duration: 1,
          ease: EASE.cinematic,
          scrollTrigger: { trigger: '.cpf__copy', start: 'top 80%' },
        })
      })
      mm.add(MQ_CONDITIONS.desktop, () => {
        gsap.fromTo(
          '.cpf__object',
          { yPercent: 14, scale: 0.9 },
          { yPercent: -4, scale: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom 40%', scrub: 0.8 } },
        )
      })
      mm.add(MQ_CONDITIONS.mobile, () => {
        gsap.from('.cpf__object', {
          autoAlpha: 0,
          y: 40,
          duration: 1.3,
          ease: EASE.cinematic,
          scrollTrigger: { trigger: '.cpf__stage', start: 'top 85%' },
        })
      })
    },
    { scope: ref },
  )

  if (!hero) return null

  return (
    <section ref={ref} id="carplay-home" className="cpf section" data-scheme="light" aria-labelledby="cpf-title" data-section="carplay">
      <div className="container cpf__layout">
        <div className="cpf__stage" data-tilt-zone>
          <div className="cpf__object">
            <ShowroomObject product={hero} size="feature" withAccessories sizes="(min-width: 1024px) 56vw, 92vw" />
          </div>
          <p className="cpf__caption">
            {hero.name}
            {hero.showroom?.reference ? ' · imagen referencial' : ''}
          </p>
        </div>

        <div className="cpf__copy">
          <p className="eyebrow">Pantallas CarPlay</p>
          <h2 id="cpf-title" className="t-h2 cpf__title">
            {category.headline}
          </h2>
          <p className="cpf__lede">{category.benefit}</p>
          <ul className="cpf__benefits">
            {benefits.map((b) => (
              <li key={b.text}>
                <FeatureIcon name={b.icon} />
                {b.text}
              </li>
            ))}
          </ul>
          {from !== null ? (
            <p className="cpf__from">
              <span>Desde</span>
              <Price amount={from} size="lg" />
            </p>
          ) : null}
          <div className="cpf__actions">
            <Link to={categoryPath('carplay')} className="btn btn--primary">
              Explorar pantallas CarPlay
              <Icon name="arrow" />
            </Link>
            <Link to="#comparar-home" className="btn btn--ghost">
              Comparar modelos
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
