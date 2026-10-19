import { useRef } from 'react'
import { site } from '../../config/site'
import { categories, categoryPath, getProducts, productPath } from '../../data/catalog'
import type { Product } from '../../data/types'
import { gsap, MQ, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import { ContactActions } from '../ui/ContactActions'
import { BrandMark } from './Brand'

const YEAR = new Date().getFullYear()

/** Contacto (ancla #contacto, presente en todas las páginas) + pie. */
export function Footer({ product }: { product?: Product }) {
  const ref = useRef<HTMLElement>(null)
  const { contact } = site
  // Solo se muestran los datos configurados; los ausentes no ocupan lugar.
  const data = [
    contact.email ? { label: 'Correo', node: <a href={`mailto:${contact.email}`}>{contact.email}</a> } : null,
    contact.phone ? { label: 'Teléfono', node: <a href={`tel:${contact.phone}`}>{contact.phone}</a> } : null,
    contact.address ? { label: 'Dirección', node: <span>{contact.address}</span> } : null,
    contact.hours ? { label: 'Horario', node: <span>{contact.hours}</span> } : null,
  ].filter((d) => d !== null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.contact__title .line-mask > span', {
          yPercent: 105,
          duration: 1.1,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.contact', start: 'top 80%' },
        })
      })
    },
    { scope: ref },
  )

  return (
    <footer ref={ref} className="site-footer" data-scheme="light">
      <section id="contacto" className="contact container" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">Contacto</p>
          <h2 id="contact-title" className="contact__title">
            <span className="line-mask">
              <span>¿Listo para tu</span>
            </span>
            <span className="line-mask">
              <span>próxima ruta?</span>
            </span>
          </h2>
        </div>
        <div className="contact__aside">
          <p className="t-lead">
            {product
              ? `Consúltanos precio, disponibilidad y compatibilidad de ${product.name}.`
              : 'Cuéntanos qué moto tienes y cómo viajas. Te ayudamos a elegir el equipo adecuado.'}
          </p>
          <ContactActions product={product} />
          {data.length ? (
            <dl className="contact__data">
              {data.map((d) => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>{d.node}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <div className="footer-bottom container">
        <div className="footer-bottom__brand">
          <BrandMark className="brand__mark" />
          <div>
            <strong>{site.brand.name}</strong>
            <p className="t-muted">{site.brand.descriptor}</p>
          </div>
        </div>
        <nav className="footer-nav" aria-label="Pie de página">
          <div>
            <Link to="/" className="footer-nav__title">
              {site.brand.name}
            </Link>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/#favoritos">Favoritos</Link>
              </li>
              <li>
                <Link to="/#comparar-home">Comparar</Link>
              </li>
              <li>
                <Link to="#contacto">Contacto</Link>
              </li>
            </ul>
          </div>
          {categories.map((c) => (
            <div key={c.id}>
              <Link to={categoryPath(c.id)} className="footer-nav__title">
                {c.name}
              </Link>
              <ul>
                {getProducts(c.id).map((p) => (
                  <li key={p.slug}>
                    <Link to={productPath(p)}>{p.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="footer-legal">
          {site.demoMode ? (
            <p>
              Sitio en desarrollo. Las imágenes marcadas como referenciales provienen de publicaciones del mismo modelo
              en el mercado. Precios en soles peruanos (S/); confirma disponibilidad por WhatsApp.
            </p>
          ) : (
            <p>Precios en soles peruanos (S/). Confirma disponibilidad por WhatsApp.</p>
          )}
          <p>
            © {YEAR} {site.brand.legalName}
          </p>
        </div>
      </div>
    </footer>
  )
}
