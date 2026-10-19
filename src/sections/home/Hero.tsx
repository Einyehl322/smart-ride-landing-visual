import { useRef } from 'react'
import { Icon } from '../../components/ui/Icon'
import { Price } from '../../components/showroom/Price'
import { categoryPath, getProducts } from '../../data/catalog'
import { media } from '../../data/media'
import { minPrice } from '../../data/merchandising'
import { EASE, gsap, MQ, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import './hero.css'

/** La secuencia de entrada solo se reproduce en la primera visita de la sesión. */
let introPlayed = false

const intercoms = getProducts('intercomunicadores')
const fromPrice = minPrice(intercoms)

/**
 * Hero comercial: superficie clara para el mensaje y una composición
 * fotográfica oscura donde el producto es protagonista.
 * Secuencia: el encuadre se abre → un haz de luz descubre el producto →
 * titular por líneas → propuesta → acciones → etiqueta del producto.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        if (introPlayed) return
        introPlayed = true
        const tl = gsap.timeline({ defaults: { ease: EASE.cinematic } })
        tl.fromTo(
          '.hero__frame',
          { clipPath: 'inset(12% 10% 12% 10% round 28px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' },
        )
          .from('.hero__media', { scale: 1.2, duration: 2.6 }, 0.1)
          .fromTo('.hero__shade', { opacity: 1 }, { opacity: 0, duration: 2, ease: 'power2.inOut' }, 0.35)
          .fromTo('.hero__beam', { xPercent: -140, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.8, ease: 'power3.inOut' }, 0.7)
          .from('.hero__title .line-mask > span', { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.55)
          .from('.hero__eyebrow', { autoAlpha: 0, y: 10, duration: 0.9 }, 0.6)
          .from('.hero__lead', { autoAlpha: 0, y: 16, duration: 1 }, 0.9)
          .from('.hero__actions > *', { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.08 }, 1.05)
          .from('.hero__meta > *', { autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 1.3)
          .from('.hero__tag', { autoAlpha: 0, y: 18, duration: 1 }, 1.5)
      })

      // Al desplazarse, la foto se acerca y el texto cede con suavidad (dos columnas).
      mm.add(`${MQ.motion} and (min-width: 1024px)`, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        })
        tl.to('.hero__media', { scale: 1.1, yPercent: 4, ease: 'none' }, 0)
          .to('.hero__content', { yPercent: -10, autoAlpha: 0.2, ease: 'none' }, 0)
          .to('.hero__dim', { opacity: 0.5, ease: 'none' }, 0)
      })

      mm.add(`${MQ.motion} and (max-width: 1023px)`, () => {
        gsap.to('.hero__media', {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: '.hero__frame', start: 'top top', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="hero" data-scheme="light" aria-labelledby="hero-title" data-section="hero">
      <div className="hero__layout container">
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">SMART RIDE · Tecnología para motociclistas</p>
          <h1 id="hero-title" className="hero__title t-hero">
            <span className="line-mask">
              <span>Conectados</span>
            </span>
            <span className="line-mask">
              <span>a cada</span>
            </span>
            <span className="line-mask">
              <span>aventura.</span>
            </span>
          </h1>
          <p className="hero__lead t-lead">Intercomunicadores y tecnología CarPlay para disfrutar cada kilómetro.</p>
          <div className="hero__actions">
            <Link to={categoryPath('intercomunicadores')} className="btn btn--primary">
              Explorar intercomunicadores
              <Icon name="arrow" />
            </Link>
            <Link to={categoryPath('carplay')} className="btn btn--ghost">
              Descubrir CarPlay
            </Link>
          </div>
          <ul className="hero__meta" aria-label="Cómo compras en SMART RIDE">
            <li>
              <Icon name="check" />
              Precios en soles
            </li>
            <li>
              <Icon name="check" />
              Asesoría por WhatsApp
            </li>
          </ul>
        </div>

        <div className="hero__frame" data-scheme="dark">
          <img
            className="hero__media"
            src={media.casco.src}
            srcSet={media.casco.srcSet}
            sizes="(min-width: 1024px) 58vw, 100vw"
            width={media.casco.width}
            height={media.casco.height}
            alt="Intercomunicador montado en el lateral de un casco de motocicleta, iluminado sobre fondo negro"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero__beam" aria-hidden="true" />
          <div className="hero__veil" aria-hidden="true" />
          <div className="hero__dim" aria-hidden="true" />
          <div className="hero__shade" aria-hidden="true" />
          <Link to={categoryPath('intercomunicadores')} className="hero__tag">
            <span className="hero__tag-copy">
              <span className="hero__tag-label">Intercomunicadores para casco</span>
              <span className="hero__tag-price">
                {fromPrice !== null ? (
                  <>
                    Desde <Price amount={fromPrice} size="md" />
                  </>
                ) : (
                  `${intercoms.length} modelos`
                )}
              </span>
            </span>
            <span className="hero__tag-arrow" aria-hidden="true">
              <Icon name="arrow" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
