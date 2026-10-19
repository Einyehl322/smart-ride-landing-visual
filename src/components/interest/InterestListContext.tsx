import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product } from '../../data/types'
import { normalizeSelection } from './selection'

const STORAGE_KEY = 'smartride-interest-list'

interface InterestListState {
  items: string[]
  add: (slug: string, index?: number) => void
  remove: (slug: string) => void
  toggle: (slug: string) => void
  has: (slug: string) => boolean
  count: number
  clear: () => void
  sharedSelection: boolean
}

const InterestListContext = createContext<InterestListState | null>(null)

function loadSelection() {
  let stored: string[] = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) stored = normalizeSelection(JSON.parse(raw))
  } catch {
    // corrupted storage
  }
  const incoming = normalizeSelection(new URLSearchParams(window.location.search).get('seleccion')?.split(','))
  return { items: normalizeSelection([...incoming, ...stored]), sharedSelection: incoming.length > 0 }
}

export function InterestListProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadSelection)
  const [items, setItems] = useState(initial.items)

  useEffect(() => {
    // El enlace se importa una vez; recargar no vuelve a añadir modelos eliminados.
    const url = new URL(window.location.href)
    if (url.searchParams.has('seleccion')) {
      url.searchParams.delete('seleccion')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full or unavailable
    }
  }, [items])

  const add = (slug: string, index?: number) => setItems((prev) => {
    if (prev.includes(slug)) return prev
    const next = [...prev]
    next.splice(index ?? next.length, 0, slug)
    return normalizeSelection(next)
  })
  const remove = (slug: string) => setItems((prev) => prev.filter((s) => s !== slug))
  const toggle = (slug: string) => setItems((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : normalizeSelection([...prev, slug])))
  const has = (slug: string) => items.includes(slug)
  const clear = () => setItems([])

  return (
    <InterestListContext.Provider value={{ items, add, remove, toggle, has, count: items.length, clear, sharedSelection: initial.sharedSelection }}>
      {children}
    </InterestListContext.Provider>
  )
}

export function useInterestList() {
  const ctx = useContext(InterestListContext)
  if (!ctx) throw new Error('useInterestList must be used inside InterestListProvider')
  return ctx
}

/** Get the full Product objects for the saved slugs. */
export function useInterestListProducts(getProductBySlug: (slug: string) => Product | undefined) {
  const { items } = useInterestList()
  return items.map((slug) => getProductBySlug(slug)).filter(Boolean) as Product[]
}
