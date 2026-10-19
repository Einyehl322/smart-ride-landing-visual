import { formatPEN, penParts, priceValue } from '../../data/price'
import type { Product } from '../../data/types'
import { Maybe } from '../ui/Placeholders'

type Props = { size?: 'md' | 'lg' | 'xl' } & ({ product: Product; amount?: never } | { amount: number; product?: never })

/** Precio en soles con jerarquía tipográfica: "S/" y decimales discretos, entero protagonista. */
export function Price({ product, amount: fixed, size = 'md' }: Props) {
  const amount = fixed ?? priceValue(product!)
  if (amount === null) {
    return (
      <span className={`price price--${size}`}>
        <Maybe value={product!.commerce.price} />
      </span>
    )
  }
  const { currency, integer, fraction } = penParts(amount)
  return (
    <span className={`price price--${size}`}>
      <span className="sr-only">{product?.commerce.price?.display ?? formatPEN(amount)}</span>
      <span className="price__currency" aria-hidden="true">{currency}</span>
      <span className="price__int" aria-hidden="true">{integer}</span>
      <span className="price__fraction" aria-hidden="true">.{fraction}</span>
    </span>
  )
}
