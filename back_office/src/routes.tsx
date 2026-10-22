import type { ReactElement } from 'react'
import Dashboard from './pages/Dashboard'

export interface NavItem {
  path: string
  label: string
  element: ReactElement
}

// Une entrée = un lien dans la barre latérale + une route.
// Ajouter ici chaque nouvel écran du back office.
export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Tableau de bord', element: <Dashboard /> },
]
