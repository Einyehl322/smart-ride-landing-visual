import { useRef } from 'react'
import { Icon } from '../../components/ui/Icon'
import { whatsappHref } from '../../config/site'
import { media } from '../../data/media'
import { EASE, gsap, MQ, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import './home.css'

/**
 * Cierre emocional: fotografía de ruta a sangre completa con parallax (la
 * imagen se desplaza más despacio que la página) y la invitación final.
 */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const wa = whatsappHref()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          '.final__img',
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 60%' } })
        tl.from('.final__title .line-mask > span', { yPercent: 110, stagger: 0.12, duration: 1.2, ease: EASE.cinematic })
          .from('.final__lead', { autoAlpha: 0, y: 16, duration: 1 }, 0.35)
          .from('.final__actions > *', { autoAlpha: 0, y: 14, stagger: 0.08, duration: 0.9 }, 0.5)
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="final" data-scheme="dark" aria-labelledby="final-title" data-section="cta-final">
      <div className="final__window">
        <img
          className="final__img"
          src={media.ruta.src}
          srcSet={media.ruta.srcSet}
          sizes="100vw"
          width={media.ruta.width}
          height={media.ruta.height}
          alt="Motociclista tomando una curva en una carretera de montaña rodeada de bosque"
          loading="lazy"
          decoding="async"
        />
        <div className="final__veil" aria-hidden="true" />
      </div>
      <div className="final__content container">
        <h2 id="final-title" className="final__title t-display">
          <span className="line-mask">
            <span>Tu próxima aventura</span>
          </span>
          <span className="line-mask">
            <span>comienza aquí.</span>
          </span>
        </h2>
        <p className="final__lead t-lead">Encuentra la tecnología que mejor se adapta a tu forma de rodar.</p>
        <div className="final__actions">
          <Link to="/#favoritos" className="btn btn--primary">
            Ver productos
            <Icon name="arrow" />
          </Link>
          {wa ? (
            <a className="btn btn--accent" href={wa} target="_blank" rel="noopener">
              <Icon name="whatsapp" />
              Hablar por WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
