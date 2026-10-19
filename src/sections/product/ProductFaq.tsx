import { Maybe } from '../../components/ui/Placeholders'
import { Icon } from '../../components/ui/Icon'
import type { Product } from '../../data/types'
import './product.css'

/** Preguntas frecuentes con <details> nativo (accesible y sin JavaScript). */
export function ProductFaq({ product }: { product: Product }) {
  return (
    <section id="faq" className="faq section" data-scheme="light" aria-labelledby="faq-title">
      <div className="container faq__layout">
        <div>
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2 id="faq-title" className="t-h2">
            Antes de decidir.
          </h2>
        </div>
        <div className="faq__list">
          {product.faqs.map((f) => (
            <details key={f.question} className="faq__item" name="faq">
              <summary>
                <span>{f.question}</span>
                <Icon name="plus" className="faq__icon" />
              </summary>
              <div className="faq__answer">
                <p>
                  <Maybe value={f.answer} />
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
