import { createContext, use } from 'react'

export type NavKind = 'initial' | 'push' | 'pop'

export interface RouterState {
  pathname: string
  hash: string
  nav: {
    kind: NavKind
    /** true si la vista entró mediante una View Transition compartida. */
    shared: boolean
  }
}

export interface RouterValue extends RouterState {
  navigate: (to: string, opts?: { replace?: boolean }) => Promise<void>
}

export const RouterContext = createContext<RouterValue | null>(null)

export function useRouter() {
  const ctx = use(RouterContext)
  if (!ctx) throw new Error('useRouter debe usarse dentro de <RouterProvider>')
  return ctx
}
