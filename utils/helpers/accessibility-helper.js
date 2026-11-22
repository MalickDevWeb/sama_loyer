/**
 * ♿ Helper d'Accessibilité Inclusive (VoiceOver & TalkBack)
 * Conforme aux standards WCAG 2.1 AA et API d'accessibilité WeChat
 */

/**
 * Force la vocalisation immédiate d'un message par le lecteur d'écran
 * @param {string} message Texte à lire à voix haute par VoiceOver / TalkBack
 */
export function announceToScreenReader(message) {
  if (!message || typeof message !== 'string') return;

  try {
    if (typeof wx.accessibilityAnnounce === 'function') {
      wx.accessibilityAnnounce({
        text: message
      });
      console.log('[Accessibility] Annonce vocale émise :', message);
    }
  } catch (err) {
    console.warn('[Accessibility] Non supporté sur ce terminal :', err);
  }
}

