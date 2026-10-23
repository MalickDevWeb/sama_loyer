import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Badge, Icon, Modal, Pills, Toast } from '../components/ui'
import { ICONS, norm } from '../lib/utils'
import { logAction } from '../lib/audit'
import { LOCATAIRES, LOCATAIRE_STATUS, type LocataireStatus } from '../data/mock'

type Tab = 'all' | LocataireStatus

const NOTE_CLASS: Record<LocataireStatus, string> = {
  active: 'note--success',
  flagged: 'note--warning',
  suspended: 'note--danger',
}

function onTimeColor(pct: number, paid: number) {
  if (!paid) return 'var(--muted)'
  if (pct >= 95) return 'var(--success)'
  if (pct >= 80) return 'var(--warning)'
  return 'var(--danger)'
}

function Locataires() {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('t3')
  // Statuts modifiés par les actions de l'admin (en attendant l'API)
  const [overrides, setOverrides] = useState<Record<string, LocataireStatus>>({})
  const [confirm, setConfirm] = useState(false)
  const [toast, setToast] = useState('')
  const closeConfirm = useCallback(() => setConfirm(false), [])
  const clearToast = useCallback(() => setToast(''), [])

  const all = useMemo(() => LOCATAIRES.map((t) => ({ ...t, status: overrides[t.id] ?? t.status })), [overrides])
  const count = (s: LocataireStatus) => all.filter((t) => t.status === s).length
  const q = norm(query)
  const list = all.filter(
    (t) => (tab === 'all' || t.status === tab) && (!q || norm(`${t.name} ${t.phone} ${t.logement}`).includes(q)),
  )
  const selected = all.find((t) => t.id === selectedId)

  const setStatus = (status: LocataireStatus, action: string, message: string) => {
    if (!selected) return
    setOverrides((o) => ({ ...o, [selected.id]: status }))
    logAction('Locataires', action, selected.name)
    setToast(message)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: `Tous (${all.length})` },
    { id: 'active', label: `Actifs (${count('active')})` },
    { id: 'flagged', label: `Signalés (${count('flagged')})` },
    { id: 'suspended', label: `Suspendus (${count('suspended')})` },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Locataires</h1>
          <p className="page-subtitle">Comptes, historique de paiement, signalements et suspensions</p>
        </div>
        <div className="search-box">
          <Icon d={ICONS.search} size={16} strokeWidth={2.2} />
          <label htmlFor="locataire-search" className="sr-only">Rechercher un locataire</label>
          <input
            id="locataire-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, téléphone, logement"
          />
        </div>
      </div>

      <Pills items={tabs} value={tab} onChange={setTab} label="Filtrer par statut" />

      <div className="row">
        <section className="card card--flush list-card">
          <div className="table-scroll">
            <table className="table table--head-bg" style={{ minWidth: 660 }}>
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Logement actuel</th>
                  <th className="num">Loyers à l'heure</th>
                  <th className="num">Signalements</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className={`list-row${t.id === selectedId ? ' list-row--on' : ''}`} onClick={() => setSelectedId(t.id)}>
                    <td>
                      <button type="button" className="list-who" aria-label={`Ouvrir la fiche de ${t.name}`} onClick={() => setSelectedId(t.id)}>
                        <Avatar initials={t.initials} color={t.color} />
                        <span className="cell-stack">
                          <strong>{t.name}</strong>
                          <span className="list-meta">{t.phone}</span>
                        </span>
                      </button>
                    </td>
                    <td style={{ color: 'var(--text-2)' }}>{t.logement}</td>
                    <td className="num" style={{ fontWeight: 800, color: onTimeColor(t.onTime, t.paid) }}>{t.paid ? `${t.onTime} %` : '—'}</td>
                    <td className="num" style={{ fontWeight: 800, color: t.reports ? 'var(--danger)' : 'var(--muted)' }}>{t.reports}</td>
                    <td><Badge tone={LOCATAIRE_STATUS[t.status].tone}>{LOCATAIRE_STATUS[t.status].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length === 0 && <p className="empty">Aucun locataire ne correspond.</p>}
        </section>

        {selected && (
          <section aria-label="Fiche du locataire" className="card detail-card">
            <div className="detail-card__head">
              <Avatar initials={selected.initials} color={selected.color} size={52} />
              <div>
                <h2 className="detail-card__title">{selected.name}</h2>
                <Badge tone={LOCATAIRE_STATUS[selected.status].tone}>{LOCATAIRE_STATUS[selected.status].label}</Badge>
              </div>
            </div>

            <div className="info-grid">
              <div><span>Téléphone</span><strong>{selected.phone}</strong></div>
              <div><span>Inscrit le</span><strong>{selected.since}</strong></div>
              <div><span>Loyers payés</span><strong>{selected.paid}</strong></div>
              <div><span>À l'heure</span><strong>{selected.paid ? `${selected.onTime} %` : '—'}</strong></div>
            </div>

            <div>
              <h3 className="detail-card__h3">Logement actuel</h3>
              {selected.logement === '—' ? (
                <p className="detail-card__hint">Aucune location en cours.</p>
              ) : (
                <Link to="/locations" className="link-strong">{selected.logement} · voir la location</Link>
              )}
            </div>

            <div className={`note ${NOTE_CLASS[selected.status]}`}>{selected.note}</div>

            {selected.status === 'flagged' && (
              <div className="detail-card__actions">
                <button type="button" className="btn" onClick={() => setStatus('active', 'Signalement classé sans suite', `Signalement de ${selected.name} classé.`)}>
                  Classer sans suite
                </button>
                <button type="button" className="btn btn--danger" onClick={() => setConfirm(true)}>Suspendre</button>
              </div>
            )}
            {selected.status === 'active' && (
              <button type="button" className="btn btn--danger-outline" onClick={() => setConfirm(true)}>Suspendre le compte</button>
            )}
            {selected.status === 'suspended' && (
              <button type="button" className="btn btn--dark" onClick={() => setStatus('active', 'Compte réactivé', `Compte de ${selected.name} réactivé.`)}>
                Réactiver le compte
              </button>
            )}
            <p className="detail-card__hint">Le numéro complet n'est visible qu'en cas de litige. Chaque action est enregistrée dans le journal.</p>
          </section>
        )}
      </div>

      {confirm && selected && (
        <Modal title={`Suspendre ${selected.name} ?`} role="alertdialog" onClose={closeConfirm}>
          <p className="dialog__text">
            Le locataire ne pourra plus demander de visite ni contacter de bailleur. Sa location en cours et ses paiements
            de loyer restent actifs. Il est prévenu par SMS.
          </p>
          <button
            type="button"
            className="btn btn--lg btn--danger"
            onClick={() => {
              setStatus('suspended', 'Compte suspendu', `Compte de ${selected.name} suspendu.`)
              setConfirm(false)
            }}
          >
            Confirmer la suspension
          </button>
          <button type="button" className="btn btn--lg" onClick={closeConfirm}>Annuler</button>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  )
}

export default Locataires
