import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Icon, Modal, Pills, Toast } from '../components/ui'
import { ICONS } from '../lib/utils'
import { TRANSACTIONS, TX_TONE, type Transaction, type TxStatus, type TxType } from '../data/mock'
import { logAction } from '../lib/audit'
import './Transactions.css'

type Tab = 'all' | TxStatus
const STATUSES: TxStatus[] = ['Réussi', 'En attente', 'Échoué', 'Remboursé']

function exportCsv(rows: Transaction[]) {
  const header = ['Référence', 'Date', 'Utilisateur', 'Type', 'Moyen', 'Montant', 'Statut']
  const lines = rows.map((x) => [x.ref, x.date, x.user, x.label, x.method, x.amount, x.status])
  const csv = [header, ...lines].map((l) => l.map((v) => `"${v.replace(/"/g, '""')}"`).join(';')).join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'transactions.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function Transactions() {
  const [tab, setTab] = useState<Tab>('all')
  const [type, setType] = useState<'all' | TxType>('all')
  // Statuts modifiés par les actions de l'admin (en attendant l'API)
  const [overrides, setOverrides] = useState<Record<string, TxStatus>>({})
  const [refundRef, setRefundRef] = useState<string | null>(null)
  const [receiptRef, setReceiptRef] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const closeRefund = useCallback(() => setRefundRef(null), [])
  const closeReceipt = useCallback(() => setReceiptRef(null), [])
  const clearToast = useCallback(() => setToast(''), [])

  const all = TRANSACTIONS.map((x) => ({ ...x, status: overrides[x.ref] ?? x.status }))
  const list = all.filter((x) => (tab === 'all' || x.status === tab) && (type === 'all' || x.type === type))
  const toRefund = all.find((x) => x.ref === refundRef)
  const receipt = all.find((x) => x.ref === receiptRef)

  const setStatus = (ref: string, status: TxStatus) => setOverrides((o) => ({ ...o, [ref]: status }))

  const checkOperator = (x: Transaction) => {
    setStatus(x.ref, 'Réussi')
    logAction('Transactions', 'Paiement confirmé par Max it', `${x.ref} · ${x.user}`)
    setToast(`Paiement ${x.ref} confirmé par Max it.`)
  }

  const tabs = [
    { id: 'all' as Tab, label: `Toutes (${all.length})` },
    ...STATUSES.map((s) => ({ id: s as Tab, label: `${s} (${all.filter((x) => x.status === s).length})` })),
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Paiements, loyers, remboursements et reçus</p>
        </div>
        <button type="button" className="btn" onClick={() => exportCsv(list)}>
          <Icon d={ICONS.download} size={16} strokeWidth={2.2} />
          Exporter (CSV)
        </button>
      </div>

      <div className="features-strip">
        <span className="features-strip__title">Fonctionnalités de paiement :</span>
        <Badge tone="success">Loyers via Max it · activé</Badge>
        <Badge tone="success">Abonnement Pro et Boost · activé</Badge>
        <Badge tone="success">Remboursements · activé</Badge>
        <Link to="/reclamations" className="features-strip__link">Gérer</Link>
      </div>

      <div className="tx-filters">
        <Pills items={tabs} value={tab} onChange={setTab} label="Statut" />
        <label htmlFor="tx-type" className="tx-filters__label">Type</label>
        <select id="tx-type" className="tx-filters__select" value={type} onChange={(e) => setType(e.target.value as 'all' | TxType)}>
          <option value="all">Tous les types</option>
          <option value="Loyer">Loyer</option>
          <option value="Abonnement">Abonnement</option>
          <option value="Boost">Boost</option>
          <option value="Remboursement">Remboursement</option>
        </select>
      </div>

      <section className="card card--flush">
        <div className="table-scroll">
          <table className="table table--head-bg" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Type</th>
                <th>Moyen</th>
                <th className="num">Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.ref}>
                  <td className="mono">{x.ref}</td>
                  <td style={{ color: 'var(--text-2)' }}>{x.date}</td>
                  <td><strong>{x.user}</strong></td>
                  <td>{x.type}</td>
                  <td style={{ color: 'var(--text-2)' }}>{x.method}</td>
                  <td className="num"><strong>{x.amount}</strong></td>
                  <td><Badge tone={TX_TONE[x.status]}>{x.status}</Badge></td>
                  <td className="tx-actions-cell">
                    <div className="tx-actions">
                      {(x.status === 'Réussi' || x.status === 'Remboursé') && (
                        <button type="button" className="btn btn--sm" onClick={() => setReceiptRef(x.ref)}>Reçu</button>
                      )}
                      {x.status === 'Réussi' && x.type !== 'Remboursement' && (
                        <button type="button" className="btn btn--sm btn--danger-outline" onClick={() => setRefundRef(x.ref)}>Rembourser</button>
                      )}
                      {(x.status === 'Échoué' || x.status === 'En attente') && (
                        <button type="button" className="btn btn--sm" onClick={() => checkOperator(x)}>Vérifier chez Max it</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="empty">Aucune transaction pour ces filtres.</p>}
      </section>

      {toRefund && (
        <Modal title={`Rembourser ${toRefund.user} ?`} role="alertdialog" onClose={closeRefund}>
          <p className="dialog__text">
            {toRefund.label} · {toRefund.ref} · <strong>{toRefund.amount}</strong>. Le montant sera renvoyé sur le compte
            {' '}{toRefund.method} de l'utilisateur. La mise en avant liée sera arrêtée.
          </p>
          <button
            type="button"
            className="btn btn--lg btn--danger"
            onClick={() => {
              setStatus(toRefund.ref, 'Remboursé')
              logAction('Transactions', 'Remboursement effectué', `${toRefund.user} · ${toRefund.amount}`)
              setRefundRef(null)
              setToast(`${toRefund.amount} remboursés à ${toRefund.user}.`)
            }}
          >
            Confirmer le remboursement
          </button>
          <button type="button" className="btn btn--lg" onClick={closeRefund}>Annuler</button>
        </Modal>
      )}

      {receipt && (
        <Modal title="Reçu de paiement" onClose={closeReceipt}>
          <div className="receipt" id="receipt">
            <div className="receipt__brand">
              <span className="receipt__logo"><Icon d={ICONS.home} size={18} strokeWidth={2.4} /></span>
              <span>
                <strong>SAMA LOYER</strong>
                <span>Reçu n° {receipt.ref}</span>
              </span>
            </div>
            <div className="receipt__amount">
              <span>{receipt.status === 'Remboursé' ? 'Montant remboursé' : 'Montant payé'}</span>
              <strong>{receipt.amount}</strong>
              <Badge tone={TX_TONE[receipt.status]}>{receipt.status}</Badge>
            </div>
            <dl className="receipt__rows">
              <div><dt>Date</dt><dd>{receipt.date} 2026</dd></div>
              <div><dt>Payé par</dt><dd>{receipt.user}</dd></div>
              <div><dt>Motif</dt><dd>{receipt.label}</dd></div>
              <div><dt>Moyen de paiement</dt><dd>{receipt.method}</dd></div>
              <div><dt>Bénéficiaire</dt><dd>{receipt.type === 'Loyer' ? 'Bailleur (compte Max it)' : 'SAMA LOYER'}</dd></div>
            </dl>
            <p className="receipt__note">Reçu généré automatiquement après validation du paiement par Max it.</p>
          </div>
          <div className="dialog__actions">
            <button type="button" className="btn btn--lg" onClick={closeReceipt}>Fermer</button>
            <button type="button" className="btn btn--lg btn--dark" onClick={() => window.print()}>
              <Icon d={ICONS.download} size={16} strokeWidth={2.2} />
              Imprimer / PDF
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  )
}

export default Transactions
