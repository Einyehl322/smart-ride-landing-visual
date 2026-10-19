import { useRef } from 'react'
import { Icon, type IconName } from '../../components/ui/Icon'
import { whatsappHref } from '../../config/site'
import { products } from '../../data/catalog'
import { gsap, MQ, revealOnEnter, useGSAP } from '../../motion/gsap'
import './home.css'

/**
 * Por qué comprar en SMART RIDE. Solo se afirma lo que la tienda respalda hoy:
 * asesoría y consulta por WhatsApp, fichas con datos del catálogo y la
 * variedad publicada. Sin envíos, garantías ni financiamiento no confirmados.
 */
const REASONS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'advice',
    title: 'Asesoría para elegir',
    body: 'Cuéntanos qué moto y qué casco usas, y cómo viajas. Te recomendamos el equipo que encaja.',
  },
  {
    icon: 'sheet',
    title: 'Información técnica clara',
    body: 'Publicamos los datos del catálogo de cada modelo y señalamos lo que falta confirmar. Sin cifras inventadas.',
  },
  {
    icon: 'grid',
    title: 'Variedad para tu moto',
    body: `${products.length} modelos entre intercomunicadores, audífonos para casco, pantallas CarPlay y sensores TPMS.`,
  },
  {
    icon: 'chat',
    title: 'Atención por WhatsApp',
    body: 'Consulta precio, disponibilidad y compatibilidad directamente con nosotros, antes de decidir.',
  },
]

export function WhySmartRide() {
  const ref = useRef<HTMLElement>(null)
  const wa = whatsappHref()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.why .section-head > *', {
          autoAlpha: 0,
          y: 22,
          stagger: 0.06,
          duration: 1,
          scrollTrigger: { trigger: ref.current, start: 'top 78%' },
        })
        revealOnEnter('.why__card', { y: 26, stagger: 0.08 })
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="por-que" className="why section section--alt" data-scheme="light" aria-labelledby="why-title" data-section="por-que">
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Por qué SMART RIDE</p>
            <h2 id="why-title" className="t-h2">
              Tecnología para tu moto, con alguien que te asesora.
            </h2>
          </div>
          {wa ? (
            <a className="btn btn--accent" href={wa} target="_blank" rel="noopener">
              <Icon name="whatsapp" />
              Escríbenos
            </a>
          ) : null}
        </header>
        <ul className="why__grid">
          {REASONS.map((r) => (
            <li key={r.title} className="why__card">
              <span className="why__icon">
                <Icon name={r.icon} />
              </span>
              <h3 className="why__title">{r.title}</h3>
              <p className="why__body">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
