import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Icon, ICONS, Pills } from '../components/ui'
import { TRANSACTIONS, TX_TONE, type Transaction, type TxStatus, type TxType } from '../data/mock'
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
  const confirmRef = useRef<HTMLButtonElement>(null)

  const all = TRANSACTIONS.map((x) => ({ ...x, status: overrides[x.ref] ?? x.status }))
  const list = all.filter((x) => (tab === 'all' || x.status === tab) && (type === 'all' || x.type === type))
  const toRefund = all.find((x) => x.ref === refundRef)

  const setStatus = (ref: string, status: TxStatus) => setOverrides((o) => ({ ...o, [ref]: status }))

  useEffect(() => {
    if (!toRefund) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setRefundRef(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toRefund])

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
        <Badge tone="success">Premium et Boost · activé</Badge>
        <Badge tone="success">Remboursements · activé</Badge>
        <Badge tone="neutral">Loyers dans l'appli · désactivé</Badge>
        <Link to="/reclamations" className="features-strip__link">Gérer</Link>
      </div>

      <div className="tx-filters">
        <Pills items={tabs} value={tab} onChange={setTab} label="Statut" />
        <label htmlFor="tx-type" className="tx-filters__label">Type</label>
        <select id="tx-type" className="tx-filters__select" value={type} onChange={(e) => setType(e.target.value as 'all' | TxType)}>
          <option value="all">Tous les types</option>
          <option value="Premium">Premium</option>
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
                        <button type="button" className="btn btn--sm">Reçu</button>
                      )}
                      {x.status === 'Réussi' && x.type !== 'Remboursement' && (
                        <button type="button" className="btn btn--sm btn--danger-outline" onClick={() => setRefundRef(x.ref)}>Rembourser</button>
                      )}
                      {(x.status === 'Échoué' || x.status === 'En attente') && (
                        <button type="button" className="btn btn--sm" onClick={() => setStatus(x.ref, 'Réussi')}>Vérifier chez l'opérateur</button>
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
        <div className="dialog-backdrop" onClick={() => setRefundRef(null)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="refund-title"
            className="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="refund-title" className="dialog__title">Rembourser {toRefund.user} ?</h2>
            <p className="dialog__text">
              {toRefund.label} · {toRefund.ref}. Le montant sera renvoyé sur le compte {toRefund.method} de l'utilisateur.
              La mise en avant liée sera arrêtée.
            </p>
            <button
              ref={confirmRef}
              type="button"
              className="btn btn--lg btn--danger"
              onClick={() => {
                setStatus(toRefund.ref, 'Remboursé')
                setRefundRef(null)
              }}
            >
              Confirmer le remboursement
            </button>
            <button type="button" className="btn btn--lg" onClick={() => setRefundRef(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
