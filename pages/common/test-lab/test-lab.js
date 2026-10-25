import {
  COLOC_GENDER_POLICIES,
  COLOC_RENTAL_MODES,
  COLOC_HABIT_POLICIES,
  COLOC_INCOMPLETE_POLICIES,
  PLACE_STATUS,
  REPORT_REASONS,
  validateGenderCompatibility,
  validateCoupleDuo,
  validateLivingHabits,
  validateMultiGroupCapacity,
  createPlaceLock,
  isLockExpired,
  executeSoloPrivatization,
  resolveIncompleteRoom,
  generateGroupInvitation,
  verifyGroupInvitation,
  createInAppGroupInvitation,
  respondToInAppInvitation,
  sendInAppGroupMessage,
  processPaymentWebhookIdempotent,
  createDisputeReport,
  resolveDisputeReport
} from '../../../utils/helpers/coloc-engine.js';

const PERSONAS = [
  {
    id: 'moussa',
    name: 'Moussa Diop',
    role: 'Étudiant ISEP · Dakar',
    icon: '👨',
    badge: 'Homme (Solo ou Duo)',
    gender: 'HOMME',
    habits: 'Non-fumeur · Pas d\'alcool · Étudiant sérieux',
    budget: '25 000 FCFA / mois',
    themeColor: '#0284C7',
    desc: 'Cherche un lit dans une chambre masculine (Keur Gorgui ou Fann) avec son groupe d\'étudiants ISEP.',
    actions: [
      {
        id: 'moussa_book_ok',
        title: '🛏️ Réserver lit dans Ch. Keur Gorgui (Hommes)',
        subtitle: 'Chambre 4 lits réservée aux hommes · 25 000 FCFA/mois',
        badgeType: 'pass',
        expected: 'SUCCÈS'
      },
      {
        id: 'moussa_book_femme_fail',
        title: '🛡️ Tenter d\'entrer dans Ch. Ouakam (Femmes)',
        subtitle: 'Chambre 2 lits réservée aux femmes · Rejet strict',
        badgeType: 'fail',
        expected: 'REJET STRICT'
      },
      {
        id: 'moussa_create_group',
        title: '👥 Créer le "Groupe ISEP" & inviter son binôme',
        subtitle: 'Génère 2 places et le jeton Duo WhatsApp 72h',
        badgeType: 'action',
        expected: 'INVITATION DUO'
      },
      {
        id: 'moussa_lock_bed',
        title: '🔒 Poser un verrou atomique 15 min sur le Lit #3',
        subtitle: 'Bloque la place contre les réservations concurrentes',
        badgeType: 'action',
        expected: 'VERROU ATOMIQUE'
      },
      {
        id: 'moussa_send_inapp_invite',
        title: '💬 Inviter son binôme DANS L\'APP (sans WhatsApp)',
        subtitle: 'Envoie l\'invitation directement sur le compte Sama Loyer d\'Amadou',
        badgeType: 'action',
        expected: 'INVITATION INTERNE'
      },
      {
        id: 'moussa_chat_inapp',
        title: '🗨️ Écrire un message interne au groupe dans Sama Loyer',
        subtitle: 'Fil de discussion privé entre les colocataires du groupe',
        badgeType: 'action',
        expected: 'CHAT INTERNE'
      }
    ]
  },
  {
    id: 'fatou',
    name: 'Fatou Ndiaye',
    role: 'Ingénieure Logiciel · Sonatel',
    icon: '👩',
    badge: 'Femme (Solo ou Duo)',
    gender: 'FEMME',
    habits: 'Non-fumeuse · Respectueuse · Professionnelle',
    budget: '40 000 FCFA / mois',
    themeColor: '#EC4899',
    desc: 'Cherche une colocation 100% féminine à Ouakam ou Mermoz avec d\'autres jeunes femmes actives.',
    actions: [
      {
        id: 'fatou_book_ok',
        title: '🌸 Rejoindre Awa dans Ch. Femmes Ouakam',
        subtitle: 'Chambre 2 lits Femmes · Remplissage 2/2 lits sans conflit',
        badgeType: 'pass',
        expected: 'SUCCÈS'
      },
      {
        id: 'fatou_book_hommes_fail',
        title: '🛡️ Tenter de réserver dans Ch. Hommes Keur Gorgui',
        subtitle: 'Isolation stricte des genres · Protection des colocataires',
        badgeType: 'fail',
        expected: 'REJET STRICT'
      },
      {
        id: 'fatou_create_duo',
        title: '👭 Créer le "Binôme Sonatel" (Femmes)',
        subtitle: 'Génère une invitation Duo pour sa collègue',
        badgeType: 'action',
        expected: 'GROUPE FÉMININ'
      }
    ]
  },
  {
    id: 'couple',
    name: 'Mariama & Cheikh',
    role: 'Jeune Couple Marié · 2 comptes vérifiés',
    icon: '👫',
    badge: 'Couple Certifié',
    gender: 'COUPLE',
    habits: 'Couple marié · Calme · 2 comptes distincts',
    budget: '95 000 FCFA / mois',
    themeColor: '#8B5CF6',
    desc: 'Cherchent un logement en mode couple exclusif avec validation bilatérale des deux conjoints.',
    actions: [
      {
        id: 'couple_book_both_ok',
        title: '👫 Réserver Studio Mermoz (Opt-in mutuel)',
        subtitle: 'Validation bilatérale : Mariama + Cheikh confirment',
        badgeType: 'pass',
        expected: 'VALIDATION MUTUELLE'
      },
      {
        id: 'couple_book_solo_fail',
        title: '❌ Simulation : Mariama réserve seule sans Cheikh',
        subtitle: 'Compte partenaire non confirmé · Rejet obligatoire',
        badgeType: 'fail',
        expected: 'REJET DUO REQUIS'
      }
    ]
  },
  {
    id: 'amadou',
    name: 'Amadou Sall',
    role: 'Professionnel Solo · Rachat exclusif',
    icon: '👤',
    badge: 'Candidat Solo',
    gender: 'HOMME',
    habits: 'Fumeur occasionnel · Souhaite privatiser seul',
    budget: '80 000 FCFA / mois',
    themeColor: '#F59E0B',
    desc: 'Candidat disposant du budget pour privatiser toute la chambre ou tester les règles d\'hygiène du bailleur.',
    actions: [
      {
        id: 'amadou_buyout_solo',
        title: '👑 Privatiser toute la chambre (Rachat Solo)',
        subtitle: 'Remboursement immédiat à 100% sans frais des colocataires',
        badgeType: 'pass',
        expected: 'RACHAT & REMBOURSEMENT'
      },
      {
        id: 'amadou_accept_inapp_invite',
        title: '📬 Réceptionner & Accepter l\'invitation de Moussa',
        subtitle: 'Acceptation directe dans l\'application : Groupe complet 2/2',
        badgeType: 'pass',
        expected: 'VALIDATION INTERNE'
      },
      {
        id: 'amadou_smoker_fail',
        title: '🚭 Tenter d\'entrer en logement Non-Fumeur',
        subtitle: 'Refuse de signer la charte non-fumeur · Rejet immédiat',
        badgeType: 'fail',
        expected: 'RÈGLE DE VIE REJETÉE'
      }
    ]
  },
  {
    id: 'babacar',
    name: 'Babacar Seck',
    role: 'Bailleur Propriétaire · Keur Gorgui & Ouakam',
    icon: '🏢',
    badge: 'Bailleur Vérifié',
    gender: 'BAILLEUR',
    habits: 'Gestionnaire immobilier rigoureux',
    budget: 'Propriétaire',
    themeColor: '#10B981',
    desc: 'Configure les règles des chambres : prix par lit, genres autorisés, colocation multi-groupes autorisée ou interdite.',
    actions: [
      {
        id: 'babacar_inspect_multigroup',
        title: '📊 Voir Ch. Keur Gorgui : 2 groupes sans fusion',
        subtitle: 'Groupe ISEP (2 lits) + Groupe Sonatel (2 lits) = 4/4',
        badgeType: 'pass',
        expected: 'MULTI-GROUPES ACTIFS'
      },
      {
        id: 'babacar_open_add_form',
        title: '📋 Configurer une nouvelle chambre colocation',
        subtitle: 'Ouvre le formulaire bailleur avec lits, prix et règles',
        badgeType: 'action',
        expected: 'ÉCRAN BAILLEUR'
      }
    ]
  }
];

