// ============================================================================
// APPLICATION CONSTANTS — SAMA LOGEMENT
// Centralized configuration values
// ============================================================================

export const __DEV__ = true;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'app_access_token',
  USER_ROLE: 'sama_user_role', // 'client' | 'bailleur'
  FAVORITES: 'sama_favorites',
  ACTIVE_TAB: 'sama_active_tab',
};

// ============================================================================
// NAVIGATION TABS — MODE CLIENT (LOCATAIRE)
// ============================================================================
export const CLIENT_TABS = [
  {
    id: 'home',
    label: 'Chercher',
    url: '/pages/home/home',
  },
  {
    id: 'favoris',
    label: 'Favoris',
    url: '/pages/favoris/favoris',
  },
  {
    id: 'visites',
    label: 'Visites',
    url: '/pages/visites/visites',
  },
  {
    id: 'messages',
    label: 'Messages',
    badge: '3',
    url: '/pages/messages/messages',
  },
  {
    id: 'profile',
    label: 'Profil',
    url: '/pages/profile/profile',
  },
];

// ============================================================================
// NAVIGATION TABS — MODE BAILLEUR (PROPRIÉTAIRE)
// ============================================================================
export const BAILLEUR_TABS = [
  {
    id: 'b-home',
    label: 'Accueil',
    url: '/pages/bailleur/home',
  },
  {
    id: 'b-annonces',
    label: 'Annonces',
    url: '/pages/bailleur/annonces',
  },
  {
    id: 'b-ajouter',
    label: 'Ajouter',
    isSpecial: true, // Bouton central rose +
    url: '/pages/bailleur/ajouter',
  },
  {
    id: 'b-demandes',
    label: 'Demandes',
    badge: '2',
    url: '/pages/bailleur/demandes',
  },
  {
    id: 'b-premium',
    label: 'Premium',
    url: '/pages/bailleur/premium',
  },
];

// Default fallback export
export const MAIN_TABS = CLIENT_TABS;
