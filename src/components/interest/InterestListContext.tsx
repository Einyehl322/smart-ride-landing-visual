import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product } from '../../data/types'

const STORAGE_KEY = 'smartride-interest-list'

interface InterestListState {
  items: string[]
  add: (slug: string) => void
  remove: (slug: string) => void
  toggle: (slug: string) => void
  has: (slug: string) => boolean
  count: number
  clear: () => void
}

const InterestListContext = createContext<InterestListState | null>(null)

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as string[]
      return Array.isArray(parsed) ? parsed : []
    }
  } catch {
    // corrupted storage
  }
  return []
}

export function InterestListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>(loadFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full or unavailable
    }
  }, [items])

  const add = (slug: string) => setItems((prev) => (prev.includes(slug) ? prev : [...prev, slug]))
  const remove = (slug: string) => setItems((prev) => prev.filter((s) => s !== slug))
  const toggle = (slug: string) => setItems((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  const has = (slug: string) => items.includes(slug)
  const clear = () => setItems([])

  return (
    <InterestListContext.Provider value={{ items, add, remove, toggle, has, count: items.length, clear }}>
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
