// ============================================================================
// SAMA LOYER — UTILITAIRE DE PARTAGE & REDIRECTION EXTERNE (WhatsApp / SMS / Web)
// Compatible WeChat Mini-Programs et Super-App Orange Max it (TCMPP)
// ============================================================================

/**
 * Nettoie un numéro de téléphone pour format international WhatsApp sans '+' ni espaces
 * Ex: '+221 77 123 45 12' -> '221771234512'
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('3'))) {
    digits = '221' + digits;
  }
  return digits;
}

/**
 * Redirige vers WhatsApp avec texte pré-rempli et copie sécurisée dans le presse-papier.
 * Tente d'ouvrir WhatsApp via le pont natif TCMPP/Max it si disponible,
 * et affiche une modale d'accompagnement immédiate.
 *
 * @param {Object} options
 * @param {string} options.text - Texte à envoyer
 * @param {string} [options.phone] - Numéro du destinataire (optionnel)
 * @param {Function} [options.onComplete] - Callback exécuté à la fin
 */
export function redirectToWhatsApp({ text, phone, onComplete } = {}) {
  const content = text || '';
  const cleanPhone = cleanPhoneNumber(phone);
  const waUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(content)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(content)}`;
  const waScheme = cleanPhone
    ? `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(content)}`
    : `whatsapp://send?text=${encodeURIComponent(content)}`;

  // 1. Toujours copier dans le presse-papier en premier
  wx.setClipboardData({
    data: content,
    showToast: false,
    success: () => {
      // 2. Tenter l'ouverture native (TCMPP / Orange Max it Super-App)
      let openedNatively = false;
      if (typeof wx.invokeNativePlugin === 'function') {
        try {
          wx.invokeNativePlugin({
            api_name: 'openURL',
            data: { url: waUrl },
            success: () => { openedNatively = true; },
            fail: () => {
              try {
                wx.invokeNativePlugin({
                  api_name: 'openApp',
                  data: { url: waScheme, packageName: 'com.whatsapp' },
                  success: () => { openedNatively = true; },
                  fail: () => {}
                });
              } catch (e) {}
            }
          });
        } catch (e) {}
      }

      // 3. Dialogue d'accompagnement clair et rassurant
      wx.showModal({
        title: 'Partage WhatsApp 💬',
        content: 'Le message et le lien sont copiés dans votre presse-papier.\n\nOuvrez WhatsApp et collez-le directement dans votre discussion.',
        confirmText: 'WhatsApp',
        confirmColor: '#1FA35C',
        cancelText: 'Fermer',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            // Relance l'ouverture native si supportée
            if (typeof wx.invokeNativePlugin === 'function') {
              try {
                wx.invokeNativePlugin({ api_name: 'openURL', data: { url: waUrl } });
              } catch (e) {}
            }
          }
          if (typeof onComplete === 'function') {
            onComplete({ success: true, openedNatively });
          }
        }
      });
    },
    fail: () => {
      wx.showToast({ title: 'Erreur de copie', icon: 'none' });
      if (typeof onComplete === 'function') {
        onComplete({ success: false });
      }
    }
  });
}

/**
 * Prépare et redirige vers l'application SMS avec le message pré-rempli
 *
 * @param {Object} options
 * @param {string} options.text - Texte à envoyer
 * @param {string} [options.phone] - Numéro du destinataire
 * @param {Function} [options.onComplete]
 */
export function redirectToSMS({ text, phone, onComplete } = {}) {
  const content = text || '';
  const cleanPhone = cleanPhoneNumber(phone);
  const smsUrl = cleanPhone
    ? `sms:${cleanPhone}?body=${encodeURIComponent(content)}`
    : `sms:?body=${encodeURIComponent(content)}`;

  wx.setClipboardData({
    data: content,
    showToast: false,
    success: () => {
      if (typeof wx.invokeNativePlugin === 'function') {
        try {
          wx.invokeNativePlugin({
            api_name: 'openURL',
            data: { url: smsUrl }
          });
        } catch (e) {}
      }

      wx.showModal({
        title: 'Envoi par SMS ✉️',
        content: 'Le texte est copié ! Ouvrez vos messages pour l’envoyer à votre contact.',
        confirmText: 'Messages',
        confirmColor: '#C8235F',
        cancelText: 'Fermer',
        showCancel: true,
        success: (res) => {
          if (typeof onComplete === 'function') {
            onComplete({ success: true });
          }
        }
      });
    },
    fail: () => {
      wx.showToast({ title: 'Erreur de copie', icon: 'none' });
    }
  });
}
