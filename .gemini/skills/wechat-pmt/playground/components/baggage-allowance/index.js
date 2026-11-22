/**
 * ============================================================================
 * COMPOSANT UI : BAGGAGE ALLOWANCE ACCORDION (Franchise Bagages Déclarative)
 * ============================================================================
 * 
 * Affiche la franchise bagages par tronçon de vol avec animation d'accordéon.
 * 
 * Particularités WeChat :
 * 1. virtualHost: true évite d'engendrer un conteneur personnalisé dans le DOM
 *    qui brise les alignements flexbox/grid de la page hôte.
 * 2. Délibérément sans données factices en dur (pas de fallback statique trompeur)
 *    pour éviter tout litige passager sur les bagages inclus.
 */

Component({
  options: {
    virtualHost: true
  },

  properties: {
    /** Permet d'afficher l'accordéon déjà déplié par défaut */
    open: {
      type: Boolean,
      value: false
    },
    /** Affiche ou masque les badges récapitulatifs dans l'en-tête */
    showSummaryBadges: {
      type: Boolean,
      value: true
    },
    /** Liste des badges d'en-tête [{ id, label, icon, tone }] */
    summary: {
      type: Array,
      value: []
    },
    /** Détail complet par tronçon [{ id, title, tag, items: [...] }] */
    routeList: {
      type: Array,
      value: []
    }
  },

  data: {
    isOpen: false
  },

  lifetimes: {
    attached() {
      if (this.properties.open) {
        this.setData({ isOpen: true });
      }
    }
  },

  methods: {
    toggleOpen() {
      this.setData({
        isOpen: !this.data.isOpen
      });
    }
  }
});

