import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Icon } from '../../components/ui/Icon'
import { ProductVisual } from '../../components/visuals/ProductVisual'
import type { Product } from '../../data/types'
import './product.css'

/**
 * Galería interactiva: botones, miniaturas, flechas del teclado y gesto de
 * deslizar en pantallas táctiles.
 */
export function ProductGallery({ product }: { product: Product }) {
  const { gallery } = product
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const start = useRef<number | null>(null)
  const count = gallery.length
  // Las fotografías de escena conservan su fondo; los recortes van sobre estudio claro.
  const surface = product.showroom ? undefined : { background: product.theme.surface }

  const go = (i: number) => {
    setIndex((i + count) % count)
    setZoomed(false)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setZoomed(false)
    else if (e.key === 'ArrowRight') go(index + 1)
    else if (e.key === 'ArrowLeft') go(index - 1)
    else return
    e.preventDefault()
  }

  const onPointerDown = (e: PointerEvent) => {
    start.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (start.current === null) return
    const dx = e.clientX - start.current
    start.current = null
    if (!zoomed && Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
  }

  return (
    <section id="galeria" className="gallery section" data-scheme="light" aria-labelledby="gallery-title">
      <div className="container">
        <div className="gallery__head">
          <div>
            <p className="eyebrow">Galería</p>
            <h2 id="gallery-title" className="t-h2">
              {count === 1 ? 'El producto, de cerca.' : 'Míralo desde cada ángulo.'}
            </h2>
          </div>
          <div className="gallery__nav">
            {gallery[index].visual.kind === 'image' ? (
              <button type="button" className="btn btn--ghost btn--sm" aria-pressed={zoomed} aria-controls={`gallery-view-${product.slug}`} onClick={() => setZoomed((v) => !v)}>
                {zoomed ? 'Restablecer' : 'Acercar imagen'}
              </button>
            ) : null}
            {count > 1 ? (
              <>
                <button className="gallery__arrow" onClick={() => go(index - 1)} aria-label="Imagen anterior">
                  <Icon name="chevron-left" />
                </button>
                <button className="gallery__arrow" onClick={() => go(index + 1)} aria-label="Imagen siguiente">
                  <Icon name="chevron-right" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div
          id={`gallery-view-${product.slug}`}
          className={`gallery__viewer ${zoomed ? 'is-zoomed' : ''}`}
          role="region"
          aria-roledescription={count > 1 ? 'carrusel' : undefined}
          aria-label={`Galería de ${product.name}`}
          tabIndex={0}
          onKeyDown={onKey}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (start.current = null)}
          style={surface}
        >
          {gallery.map((g, i) => (
            <div
              key={i}
              className={`gallery__slide ${i === index ? 'is-active' : ''}`}
              role="group"
              aria-roledescription="imagen"
              aria-label={`${i + 1} de ${count}: ${g.caption}`}
              aria-hidden={i !== index}
            >
              <div className="gallery__zoom">
                <ProductVisual visual={g.visual} focus={g.focus} sizes="(min-width: 1360px) 1300px, 96vw" />
              </div>
            </div>
          ))}
          <p className="gallery__caption" aria-live="polite">
            <span>{String(index + 1).padStart(2, '0')}</span> {gallery[index].caption}
          </p>
        </div>

        {count > 1 ? (
          <div className="gallery__thumbs" role="group" aria-label="Seleccionar imagen">
            {gallery.map((g, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={i === index}
                aria-label={g.caption}
                className="gallery__thumb"
                onClick={() => go(i)}
                style={surface}
              >
                <ProductVisual visual={g.visual} focus={g.focus} sizes="120px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
