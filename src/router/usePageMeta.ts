import { useEffect } from 'react'
import { site } from '../config/site'

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, name] = selector.match(/\[(name|property)="(.+)"\]/) ?? []
    if (key && name) el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/** Título, descripción y metadatos sociales por ruta. */
export function usePageMeta(title: string | null, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${site.brand.name}` : site.seo.defaultTitle
    const desc = description ?? site.seo.defaultDescription
    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[name="robots"]', 'content', site.seo.indexable ? 'index, follow' : 'noindex, nofollow')
    if (site.seo.siteUrl) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = site.seo.siteUrl + window.location.pathname
    }
  }, [title, description])
}
