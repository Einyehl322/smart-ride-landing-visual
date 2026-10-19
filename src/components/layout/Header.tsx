import { useEffect, useRef, useState } from 'react'
import { whatsappHref } from '../../config/site'
import { categories, categoryPath, getProducts, productPath } from '../../data/catalog'
import { gsap, prefersReducedMotion } from '../../motion/gsap'
import { Link } from '../../router/Link'
import { useRouter } from '../../router/context'
import { Icon } from '../ui/Icon'
import { Brand } from './Brand'
import './layout.css'

const NAV = [
  { label: 'Inicio', to: '/' },
  ...categories.map((c) => ({ label: c.name, to: categoryPath(c.id) })),
  { label: 'Contacto', to: '#contacto' },
]

type Scheme = 'dark' | 'light'

/** Esquema de la sección que queda justo bajo la cabecera. */
function schemeBelow(header: HTMLElement): Scheme | null {
  const y = header.getBoundingClientRect().bottom + 2
  const el = document.elementFromPoint(window.innerWidth / 2, y)
  const section = el?.closest<HTMLElement>('[data-scheme]')
  if (!section || header.contains(section)) return null
  return section.dataset.scheme === 'dark' ? 'dark' : 'light'
}

/**
 * Cabecera global, fija y discreta: transparente sobre el inicio de cada
 * página y vidrio claro u oscuro al desplazarse, según la sección que tiene
 * debajo. En móvil mantiene a la vista el acceso a CarPlay.
 */
export function Header({ scheme }: { scheme: Scheme }) {
  const { pathname } = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [below, setBelow] = useState<Scheme>(scheme)
  // El menú pertenece a la página en la que se abrió: navegar (también con
  // "atrás") lo cierra sin necesidad de un efecto.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (value: boolean | ((v: boolean) => boolean)) =>
    setOpenOn((prev) => ((typeof value === 'function' ? value(prev === pathname) : value) ? pathname : null))
  const ref = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wa = whatsappHref()

  useEffect(() => {
    let raf = 0
    const update = () => {
      setScrolled(window.scrollY > 24)
      if (ref.current) setBelow(schemeBelow(ref.current) ?? scheme)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    // La página nueva se monta después del cambio de ruta.
    const t = window.setTimeout(update, 60)
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [scheme, pathname])

  // Menú móvil: coreografía de entrada, Escape para cerrar, bloqueo de scroll.
  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    document.body.style.overflow = 'hidden'
    if (menu && !prefersReducedMotion()) {
      gsap.fromTo(
        menu.querySelectorAll('[data-menu-item]'),
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: 'expo.out', delay: 0.05 },
      )
    }
    menu?.querySelector<HTMLElement>('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOn(null)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)
  const current = open ? 'light' : below

  return (
    <header
      ref={ref}
      className={`site-header ${scrolled || open ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}
      data-scheme={current}
      data-testid="site-header"
    >
      <div className="site-header__bar container">
        <Brand onNavigate={close} />
        <nav className="site-nav" aria-label="Principal">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="site-nav__link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link to={categoryPath('carplay')} className="site-header__quick" onClick={close}>
          CarPlay
        </Link>
        <Link to="/#favoritos" className="btn btn--primary btn--sm site-header__cta">
          Ver catálogo
        </Link>
        <button
          ref={toggleRef}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} className="menu-toggle__icon" />
        </button>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" hidden={!open} data-scheme="light">
        <nav aria-label="Menú móvil" className="container">
          <div className="mobile-menu__top" data-menu-item>
            <Link to="/" onClick={close}>
              Inicio
            </Link>
            <Link to="/#favoritos" onClick={close}>
              Favoritos
            </Link>
            <Link to="#contacto" onClick={close}>
              Contacto
            </Link>
          </div>
          {categories.map((c) => (
            <div key={c.id} className="mobile-menu__group">
              <div data-menu-item>
                <Link to={categoryPath(c.id)} className="mobile-menu__primary" onClick={close}>
                  <span>{c.name}</span>
                  <span className="mobile-menu__count">{getProducts(c.id).length}</span>
                </Link>
              </div>
              <ul>
                {getProducts(c.id).map((p) => (
                  <li key={p.slug} data-menu-item>
                    <Link to={productPath(p)} onClick={close}>
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {wa ? (
            <div className="mobile-menu__cta" data-menu-item>
              <a className="btn btn--accent" href={wa} target="_blank" rel="noopener">
                <Icon name="whatsapp" />
                Consultar por WhatsApp
              </a>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