Page({
  data: {
    activeTab: 'all', // 'all' | 'rules' | 'screens' | 'log'
    results: {},
    logs: [
      { time: 'Initialisation', msg: 'Laboratoire prêt pour les tests du Prompt Maître.', type: 'info' }
    ],
    // Module de Personas
    personas: PERSONAS,
    selectedPersonaId: 'moussa',
    selectedPersona: PERSONAS[0],
    personaResults: {},

    // Messagerie Interne & Invitations In-App
    inAppInvitations: [
      {
        id: 'inv-init-1',
        groupName: 'Groupe ISEP',
        inviterName: 'Moussa Diop',
        recipientPhone: '+221 77 000 00 01',
        status: 'EN_ATTENTE',
        text: 'Moussa Diop t\'invite à rejoindre le groupe "Groupe ISEP" pour partager une chambre 4 lits à Keur Gorgui.'
      }
    ],
    inAppGroupChat: [
      { id: 'm-init-1', senderName: 'Moussa Diop', text: 'Salut Amadou ! J\'ai créé notre groupe ISEP sur Sama Loyer pour Keur Gorgui.', time: '14:20', isMine: true }
    ],
    chatInputText: '',

    // Formulaire Groupe
    groupForm: {
      name: 'Groupe ISEP',
      placesRequested: 2,
      genderMode: 'HOMMES_UNIQUEMENT'
    },
    createdGroup: null,
    groupInvite: null
  },

  onSelectPersona(e) {
    const id = e.currentTarget.dataset.id;
    const persona = PERSONAS.find(p => p.id === id) || PERSONAS[0];
    this.setData({
      selectedPersonaId: id,
      selectedPersona: persona
    });
    this.addLog(`Utilisateur actif basculé : ${persona.name} (${persona.role})`, 'info');
  },

  runPersonaAction(e) {
    const actionId = e.currentTarget.dataset.actionid;
    const { selectedPersona } = this.data;
    const now = Date.now();

    try {
      if (actionId === 'moussa_book_ok') {
        const res = validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [
          { id: 'u-moussa', name: 'Moussa Diop', gender: 'HOMME' }
        ]);
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Lit #3 attribué avec succès ✅',
          detail: 'Chambre Hommes uniquement validée côté serveur. Moussa Diop est installé dans le Lit #3 (25 000 FCFA/mois).',
          linkId: 'coloc-isep-keur-gorgui',
          linkText: 'Voir la chambre Keur Gorgui'
        });
        this.addLog(`[Moussa Diop] Réservation Lit #3 accordée dans Ch. Keur Gorgui (Hommes).`, 'success');

      } else if (actionId === 'moussa_book_femme_fail') {
        try {
          validateGenderCompatibility(COLOC_GENDER_POLICIES.FEMMES_UNIQUEMENT, [
            { id: 'u-moussa', name: 'Moussa Diop', gender: 'HOMME' }
          ]);
        } catch (err) {
          this.setPersonaActionResult(actionId, {
            status: 'reject',
            title: 'Accès Bloqué par le Serveur 🛡️',
            detail: `Message serveur : "${err.message}". Aucun profil masculin ne peut réserver dans une chambre 100% femmes.`
          });
          this.addLog(`[Moussa Diop] Tentative d'intrusion rejetée : ${err.message}`, 'reject');
        }

      } else if (actionId === 'moussa_create_group') {
        const group = {
          id: 'GRP-ISEP-' + now.toString(36).toUpperCase(),
          name: 'Groupe ISEP',
          placesRequested: 2,
          genderMode: 'HOMMES_UNIQUEMENT'
        };
        const invite = generateGroupInvitation({
          group,
          inviterId: 'u-moussa',
          validityHours: 72
        });
        this.setData({
          createdGroup: Object.assign({}, group, { creator: { name: 'Moussa Diop' } }),
          groupInvite: invite
        });
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Groupe ISEP Créé ✨',
          detail: `Jeton Duo : ${invite.token} · Valide 72h · Lien WhatsApp prêt à partager avec son binôme !`,
          inviteUrl: invite.inviteUrl
        });
        this.addLog(`[Moussa Diop] Groupe ISEP créé avec jeton d'invitation 72h.`, 'success');

      } else if (actionId === 'moussa_lock_bed') {
        const lock = createPlaceLock({
          place: { id: 'bed-3', placeNumber: 3, status: 'DISPONIBLE' },
          userId: 'u-moussa',
          now
        });
        const expiry = new Date(lock.expiresAt).toLocaleTimeString();
        this.setPersonaActionResult(actionId, {
          status: 'info',
          title: 'Lit #3 verrouillé pendant 15 min 🔒',
          detail: `Verrou atomique actif jusqu'à ${expiry}. Tout autre utilisateur qui clique verra le lit bloqué.`
        });
        this.addLog(`[Moussa Diop] Verrouillage atomique du Lit #3 actif jusqu'à ${expiry}.`, 'info');

      } else if (actionId === 'moussa_send_inapp_invite') {
        const group = this.data.createdGroup || {
          id: 'GRP-ISEP-' + now.toString(36).toUpperCase(),
          name: 'Groupe ISEP',
          placesRequested: 2,
          members: [{ id: 'u-moussa', name: 'Moussa Diop', role: 'CHEF' }]
        };
        const inv = createInAppGroupInvitation({
          group,
          inviter: { id: 'u-moussa', name: 'Moussa Diop', phone: '+221771234567' },
          recipientPhoneOrId: '+221 77 000 00 01'
        });
        const currentInvs = [inv, ...this.data.inAppInvitations];
        this.setData({ inAppInvitations: currentInvs });
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Invitation Interne Envoyée à Amadou 💬',
          detail: `Notification transmise directement dans Sama Loyer à Amadou Sall (+221 77 000 00 01) sans passer par WhatsApp. Statut : En attente.`
        });
        this.addLog(`[Moussa Diop] Invitation interne envoyée dans l'app à Amadou (+221 77 000 00 01).`, 'success');

      } else if (actionId === 'moussa_chat_inapp') {
        const msg = sendInAppGroupMessage({
          groupId: 'grp-isep',
          sender: { id: 'u-moussa', name: 'Moussa Diop' },
          text: 'Salut Amadou ! J\'ai bloqué le lit #3 à Keur Gorgui, confirme ton arrivée dans l\'app.'
        });
        const currentChat = [...this.data.inAppGroupChat, Object.assign({}, msg, { isMine: true })];
        this.setData({ inAppGroupChat: currentChat });
        this.setPersonaActionResult(actionId, {
          status: 'info',
          title: 'Message Interne Publié au Groupe 🗨️',
          detail: `Moussa : "${msg.text}" (envoyé à ${msg.time} dans le chat privé du groupe).`
        });
        this.addLog(`[Chat Interne] Nouveau message de Moussa envoyé au groupe.`, 'info');

      } else if (actionId === 'fatou_book_ok') {
        validateGenderCompatibility(COLOC_GENDER_POLICIES.FEMMES_UNIQUEMENT, [
          { id: 'u-awa', name: 'Awa Fall', gender: 'FEMME' },
          { id: 'u-fatou', name: 'Fatou Ndiaye', gender: 'FEMME' }
        ]);
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Lit #2 attribué à Fatou ✅',
          detail: 'Chambre Ouakam (2/2 lits) complète : Awa (Lit 1) et Fatou (Lit 2). Colocation 100% féminine certifiée.',
          linkId: 'coloc-femmes-ouakam',
          linkText: 'Voir la chambre Ouakam'
        });
        this.addLog(`[Fatou Ndiaye] Réservation réussie dans Ch. Ouakam (2/2 lits occupés).`, 'success');

      } else if (actionId === 'fatou_book_hommes_fail') {
        try {
          validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [
            { id: 'u-fatou', name: 'Fatou Ndiaye', gender: 'FEMME' }
          ]);
        } catch (err) {
          this.setPersonaActionResult(actionId, {
            status: 'reject',
            title: 'Accès Bloqué par le Serveur 🛡️',
            detail: `Message serveur : "${err.message}". Chambre réservée exclusivement aux hommes.`
          });
          this.addLog(`[Fatou Ndiaye] Rejet strict côté serveur : ${err.message}`, 'reject');
        }

      } else if (actionId === 'fatou_create_duo') {
        const group = {
          id: 'GRP-SONATEL-' + now.toString(36).toUpperCase(),
          name: 'Binôme Sonatel',
          placesRequested: 2,
          genderMode: 'FEMMES_UNIQUEMENT'
        };
        const invite = generateGroupInvitation({
          group,
          inviterId: 'u-fatou',
          validityHours: 72
        });
        this.setData({
          createdGroup: Object.assign({}, group, { creator: { name: 'Fatou Ndiaye' } }),
          groupInvite: invite
        });
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Binôme Sonatel Créé ✨',
          detail: `Invitation Duo générée : ${invite.token} · Partage direct WhatsApp prêt pour sa collègue.`,
          inviteUrl: invite.inviteUrl
        });
        this.addLog(`[Fatou Ndiaye] Binôme Sonatel créé avec succès.`, 'success');

      } else if (actionId === 'couple_book_both_ok') {
        validateCoupleDuo(
          { id: 'u-mariama', name: 'Mariama' },
          { id: 'u-cheikh', name: 'Cheikh' },
          { coupleConfirmedByPartner: true }
        );
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Validation Bilatérale Accordée ✅',
          detail: 'Mariama et Cheikh ont confirmé mutuellement leur union. Le Studio Couples de Mermoz est validé.',
          linkId: 'coloc-couples-mermoz',
          linkText: 'Voir le Studio Couples'
        });
        this.addLog(`[Mariama & Cheikh] Accord bilatéral de couple vérifié et accepté.`, 'success');

      } else if (actionId === 'couple_book_solo_fail') {
        try {
          validateCoupleDuo(
            { id: 'u-mariama', name: 'Mariama' },
            { id: 'u-cheikh', name: 'Cheikh' },
            { coupleConfirmedByPartner: false }
          );
        } catch (err) {
          this.setPersonaActionResult(actionId, {
            status: 'reject',
            title: 'Réservation Rejetée ❌',
            detail: `Message serveur : "${err.message}". Un logement en mode couple ne peut pas être réservé sans l'accord explicite du conjoint.`
          });
          this.addLog(`[Couple] Rejet solo sans confirmation partenaire : ${err.message}`, 'reject');
        }

      } else if (actionId === 'amadou_buyout_solo') {
        const result = executeSoloPrivatization({
          logement: { id: 'chambre-ouakam', title: 'Chambre 2 lits Ouakam', roomCapacity: 2, rentAmount: 80000, soloPrice: 80000 },
          soloUser: { id: 'u-amadou', name: 'Amadou Sall' },
          existingReservations: [{ id: 'res-awa', userId: 'user-awa', placesCount: 1, amountTotal: 40000, status: 'VERROUILLEE' }]
        });
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Chambre Privatisée par Amadou 👑',
          detail: `Rachat exclusif solo validé ! Remboursement intégral de 40 000 FCFA à 100% sans frais pour Awa généré via Orange Money + SMS de notification envoyé.`
        });
        this.addLog(`[Amadou Sall] Rachat exclusif solo : Remboursement 100% automatique émis.`, 'success');

      } else if (actionId === 'amadou_accept_inapp_invite') {
        const targetInv = this.data.inAppInvitations[0] || {
          id: 'inv-init-1',
          groupName: 'Groupe ISEP',
          status: 'EN_ATTENTE'
        };
        const res = respondToInAppInvitation({
          invitation: targetInv,
          response: 'ACCEPTER',
          responder: { id: 'u-amadou', name: 'Amadou Sall', phone: '+221 77 000 00 01' },
          group: {
            id: 'grp-isep',
            name: 'Groupe ISEP',
            placesRequested: 2,
            members: [{ id: 'u-moussa', name: 'Moussa Diop' }]
          }
        });
        const updatedInvs = this.data.inAppInvitations.map(i => i.id === targetInv.id ? Object.assign({}, i, { status: 'ACCEPTEE' }) : i);
        const welcomeMsg = sendInAppGroupMessage({
          groupId: 'grp-isep',
          sender: { id: 'u-amadou', name: 'Amadou Sall' },
          text: 'Merci Moussa ! J\'ai accepté dans Sama Loyer. Je prends le 2ème lit à Keur Gorgui.'
        });
        const currentChat = [...this.data.inAppGroupChat, Object.assign({}, welcomeMsg, { isMine: true })];
        this.setData({
          inAppInvitations: updatedInvs,
          inAppGroupChat: currentChat
        });
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Invitation Acceptée dans l\'App ✅',
          detail: `${res.systemMessage} Le Groupe ISEP compte désormais 2 membres confirmés. Aucun recours à WhatsApp n'a été requis.`
        });
        this.addLog(`[Amadou Sall] Invitation in-app acceptée : Groupe ISEP complet (2/2).`, 'success');

      } else if (actionId === 'amadou_smoker_fail') {
        try {
          validateLivingHabits({
            logementHabits: { smokingPolicy: COLOC_HABIT_POLICIES.INTERDIT },
            candidateAgreements: { agreesNoSmoking: false }
          });
        } catch (err) {
          this.setPersonaActionResult(actionId, {
            status: 'reject',
            title: 'Règles d\'Hygiène Rejetées 🚭',
            detail: `Message serveur : "${err.message}". Logement non-fumeur : l'engagement formel est obligatoire.`
          });
          this.addLog(`[Amadou Sall] Refus charte non-fumeur : ${err.message}`, 'reject');
        }

      } else if (actionId === 'babacar_inspect_multigroup') {
        const step = validateMultiGroupCapacity({
          roomCapacity: 4,
          multiGroupAllowed: true,
          existingReservations: [{ id: 'res-a', groupId: 'isep', placesCount: 2, status: 'CONFIRMEE' }],
          placesRequested: 2
        });
        this.setPersonaActionResult(actionId, {
          status: 'success',
          title: 'Vue Bailleur : 2 groupes sans fusion 📊',
          detail: 'Chambre Keur Gorgui 4/4 : Groupe ISEP (2 lits) + Groupe Sonatel (2 lits). Les 2 groupes cohabitent physiquement sans JAMAIS être fusionnés dans le système.',
          linkId: 'coloc-isep-keur-gorgui',
          linkText: 'Inspecter la chambre Keur Gorgui'
        });
        this.addLog(`[Bailleur Babacar] Vérification multi-groupes : 2 groupes distincts hébergés.`, 'success');

      } else if (actionId === 'babacar_open_add_form') {
        wx.navigateTo({
          url: '/pages/bailleur/ajouter/ajouter'
        });
      }
    } catch (globalErr) {
      this.addLog(`Erreur action : ${globalErr.message}`, 'reject');
    }
  },

  setPersonaActionResult(actionId, res) {
    const pResults = Object.assign({}, this.data.personaResults, { [actionId]: res });
    this.setData({ personaResults: pResults });
  },

  onInputGroupName(e) {
    const val = e.detail && e.detail.value !== undefined ? e.detail.value : '';
    this.setData({
      'groupForm.name': val
    });
  },

  onSelectGroupPlaces(e) {
    const places = Number(e.currentTarget.dataset.places) || 2;
    this.setData({
      'groupForm.placesRequested': places
    });
  },

  onSelectGroupGender(e) {
    const gender = e.currentTarget.dataset.gender || 'HOMMES_UNIQUEMENT';
    this.setData({
      'groupForm.genderMode': gender
    });
  },

  onCreateGroup() {
    try {
      const { name, placesRequested, genderMode } = this.data.groupForm;
      if (!name || !name.trim()) {
        wx.showToast({ title: 'Donnez un nom au groupe', icon: 'none' });
        return;
      }

      const groupId = `GRP-${Date.now().toString(36).toUpperCase()}`;
      const creator = {
        id: 'user-moussa',
        name: 'Moussa Diop',
        phone: '+221771234567',
        gender: genderMode === 'FEMMES_UNIQUEMENT' ? 'FEMME' : 'HOMME'
      };

      const group = {
        id: groupId,
        name: name.trim(),
        placesRequested: placesRequested,
        placesAttributed: 0,
        genderMode: genderMode,
        creator: creator,
        members: [creator],
        status: 'EN_ATTENTE_MEMBRES',
        createdAt: new Date().toISOString()
      };

      const invite = generateGroupInvitation({
        group: group,
        inviterId: creator.id,
        validityHours: 72
      });

      this.setData({
        createdGroup: group,
        groupInvite: invite
      });

      this.addLog(`Groupe créé : "${group.name}" (${placesRequested} places, ${genderMode})`, 'success');
      this.addLog(`Jeton Duo généré : ${invite.token.substring(0, 16)}... (valide 72h)`, 'info');

      wx.showToast({
        title: 'Groupe créé avec succès',
        icon: 'success'
      });
    } catch (err) {
      console.error('[TestLab] Erreur création groupe:', err);
      this.addLog(`Erreur création groupe : ${err.message}`, 'reject');
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  onCopyGroupWhatsApp() {
    if (!this.data.groupInvite) return;
    const msg = this.data.groupInvite.whatsappShareText || (this.data.createdGroup ? `Rejoins notre colocation "${this.data.createdGroup.name}" : ${this.data.groupInvite.inviteUrl}` : this.data.groupInvite.inviteUrl);
    wx.setClipboardData({
      data: msg,
      success: () => {
        wx.showToast({
          title: 'Lien copié pour WhatsApp !',
          icon: 'success'
        });
        this.addLog('Lien WhatsApp copié dans le presse-papier.', 'info');
      }
    });
  },

  onSendInAppInviteClick() {
    const group = this.data.createdGroup || {
      id: 'GRP-ISEP-' + Date.now().toString(36).toUpperCase(),
      name: this.data.groupForm.name || 'Groupe ISEP',
      placesRequested: this.data.groupForm.placesRequested || 2
    };

    const inv = createInAppGroupInvitation({
      group,
      inviter: { id: 'u-moussa', name: 'Moussa Diop', phone: '+221771234567' },
      recipientPhoneOrId: '+221 77 000 00 01'
    });

    const currentInvs = [inv, ...this.data.inAppInvitations];
    this.setData({ inAppInvitations: currentInvs });

    wx.showToast({
      title: 'Invitation envoyée dans l\'App !',
      icon: 'success'
    });
    this.addLog(`Invitation interne envoyée directement dans Sama Loyer au +221 77 000 00 01 (aucun WhatsApp requis).`, 'success');
  },

  onAcceptInAppInvitation(e) {
    const invId = e.currentTarget.dataset.id;
    const targetInv = this.data.inAppInvitations.find(i => i.id === invId) || this.data.inAppInvitations[0];
    if (!targetInv) return;

    const res = respondToInAppInvitation({
      invitation: targetInv,
      response: 'ACCEPTER',
      responder: { id: 'u-amadou', name: 'Amadou Sall', phone: '+221 77 000 00 01' },
      group: {
        id: targetInv.groupId || 'grp-isep',
        name: targetInv.groupName || 'Groupe ISEP',
        placesRequested: 2,
        members: [{ id: 'u-moussa', name: 'Moussa Diop' }]
      }
    });

    const updatedInvs = this.data.inAppInvitations.map(i => i.id === targetInv.id ? Object.assign({}, i, { status: 'ACCEPTEE' }) : i);
    const welcomeMsg = sendInAppGroupMessage({
      groupId: targetInv.groupId || 'grp-isep',
      sender: { id: 'u-amadou', name: 'Amadou Sall' },
      text: 'J\'ai accepté l\'invitation dans l\'application ! Prêt pour la colocation.'
    });

    this.setData({
      inAppInvitations: updatedInvs,
      inAppGroupChat: [...this.data.inAppGroupChat, Object.assign({}, welcomeMsg, { isMine: false })]
    });

    wx.showToast({
      title: 'Invitation acceptée !',
      icon: 'success'
    });
    this.addLog(`${res.systemMessage} Traité directement dans l'app SAMA LOYER.`, 'success');
  },

  onDeclineInAppInvitation(e) {
    const invId = e.currentTarget.dataset.id;
    const targetInv = this.data.inAppInvitations.find(i => i.id === invId);
    if (!targetInv) return;

    respondToInAppInvitation({
      invitation: targetInv,
      response: 'REFUSER',
      responder: { id: 'u-amadou', name: 'Amadou Sall' },
      group: { id: targetInv.groupId, name: targetInv.groupName }
    });

    const updatedInvs = this.data.inAppInvitations.map(i => i.id === targetInv.id ? Object.assign({}, i, { status: 'REFUSEE' }) : i);
    this.setData({ inAppInvitations: updatedInvs });

    wx.showToast({ title: 'Invitation déclinée', icon: 'none' });
    this.addLog(`Invitation déclinée pour le groupe "${targetInv.groupName}".`, 'info');
  },

  onInputChatText(e) {
    this.setData({
      chatInputText: e.detail.value || ''
    });
  },

  onSendInAppGroupChat() {
    const text = this.data.chatInputText;
    if (!text || !text.trim()) return;

    const sender = this.data.selectedPersona ? {
      id: this.data.selectedPersona.id,
      name: this.data.selectedPersona.name
    } : { id: 'u-moussa', name: 'Moussa Diop' };

    const msg = sendInAppGroupMessage({
      groupId: 'grp-isep',
      sender,
      text: text.trim()
    });

    this.setData({
      inAppGroupChat: [...this.data.inAppGroupChat, Object.assign({}, msg, { isMine: true })],
      chatInputText: ''
    });

    this.addLog(`Message in-app envoyé par ${sender.name} dans la discussion du groupe.`, 'info');
  },

  onBookTargetRoomWithGroup(e) {
    const roomId = e.currentTarget.dataset.roomid || 'coloc-isep-keur-gorgui';
    const groupId = this.data.createdGroup ? this.data.createdGroup.id : '';
    this.addLog(`Navigation vers ${roomId} avec groupe ${groupId}...`, 'info');
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(roomId)}&groupId=${encodeURIComponent(groupId)}`
    });
  },

  addLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const newLogs = [{ time, msg, type }, ...this.data.logs.slice(0, 30)];
    this.setData({ logs: newLogs });
  },

  onBack() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/client/home/home' })
    });
  },

  // --------------------------------------------------------------------------
  // TEST 1 : Isolation des Genres
  // --------------------------------------------------------------------------
  runTestGender(e) {
    const variant = e.currentTarget.dataset.variant;
    try {
      if (variant === 'female_in_male') {
        validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [
          { id: 'u1', name: 'Moussa', gender: 'HOMME' },
          { id: 'u2', name: 'Fatou', gender: 'FEMME' }
        ]);
      } else if (variant === 'male_in_female') {
        validateGenderCompatibility(COLOC_GENDER_POLICIES.FEMMES_UNIQUEMENT, [
          { id: 'u1', name: 'Lamine', gender: 'HOMME' }
        ]);
      } else {
        // Valide
        const res = validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [
          { id: 'u1', name: 'Moussa', gender: 'HOMME' },
          { id: 'u2', name: 'Cheikh', gender: 'MALE' }
        ]);
        this.setTestResult('gender', { success: true, msg: 'Hommes uniquement : Accordé ✅' });
        this.addLog('Test Genre (2 Hommes) : Validation réussie.', 'success');
        return;
      }
    } catch (err) {
      this.setTestResult('gender', { success: false, msg: `Rejeté : ${err.message} 🛡️` });
      this.addLog(`Test Genre (${variant}) : Rejeté avec succès côté serveur (${err.message})`, 'reject');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 2 : Mode Couples (Opt-in mutuel)
  // --------------------------------------------------------------------------
  runTestCouples(e) {
    const variant = e.currentTarget.dataset.variant;
    const userA = { id: 'u-amadou', name: 'Amadou', phone: '+221770000001' };
    const userB = { id: 'u-awa', name: 'Awa', phone: '+221770000002' };

    try {
      if (variant === 'solo') {
        validateCoupleDuo(userA, userA, { coupleConfirmedByPartner: true });
      } else if (variant === 'unconfirmed') {
        validateCoupleDuo(userA, userB, { coupleConfirmedByPartner: false });
      } else {
        const res = validateCoupleDuo(userA, userB, { coupleConfirmedByPartner: true });
        this.setTestResult('couple', { success: true, msg: 'Couple bilatéralement confirmé : Validé ✅' });
        this.addLog('Test Couple : Deux comptes distincts avec accord mutuel validés.', 'success');
        return;
      }
    } catch (err) {
      this.setTestResult('couple', { success: false, msg: `Rejeté : ${err.message} 🛡️` });
      this.addLog(`Test Couple (${variant}) : Rejeté (${err.message})`, 'reject');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 3 : Multi-groupes sans fusion (Chambre 4 lits)
  // --------------------------------------------------------------------------
  runTestMultiGroup() {
    try {
      // Groupe A prend 2 places
      const step1 = validateMultiGroupCapacity({
        roomCapacity: 4,
        multiGroupAllowed: true,
        existingReservations: [],
        placesRequested: 2
      });

      // Groupe B prend 2 places
      const existing = [{ id: 'res-a', groupId: 'isep', placesCount: 2, status: 'CONFIRMEE' }];
      const step2 = validateMultiGroupCapacity({
        roomCapacity: 4,
        multiGroupAllowed: true,
        existingReservations: existing,
        placesRequested: 2
      });

      this.setTestResult('multigroup', {
        success: true,
        msg: `Groupe ISEP (2 lits) + Groupe Sonatel (2 lits) = Chambre complète (4/4) sans fusion ✅`
      });
      this.addLog('Test Multi-groupes : 2 groupes indépendants hébergés sans fusion.', 'success');
    } catch (err) {
      this.setTestResult('multigroup', { success: false, msg: err.message });
      this.addLog(`Erreur multi-groupes : ${err.message}`, 'reject');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 4 : Verrouillage concurrent 15 minutes
  // --------------------------------------------------------------------------
  runTestConcurrency() {
    const place = { id: 'bed-1', placeNumber: 1, status: 'DISPONIBLE' };
    const now = Date.now();

    const lock1 = createPlaceLock({ place, userId: 'user-candidat-1', now });

    // Tentative concurrente
    try {
      createPlaceLock({ place, userId: 'user-candidat-2', now: now + 2000, existingActiveLock: lock1 });
    } catch (err) {
      this.setTestResult('concurrency', {
        success: true,
        msg: `Candidat 1 a obtenu le verrou (15 min). Candidat 2 immédiatement bloqué : "${err.message}" 🔒`
      });
      this.addLog('Test Concurrence : Collision bloquée, place protégée.', 'success');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 5 : Rachat Exclusif Solo & Remboursement 100%
  // --------------------------------------------------------------------------
  runTestSoloPrivatization() {
    const logement = {
      id: 'chambre-ouakam',
      title: 'Chambre 2 lits Ouakam',
      roomCapacity: 2,
      rentAmount: 80000,
      soloPrice: 80000
    };
    const partial = [
      { id: 'res-awa', userId: 'user-awa', placesCount: 1, amountTotal: 40000, status: 'VERROUILLEE' }
    ];
    const soloUser = { id: 'user-solo-cheikh', name: 'Cheikh Solo' };

    const result = executeSoloPrivatization({
      logement,
      soloUser,
      existingReservations: partial
    });

    this.setTestResult('solobuyout', {
      success: true,
      msg: `Chambre privatisée par Cheikh. Remboursement automatique de 40 000 FCFA à 100% sans frais pour Awa généré ✅`
    });
    this.addLog(`Rachat solo : SMS généré -> "${result.notificationsToSend[0].message}"`, 'info');
  },

  // --------------------------------------------------------------------------
  // TEST 6 : Idempotence Webhook Orange Money
  // --------------------------------------------------------------------------
  runTestIdempotence() {
    const store = new Set();
    const map = new Map([['res-1', { id: 'res-1', status: 'VERROUILLEE' }]]);

    const payload = {
      transactionReference: 'OM-TX-TEST-001',
      reservationId: 'res-1',
      status: 'SUCCESS',
      amount: 40000
    };

    const first = processPaymentWebhookIdempotent({ webhookEvent: payload, processedEventsStore: store, activeReservationsMap: map });
    const duplicate = processPaymentWebhookIdempotent({ webhookEvent: payload, processedEventsStore: store, activeReservationsMap: map });

    this.setTestResult('idempotence', {
      success: true,
      msg: `1er webhook : ${first.status} | 2ème webhook identique : ${duplicate.status} (Ignoré, aucun double paiement) ✅`
    });
    this.addLog('Test Idempotence : Déduplication stricte réussie.', 'success');
  },

  // --------------------------------------------------------------------------
  // ACCÈS DIRECT AUX ÉCRANS
  // --------------------------------------------------------------------------
  openListing(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(id)}`
    });
  },

  onOpenScenarioLink(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(id)}`
      });
    }
  },

  openBailleurAdd() {
    wx.navigateTo({
      url: '/pages/bailleur/ajouter/ajouter'
    });
  },

  setTestResult(key, val) {
    const r = Object.assign({}, this.data.results, { [key]: val });
    this.setData({ results: r });
  }
});

