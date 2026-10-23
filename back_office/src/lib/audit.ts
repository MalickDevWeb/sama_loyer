// Journal d'audit : chaque action d'un administrateur y est ajoutée.
// Petit magasin partagé par tous les écrans (en attendant l'API).

import { useSyncExternalStore } from 'react'

export type AuditModule =
  | 'Annonces'
  | 'Locations'
  | 'Locataires'
  | 'Bailleurs'
  | 'Abonnements'
  | 'Transactions'
  | 'Réclamations'
  | 'Équipe'
  | 'Connexion'

export interface AuditEntry {
  id: number
  when: string
  who: string
  module: AuditModule
  action: string
  target: string
}

const SEED: Omit<AuditEntry, 'id'>[] = [
  { when: '22 oct. 09:58', who: 'Lamine (Modérateur)', module: 'Annonces', action: 'Annonce approuvée et mise en ligne', target: 'Chambre salon · Icotaf' },
  { when: '22 oct. 09:31', who: 'Ndèye (Finance)', module: 'Transactions', action: 'Paiement confirmé par Max it', target: 'TX-26-10-4822' },
  { when: '21 oct. 18:12', who: 'Lamine (Modérateur)', module: 'Bailleurs', action: 'Identité vérifiée', target: 'Awa Ndour' },
  { when: '21 oct. 16:40', who: 'Super admin', module: 'Réclamations', action: 'Annonce et compte suspendus', target: 'Studio vue mer · Ngor' },
  { when: '21 oct. 11:05', who: 'Ndèye (Finance)', module: 'Transactions', action: 'Remboursement effectué', target: 'Cheikh Fall · 1 500 F' },
  { when: '20 oct. 17:22', who: 'Super admin', module: 'Abonnements', action: 'Essai prolongé de 30 jours', target: 'Mamadou Gueye' },
  { when: '20 oct. 10:02', who: 'Super admin', module: 'Connexion', action: 'Connexion avec code 2FA', target: 'admin@samaloyer.sn' },
]

let entries: AuditEntry[] = SEED.map((e, i) => ({ ...e, id: SEED.length - i }))
let nextId = SEED.length + 1
const listeners = new Set<() => void>()

function now() {
  const d = new Date()
  const month = d.toLocaleDateString('fr-FR', { month: 'short' })
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${d.getDate()} ${month} ${time}`
}

/** Ajoute une action au journal (la plus récente en premier) */
export function logAction(module: AuditModule, action: string, target: string) {
  entries = [{ id: nextId++, when: now(), who: 'Super admin', module, action, target }, ...entries]
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Liste du journal, mise à jour à chaque nouvelle action */
export function useAudit() {
  return useSyncExternalStore(subscribe, () => entries)
}
