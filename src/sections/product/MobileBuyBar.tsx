import { useEffect, useState } from 'react'
import { ContactActions } from '../../components/ui/ContactActions'
import { Maybe } from '../../components/ui/Placeholders'
import type { Product } from '../../data/types'
import './product.css'

/** Barra comercial inferior en móvil: aparece al dejar atrás el hero. */
export function MobileBuyBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - window.innerHeight * 0.9
      setVisible(window.scrollY > window.innerHeight * 0.8 && !nearEnd)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`buybar ${visible ? 'is-visible' : ''}`} data-scheme="light" aria-hidden={!visible} inert={!visible}>
      <div className="buybar__info">
        <strong>{product.name}</strong>
        <span>
          <Maybe value={product.commerce.price} />
        </span>
      </div>
      <ContactActions product={product} size="sm" />
    </div>
  )
}
