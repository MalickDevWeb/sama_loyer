/**
 * Cancellation Schedule Component
 * Composant central gérant l'affichage du barème d'annulation.
 * Affiche la liste des règles de retenue en fonction des jours restants.
 *
 * @example
 * <!-- Mode Statique Annulation -->
 * <app-cancellation-schedule />
 * 
 * <!-- Mode Dynamique Annulation (avec surbrillance du palier actif) -->
 * <app-cancellation-schedule departureDate="2026-12-25" />
 *
 * @property {string} departureDate - Date de départ au format YYYY-MM-DD (optionnel).
 */

// Définition centrale des paliers d'annulation. 
// C'est ici qu'il faut modifier les pourcentages ou les textes si les règles commerciales changent.
const CANCELLATION_BANDS = [
  { label: '30 jours ou plus avant le départ\u00A0:', value: 'Remboursement intégral (0 % de frais)', defaultClass: 'success' },
  { label: 'Entre 10 et 29 jours avant\u00A0:', value: '90 % remboursés (10 % de frais)', defaultClass: 'warning' },
  { label: 'Entre 7 et 9 jours avant\u00A0:', value: '70 % remboursés (30 % de frais)', defaultClass: 'warning' },
  { label: 'Entre 3 et 6 jours avant\u00A0:', value: '50 % remboursés (50 % de frais)', defaultClass: 'warning' },
  { label: 'Moins de 3 jours avant\u00A0:', value: 'Non remboursable (100 % de frais)', defaultClass: 'danger' },
];

/**
 * Calcule le nombre de jours pleins restants entre aujourd'hui et la date de départ.
 */
function getDaysBeforeDeparture(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const departure = new Date(`${value.substring(0, 10)}T00:00:00`);
  if (Number.isNaN(departure.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((departure.getTime() - today.getTime()) / 86400000);
}

function getCancellationBandIndex(days) {
  return days < 3 ? 4 : days < 7 ? 3 : days < 10 ? 2 : days < 30 ? 1 : 0;
}

Component({
  options: { styleIsolation: "shared" },
  properties: {
    departureDate: { type: String, value: '' }
  },
  data: {
    bands: [],
    daysBeforeDeparture: null,
    hasDepartureDate: false,
    activeBandIndex: -1
  },
  
  lifetimes: {
    attached() {
      this.updateBands();
    }
  },

  observers: {
    'departureDate': function(departureDate) {
      this.updateBands(departureDate);
    }
  },

  methods: {
    updateBands(departureDate = this.properties.departureDate) {
      const days = getDaysBeforeDeparture(departureDate);
      const hasDepartureDate = days !== null;
      let activeIndex = -1;

      if (hasDepartureDate) {
        activeIndex = getCancellationBandIndex(days);
      }

      this.setData({
        daysBeforeDeparture: days,
        hasDepartureDate: hasDepartureDate,
        activeBandIndex: activeIndex,
        bands: CANCELLATION_BANDS.map((band, index) => ({
          ...band,
          active: index === activeIndex
        }))
      });
    }
  }
});
