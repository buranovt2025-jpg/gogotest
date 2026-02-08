import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { CATALOG } from '../data/catalog'
import type { CatalogProduct } from '../data/catalog'
import { isApiEnabled, apiProducts } from '../api/client'

type CatalogState = {
  catalog: CatalogProduct[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

const defaultRefetch = () => {}
const defaultState: CatalogState = { catalog: CATALOG, loading: false, error: null, refetch: defaultRefetch }

const CatalogContext = createContext<CatalogState>(defaultState)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>(defaultState)

  const refetch = useCallback(() => {
    if (!isApiEnabled()) return
    setState((s) => ({ ...s, loading: true, error: null }))
    apiProducts()
      .then((list) => setState({ catalog: list, loading: false, error: null, refetch }))
      .catch((err) => setState({ catalog: [], loading: false, error: err instanceof Error ? err : new Error(String(err)), refetch }))
  }, [])

  useEffect(() => {
    if (!isApiEnabled()) return
    refetch()
  }, [refetch])

  return <CatalogContext.Provider value={{ ...state, refetch }}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogState {
  return useContext(CatalogContext)
}
