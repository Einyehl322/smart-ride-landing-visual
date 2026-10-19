import { site } from '../../config/site'
import { Link } from '../../router/Link'

/** Marca tipográfica de SMART RIDE — reemplazar por logotipo oficial cuando esté disponible. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <path d="M6 26 16 6l10 20" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M10.5 19.5c3.2-2.6 7.8-2.6 11 0" stroke="var(--c-accent)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" className="brand" aria-label={`${site.brand.name}, inicio`} onClick={onNavigate}>
      <BrandMark className="brand__mark" />
      <span className="brand__name">{site.brand.name}</span>
    </Link>
  )
}
