// ============================================================================
// THÈME — même palette que styles/tokens.wxss, pour le JavaScript
// À utiliser quand une couleur doit passer par le JS : wx.showModal
// (confirmColor), wx.setNavigationBarColor, canvas, styles calculés…
// Toute nouvelle couleur s'ajoute ici ET dans styles/tokens.wxss.
// ============================================================================

export const COLORS = {
  // Marque
  navy: '#0F1E3D',
  navyDeep: '#0E1B38',
  berry: '#C8235F',
  berryDark: '#9E1749',
  berryTint: '#FDE8EE',
  berrySoft: '#FDF1F5',

  // Textes
  text: '#0F1E3D',
  text2: '#3A4458',
  muted: '#5B6475',
  placeholder: '#7A8294',
  onDark: '#FFFFFF',

  // Surfaces et bordures
  white: '#FFFFFF',
  bg: '#F8F9FA',
  surface2: '#F7F8FA',
  surface3: '#F1F3F6',
  infoBg: '#E3E9F5',
  border: '#E4E7EE',
  divider: '#EEF0F4',

  // États
  success: '#11643F',
  successBg: '#E2F0EA',
  green: '#007C3D',
  greenBg: '#EAF7EE',
  danger: '#A3261F',
  dangerBg: '#FDECEC',
  warning: '#8A5A00',
  warningBg: '#FFF4E0'
};

/** Couleurs des pastilles d'initiales (avatars), dans l'ordre d'attribution */
export const AVATAR_COLORS = ['#0F1E3D', '#C8235F', '#5B4BB7', '#11643F', '#8A5A00', '#3A4458'];

/** Fonds pâles des vignettes de logement sans photo */
export const TINTS = ['#FDEEF2', '#E8EEF5', '#F5EFE6', '#EAF7EE'];
