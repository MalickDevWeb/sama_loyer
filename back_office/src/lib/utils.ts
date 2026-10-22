// Constantes et fonctions partagées (hors composants, pour le rechargement à chaud)

export const ICONS = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5',
  dashboard: 'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  validate: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
  star: 'm12 2 3 6.6 7.2.7-5.4 4.9 1.6 7.1L12 17.6 5.6 21.3l1.6-7.1L1.8 9.3 9 8.6z',
  card: 'M3 6h18v13H3zM3 10h18M7 15h4',
  flag: 'M4 21V4h11l-1 4h6v9H9l1-4H4',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  chevron: 'M9 5l7 7-7 7',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  check: 'm5 12 5 5 9-10',
}

/** 12480 -> "12 480" */
export function fmt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Recherche insensible à la casse et aux accents */
export function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
