// pages/bailleur/profil/profil.js
// Onglet « Profil » du bailleur :
// - Consultation et gestion des abonnements (Premium Max it, mise en avant)
// - Informations du profil centralisées depuis la page d'accueil
// - Bouton de changement de profil vers le profil Locataire
// - Aide, sécurité et assistance client Max it
import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import {
  getBailleurAccount,
  BAILLEUR_PLANS,
  formatLongDate,
  requireBailleurAccess,
  getBailleurKyc,
  getComplianceConfig,
  getMissingKycDocuments,
  setBailleurKycDocument,
  submitBailleurKyc,
  setBailleurKycStatus
} from '../../../utils/helpers/store';
import { backendAPI } from '../../../utils/apis/index';
import { pickImages, pickPdfs, pickDocumentFiles, openPickedFile, formatsLabel } from '../../../utils/helpers/file-picker';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';

function initialsOf(name) {
  return String(name || '').trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || 'B';
}

function formatPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length === 9 ? `+221 ${d.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` : phone;
}

// Une ligne par pièce exigée par le Super Admin, avec les fichiers déjà ajoutés
function kycDocRows(kyc, config) {
  const docs = kyc.documents || {};
  return config.documents.map((d) => {
    const files = docs[d.id] || [];
    return {
      id: d.id,
      label: d.label,
      hint: d.hint,
      required: d.required,
      formatsText: formatsLabel(d.formats),
      maxFiles: d.maxFiles,
      files,
      done: files.length > 0,
      filesText: files.length > 1 ? `${files.length} fichiers` : (files[0] ? files[0].name : '')
    };
  });
}

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    statusBarHeight: 44,
    activeModal: null, // 'help' | 'security' | 'support' | 'contrat' | 'fileSource' | 'kycSuccess' | null
    targetDocId: '',
    targetDocMaxFiles: 1,
    stats: {
      annonces: 3,
      demandes: 4,
      locataires: 2
    },
    profile: {
      fullName: 'Moussa Diop',
      initials: 'MD',
      phone: '+221 77 123 45 67',
      publication: 'Instantanée'
    },
    subscription: {
      plan: 'Premium mensuel',
      active: true,
      until: '15 novembre 2026',
      highlights: '2 annonces sur 3 mises en avant'
    },
    kyc: {
      status: 'verified', // 'verified' | 'pending' | 'unverified'
      documents: {}
    },
    // Pièces exigées (config Super Admin) et état du dossier
    kycDocs: [],
    kycMissingCount: 0,
    kycSentCount: 0,
    kycEditing: false // dossier vérifié rouvert pour mettre à jour une pièce
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 44 });
    } catch (e) {}
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
    setCustomTabBarActive(this, 'b-profil');
    this.loadAccount();
    // Les pièces exigées peuvent avoir changé côté back office : on rafraîchit la liste
    backendAPI.getComplianceConfig().then(() => this.loadKyc()).catch(() => {});
  },

  // Dossier KYC construit à partir des pièces exigées par le Super Admin
  loadKyc() {
    const kyc = getBailleurKyc();
    const config = getComplianceConfig();
    const kycDocs = kycDocRows(kyc, config);
    this.setData({
      kyc,
      kycDocs,
      kycMissingCount: getMissingKycDocuments(kyc, config).length,
      kycSentCount: kycDocs.filter((d) => d.done).length
    });
  },

  // Récupère les informations du compte bailleur depuis le store local
  loadAccount() {
    this.loadKyc();
    const account = getBailleurAccount();
    if (!account) return;
    const plan = BAILLEUR_PLANS[account.plan] || BAILLEUR_PLANS.trial;
    const active = account.expiresAt > Date.now();
    this.setData({
      'profile.fullName': account.fullName || 'Moussa Diop',
      'profile.initials': initialsOf(account.fullName || 'Moussa Diop'),
      'profile.phone': formatPhone(account.phone || '771234567'),
      subscription: {
        plan: account.plan === 'trial' ? 'Essai gratuit 30 jours' : plan.label,
        active,
        until: formatLongDate(account.expiresAt),
        highlights: account.plan === 'trial'
          ? 'Passez à Pro avant la fin de l’essai pour préserver vos avantages'
          : '3 annonces mises en avant · Paiement récurrent Max it'
      }
    });
  },

  // Ajoute une pièce : photo, PDF ou les deux selon ce qu'exige le Super Admin
  onAddKycDocument(e) {
    const id = e.currentTarget.dataset.id;
    const doc = getComplianceConfig().documents.find((d) => d.id === id);
    if (!doc) return;

    const formats = Array.isArray(doc.formats) && doc.formats.length ? doc.formats : ['image'];
    const allowsImage = formats.includes('image');
    const allowsPdf = formats.includes('pdf');
    const maxFiles = doc.maxFiles || 1;

    // Si les deux formats sont possibles, ouvrir notre bottom-sheet design SAMA LOYER
    if (allowsImage && allowsPdf) {
      this.setData({
        activeModal: 'fileSource',
        targetDocId: id,
        targetDocMaxFiles: maxFiles
      });
      return;
    }

    // Sinon ouvrir directement le format imposé par le Super Admin
    if (allowsPdf) {
      this._importKycFiles(id, maxFiles, () => pickPdfs(maxFiles));
    } else {
      this._importKycFiles(id, maxFiles, () => pickImages(maxFiles));
    }
  },

  onSelectSourceImage() {
    const id = this.data.targetDocId;
    const max = this.data.targetDocMaxFiles || 1;
    this.setData({ activeModal: null });
    this._importKycFiles(id, max, () => pickImages(max));
  },

  onSelectSourcePdf() {
    const id = this.data.targetDocId;
    const max = this.data.targetDocMaxFiles || 1;
    this.setData({ activeModal: null });
    this._importKycFiles(id, max, () => pickPdfs(max));
  },

  _importKycFiles(id, maxFiles, pickerFn) {
    pickerFn()
      .then((files) => {
        if (!files || !files.length) return;
        setBailleurKycDocument(id, files.slice(0, maxFiles));
        this.loadKyc();
      })
      .catch((err) => {
        const isCancel = err && (err.errMsg === 'chooseMedia:fail cancel' || err.errMsg === 'chooseMessageFile:fail cancel');
        if (isCancel) return;
        const pdfOnly = err && err.message === 'PDF_UNSUPPORTED';
        wx.showToast({
          title: pdfOnly ? 'Envoi de PDF indisponible sur cette version de Max it' : 'Impossible d’ouvrir le fichier',
          icon: 'none'
        });
      });
  },

  onViewKycDocument(e) {
    const row = this.data.kycDocs.find((d) => d.id === e.currentTarget.dataset.id);
    if (row && row.files[0]) openPickedFile(row.files[0]);
  },

  onRemoveKycDocument(e) {
    setBailleurKycDocument(e.currentTarget.dataset.id, []);
    this.loadKyc();
  },

  // Envoie le dossier complet au Super Admin pour vérification
  onSubmitKyc() {
    const result = submitBailleurKyc();
    if (!result.ok) {
      wx.showToast({ title: `Il manque : ${result.missing[0].label}`, icon: 'none', duration: 2500 });
      return;
    }
    wx.showLoading({ title: 'Envoi du dossier...' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        kycEditing: false,
        activeModal: 'kycSuccess'
      });
      this.loadKyc();
    }, 700);
  },

  // Dossier déjà vérifié : rouvrir la liste pour remplacer une pièce
  onEditKyc() {
    this.setData({ kycEditing: true });
  },

  onCancelEditKyc() {
    this.setData({ kycEditing: false });
  },

  // Raccourci de démonstration pour basculer facilement entre les 3 statuts KYC
  onToggleKycForDemo() {
    const current = this.data.kyc.status;
    const nextStatus = current === 'verified' ? 'unverified' : current === 'unverified' ? 'pending' : 'verified';
    setBailleurKycStatus(nextStatus);
    this.loadAccount();
    const labels = {
      unverified: 'Statut : Non vérifié (envoi CNI requis)',
      pending: 'Statut : En cours de validation Admin',
      verified: 'Statut : Vérifié (Bailleur certifié)'
    };
    wx.showToast({ title: labels[nextStatus], icon: 'none', duration: 2500 });
  },

  onGoAnnonces() {
    wx.redirectTo({ url: '/pages/bailleur/annonces/annonces' });
  },

  onGoDemandes() {
    wx.redirectTo({ url: '/pages/bailleur/demandes/demandes' });
  },

  onGoLocataires() {
    wx.redirectTo({ url: '/pages/bailleur/locataires/locataires' });
  },

  // Gestion des abonnements
  onManageSubscription() {
    wx.navigateTo({ url: '/pages/bailleur/premium/premium' });
  },

  // Gestion des horaires de visite
  onOpenHoraires() {
    wx.navigateTo({ url: '/pages/bailleur/horaires/horaires' });
  },

  // Basculer vers le profil locataire
  onSwitchToClient() {
    wx.showLoading({ title: 'Chargement...' });
    storage.set(STORAGE_KEYS.USER_ROLE, 'client');
    setTimeout(() => {
      wx.hideLoading();
      wx.reLaunch({ url: '/pages/client/home/home' });
    }, 400);
  },

  // Modals Aide & Support & Contrat
  onOpenContratInfo() {
    this.setData({ activeModal: 'contrat' });
  },

  onOpenHelp() {
    this.setData({ activeModal: 'help' });
  },

  onOpenSecurity() {
    this.setData({ activeModal: 'security' });
  },

  onOpenSupport() {
    this.setData({ activeModal: 'support' });
  },

  onCloseModal() {
    this.setData({ activeModal: null });
  },

  onCallSupport() {
    wx.makePhoneCall({
      phoneNumber: '1444',
      fail: () => {
        wx.showToast({ title: 'Composez le 1444 sur votre mobile', icon: 'none' });
      }
    });
  },

  onCopySupportWhatsApp() {
    wx.setClipboardData({
      data: '+221 77 000 00 00',
      success: () => {
        wx.showToast({ title: 'Numéro copié !', icon: 'success' });
      }
    });
  },

  noop() {}
});
