// ============================================================================
// CONFORMITÉ BAILLEUR — CONFIGURATION PAR DÉFAUT (MOCK)
// Pièces exigées des bailleurs et options de contrat, pilotées par le Super Admin
// depuis le back office (Réclamations et paramètres → Paramètres).
// Mêmes valeurs que back_office/src/data/mock.ts (DOCUMENT_REQUIREMENTS).
// L'écran du bailleur se construit à partir de cette liste : ajouter une pièce
// côté back office l'affiche sans modifier la mini-app.
// À remplacer par GET /settings/compliance (BackendAPI.getComplianceConfig).
// ============================================================================

/**
 * @typedef {Object} DocumentRequirement
 * @property {string} id - Identifiant stable ('id_card', 'property_title'…)
 * @property {string} label - Nom de la pièce affiché au bailleur
 * @property {string} hint - Aide courte (recto/verso, ancienneté…)
 * @property {boolean} required - Obligatoire pour envoyer le dossier
 * @property {Array<'image'|'pdf'>} formats - Formats acceptés (au moins un)
 * @property {number} maxFiles - Nombre de fichiers maximum (recto + verso = 2)
 */

/** @type {{ documents: DocumentRequirement[], allowCustomContract: boolean }} */
export const COMPLIANCE_DEFAULTS = {
  documents: [
    {
      id: 'id_card',
      label: 'CNI CEDEAO ou passeport',
      hint: 'Recto et verso, bien lisibles',
      required: true,
      formats: ['image', 'pdf'],
      maxFiles: 2
    },
    {
      id: 'property_title',
      label: 'Titre de propriété ou attestation',
      hint: 'Ou mandat de gestion si vous louez pour quelqu’un',
      required: true,
      formats: ['pdf'],
      maxFiles: 1
    },
    {
      id: 'utility_bill',
      label: 'Facture Senelec ou SDE récente',
      hint: 'Moins de 3 mois · renforce la confiance des locataires',
      required: false,
      formats: ['image'],
      maxFiles: 1
    }
  ],
  // Le bailleur peut joindre son propre contrat (PDF) à un logement
  allowCustomContract: true
};
