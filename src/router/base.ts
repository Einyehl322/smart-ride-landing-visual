/**
 * Ruta base del despliegue. En local es "/"; en GitHub Pages es "/<repo>/"
 * (se fija con `vite build --base=...`). Las rutas de la app siempre se escriben
 * sin base ("/carplay") y aquí se traducen a la URL real y viceversa.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Ruta de la app → href real. Las anclas ("#contacto") no cambian. */
export function toHref(to: string) {
  return to.startsWith('/') ? BASE + to : to
}

/** Pathname real → ruta de la app. */
export function stripBase(pathname: string) {
  if (BASE && (pathname === BASE || pathname.startsWith(BASE + '/'))) return pathname.slice(BASE.length) || '/'
  return pathname
}
