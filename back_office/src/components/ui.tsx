import type { ReactNode } from 'react'
import { ICONS } from '../lib/utils'

/* ==========================================================================
   Petits composants partagés par tous les écrans du back office
   ========================================================================== */

export type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

/** Icône en trait (chemins SVG 24×24) */
export function Icon({ d, size = 18, strokeWidth = 2 }: { d: string; size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={onChange}>
      <span className="switch__knob" />
    </button>
  )
}

export function CheckMark({ on, locked = false }: { on: boolean; locked?: boolean }) {
  return (
    <span className={`check-box${on ? ' check-box--on' : ''}${locked ? ' check-box--locked' : ''}`}>
      {on && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={ICONS.check} />
        </svg>
      )}
    </span>
  )
}

/** Filtres en pastilles (un seul actif) */
export function Pills<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="pills">
      {items.map((item) => (
        <button key={item.id} type="button" className="pill" aria-pressed={value === item.id} onClick={() => onChange(item.id)}>
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size > 40 ? 17 : 13 }}>
      {initials}
    </span>
  )
}
