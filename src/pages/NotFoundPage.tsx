import { Icon } from '../components/ui/Icon'
import { Link } from '../router/Link'
import { usePageMeta } from '../router/usePageMeta'
import './pages.css'

export function NotFoundPage() {
  usePageMeta('Página no encontrada')
  return (
    <section className="notfound" data-scheme="light" aria-labelledby="nf-title">
      <div className="container">
        <p className="eyebrow">Error 404</p>
        <h1 id="nf-title" className="t-display">
          Esta ruta no existe.
        </h1>
        <p className="t-lead">Puede que el enlace haya cambiado o que el modelo ya no esté en el catálogo.</p>
        <Link to="/" className="btn btn--primary">
          Volver al inicio
          <Icon name="arrow" />
        </Link>
      </div>
    </section>
  )
}
