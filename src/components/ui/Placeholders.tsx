/**
 * Marcadores visibles para contenido pendiente de información oficial.
 *
 * Reglas:
 * - Valor confirmado → se muestra directamente.
 * - Valor pendiente → se muestra "Consultar" (no "Pendiente").
 * - Valor con discrepancia → se muestra el valor del catálogo.
 * Buscar "Pending" / "DemoBadge" / "SpecValue" en el código localiza todo lo que falta.
 */
import type { ReactNode } from 'react'
import type { SpecCell } from '../../data/types'

export function DemoBadge({ children = 'Modelo demostrativo' }: { children?: ReactNode }) {
  return <span className="demo-badge">{children}</span>
}

export function Pending({ label = 'Consultar', block }: { label?: string; block?: boolean }) {
  return <span className={`pending ${block ? 'pending--block' : ''}`}>{label}</span>
}

/** Muestra el valor si está confirmado; si es pendiente, "Consultar". */
export function Maybe({ value, block }: { value: SpecCell; block?: boolean }) {
  if (!value) return <Pending label="Consultar" block={block} />
  if (value.status === 'pending') return <Pending label="Consultar" block={block} />
  // confirmed o discrepancy → mostrar el valor
  return <>{value.display}</>
}

/** Extrae el display de un SpecCell para usarlo como string (ej. precios en mensajes). */
export function specDisplay(value: SpecCell): string | null {
  if (!value || value.status === 'pending') return null
  return value.display
}
