/**
 * Cancellation Policies Wrapper Component
 * Composant d'habillage (wrapper) utilisé sur les pages Booking et Paiement.
 * Affiche un texte d'introduction et une note de fin autour du barème statique.
 *
 * @example
 * <app-cancellation-policy />
 */
const TEXTS = {
  intro: 'Vous avez un imprévu ? Voici comment sont calculés vos remboursements en fonction de la date à laquelle vous annulez votre réservation :',
  note: '💡 Bon à savoir : Toutes les annulations sont traitées manuellement par l\'équipe ATS. Dès validation, le remboursement est effectué et vous recevrez une notification de confirmation.'
};

Component({
  options: {
    styleIsolation: "shared"
  },
  properties: {},
  data: {
    TEXTS
  },
  methods: {}
});

