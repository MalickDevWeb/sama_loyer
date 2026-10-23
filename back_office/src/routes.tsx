import type { ReactElement } from 'react'
import { ICONS } from './lib/utils'
import { COUNTS } from './data/mock'
import Dashboard from './pages/Dashboard'
import Bailleurs from './pages/Bailleurs'
import Validation from './pages/Validation'
import Premium from './pages/Premium'
import Transactions from './pages/Transactions'
import Reclamations from './pages/Reclamations'

export interface NavItem {
  path: string
  label: string
  icon: string
  badge?: number
  element: ReactElement
}

// Une entrée = un lien dans la barre latérale + une route.
export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Tableau de bord', icon: ICONS.dashboard, element: <Dashboard /> },
  { path: '/bailleurs', label: 'Bailleurs', icon: ICONS.users, badge: COUNTS.bailleurs, element: <Bailleurs /> },
  { path: '/validation', label: 'Validation des annonces', icon: ICONS.validate, badge: COUNTS.annonces, element: <Validation /> },
  { path: '/premium', label: 'Abonnements et Boost', icon: ICONS.star, element: <Premium /> },
  { path: '/transactions', label: 'Transactions', icon: ICONS.card, badge: COUNTS.txEchec, element: <Transactions /> },
  { path: '/reclamations', label: 'Réclamations et paramètres', icon: ICONS.flag, badge: COUNTS.reclamations, element: <Reclamations /> },
]
