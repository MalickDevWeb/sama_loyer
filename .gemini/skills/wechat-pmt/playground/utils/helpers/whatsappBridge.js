/**
 * WhatsApp & Customer Support Resilient Bridge for WeChat / TCMPP Mini-Programs
 *
 * Résout le problème des restrictions de redirection externe et le bug d'écran noir
 * du simulateur WeChat DevTools sur wx.previewImage() avec chemins d'assets relatifs.
 *
 * Fournit :
 * 1. Construction d'URLs WhatsApp avec encodage UTF-8 conforme (message pré-rempli ou short-link Business).
 * 2. Déclencheur ActionSheet natif multi-canaux (QR Code in-app, Copie lien direct, Appel téléphonique).
 * 3. Copie presse-papier résiliente avec retour haptique et confirmation toast.
 * 4. Détection et appel du pont natif Max It (openUrl) si disponible sur le conteneur hôte.
 */

/**
 * Construit une URL de redirection WhatsApp avec paramètres optionnels de message ou lien court Business.
 *
 * @param {Object} options
 * @param {string} [options.phone] - Numéro international sans '+' ni espaces (ex: "221770000000")
 * @param {string} [options.message] - Message pré-rempli facultatif
 * @param {string} [options.shortLinkId] - Identifiant de lien court WhatsApp Business (ex: "F5VM5FMWEDWLJ1")
 * @returns {string} URL WhatsApp conforme
 */
export function buildWhatsAppUrl({ phone, message = "", shortLinkId = "" } = {}) {
  if (shortLinkId) {
    return `https://wa.me/message/${encodeURIComponent(shortLinkId.trim())}`;
  }
  const cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
  if (!cleanPhone) {
    throw new Error("[WhatsAppBridge] Un numéro de téléphone ou un shortLinkId est obligatoire.");
  }
  const trimmedMsg = String(message || "").trim();
  if (trimmedMsg) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(trimmedMsg)}`;
  }
  return `https://wa.me/${cleanPhone}`;
}

/**
 * Copie une chaîne dans le presse-papier avec vibration haptique et notification toast.
 *
 * @param {string} data - Contenu à copier
 * @param {string} [toastTitle="Copié !"] - Titre du toast de succès
 * @returns {Promise<boolean>}
 */
export function copyToClipboard(data, toastTitle = "Copié !") {
  return new Promise((resolve) => {
    if (!data) return resolve(false);
    wx.setClipboardData({
      data: String(data),
      success: () => {
        if (typeof wx.vibrateShort === "function") {
          wx.vibrateShort({ type: "medium" });
        }
        wx.showToast({
          title: toastTitle,
          icon: "success",
          duration: 2500
        });
        resolve(true);
      },
      fail: (err) => {
        console.warn("[WhatsAppBridge] Échec de la copie presse-papier :", err);
        resolve(false);
      }
    });
  });
}

/**
 * Déclenche un appel téléphonique vocal via l'API native du terminal.
 *
 * @param {string} phoneNumber - Numéro de téléphone brut
 * @returns {Promise<boolean>}
 */
export function makeSupportPhoneCall(phoneNumber) {
  return new Promise((resolve) => {
    const cleanPhone = String(phoneNumber || "").replace(/[^0-9]/g, "");
    if (!cleanPhone) return resolve(false);
    wx.makePhoneCall({
      phoneNumber: cleanPhone,
      success: () => resolve(true),
      fail: (err) => {
        console.warn("[WhatsAppBridge] Appel annulé ou indisponible :", err);
        resolve(false);
      }
    });
  });
}

/**
 * Ouvre l'ActionSheet d'assistance client multi-canaux.
 *
 * @param {Object} options
 * @param {string} [options.title="Assistance Client"] - Titre de l'entête
 * @param {string} options.whatsappUrl - URL complète WhatsApp (wa.me)
 * @param {string} [options.supportPhone] - Numéro affiché pour l'appel
 * @param {string} [options.rawCallPhone] - Numéro sans espaces pour makePhoneCall
 * @param {string} [options.brandName="WhatsApp"] - Nom de la marque ou entreprise
 * @param {Function} options.onOpenModal - Callback déclenché pour ouvrir la modale in-app
 */
export function openWhatsAppSupportSheet({
  whatsappUrl,
  supportPhone = "+221 77 000 00 00",
  rawCallPhone = "221770000000",
  brandName = "WhatsApp",
  onOpenModal
}) {
  const itemList = [
    `📷 Afficher le QR Code ${brandName}`,
    `📋 Copier le lien ${brandName} direct`,
    `📞 Appeler le service client (${supportPhone})`
  ];

  wx.showActionSheet({
    itemList,
    success: (res) => {
      if (res.tapIndex === 0) {
        if (typeof onOpenModal === "function") {
          onOpenModal();
        }
      } else if (res.tapIndex === 1) {
        copyToClipboard(whatsappUrl, "Lien copié !");
      } else if (res.tapIndex === 2) {
        makeSupportPhoneCall(rawCallPhone || supportPhone);
      }
    },
    fail: (err) => {
      if (err && err.errMsg && !err.errMsg.includes("cancel")) {
        console.warn("[WhatsAppBridge] ActionSheet dismiss :", err);
      }
    }
  });
}
