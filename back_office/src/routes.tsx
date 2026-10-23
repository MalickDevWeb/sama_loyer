import type { ReactElement } from 'react'
import { ICONS } from './lib/utils'
import { COUNTS } from './data/mock'
import Dashboard from './pages/Dashboard'
import Validation from './pages/Validation'
import Annonces from './pages/Annonces'
import Locations from './pages/Locations'
import Locataires from './pages/Locataires'
import Bailleurs from './pages/Bailleurs'
import Premium from './pages/Premium'
import Transactions from './pages/Transactions'
import Reclamations from './pages/Reclamations'
import Journal from './pages/Journal'

export interface NavItem {
  path: string
  label: string
  icon: string
  badge?: number
  /** Titre de groupe affiché au-dessus du lien dans la barre latérale */
  group?: string
  element: ReactElement
}

// Une entrée = un lien dans la barre latérale + une route.
export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Tableau de bord', icon: ICONS.dashboard, element: <Dashboard /> },

  { path: '/validation', label: 'Annonces à valider', icon: ICONS.validate, badge: COUNTS.annonces, group: 'Logements', element: <Validation /> },
  { path: '/annonces', label: 'Annonces en ligne', icon: ICONS.list, badge: COUNTS.annoncesAVerifier, element: <Annonces /> },
  { path: '/locations', label: 'Locations et loyers', icon: ICONS.key, badge: COUNTS.loyersRetard, element: <Locations /> },

  { path: '/locataires', label: 'Locataires', icon: ICONS.user, badge: COUNTS.locatairesSignales, group: 'Utilisateurs', element: <Locataires /> },
  { path: '/bailleurs', label: 'Bailleurs', icon: ICONS.users, badge: COUNTS.bailleurs, element: <Bailleurs /> },

  { path: '/premium', label: 'Abonnements et Boost', icon: ICONS.star, badge: COUNTS.abonnesAExpirer, group: 'Argent', element: <Premium /> },
  { path: '/transactions', label: 'Transactions', icon: ICONS.card, badge: COUNTS.txEchec, element: <Transactions /> },

  { path: '/reclamations', label: 'Réclamations et paramètres', icon: ICONS.flag, badge: COUNTS.reclamations, group: 'Plateforme', element: <Reclamations /> },
  { path: '/journal', label: "Journal d'audit", icon: ICONS.clock, element: <Journal /> },
]
