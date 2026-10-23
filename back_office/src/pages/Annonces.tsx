import { useCallback, useMemo, useState } from 'react'
import { Badge, Icon, Pills, Toast } from '../components/ui'
import { ICONS, fmt, norm } from '../lib/utils'
import { logAction } from '../lib/audit'
import { ANNONCES_EN_LIGNE, ANNONCE_STATUS, photoOf, type AnnonceEnLigne, type AnnonceStatus } from '../data/mock'
import './Annonces.css'

type Tab = 'all' | AnnonceStatus

function Annonces() {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  // Statuts modifiés par les actions de l'admin (en attendant l'API)
  const [overrides, setOverrides] = useState<Record<string, AnnonceStatus>>({})
  const [toast, setToast] = useState('')
  const clearToast = useCallback(() => setToast(''), [])

  const all = useMemo(() => ANNONCES_EN_LIGNE.map((a) => ({ ...a, status: overrides[a.id] ?? a.status })), [overrides])
  const count = (s: AnnonceStatus) => all.filter((a) => a.status === s).length
  const q = norm(query)
  const list = all.filter(
    (a) => (tab === 'all' || a.status === tab) && (!q || norm(`${a.title} ${a.zone} ${a.owner}`).includes(q)),
  )

  const act = (a: AnnonceEnLigne, status: AnnonceStatus, action: string, message: string) => {
    setOverrides((o) => ({ ...o, [a.id]: status }))
    logAction('Annonces', action, `${a.title} · ${a.zone}`)
    setToast(message)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: `Toutes (${all.length})` },
    { id: 'online', label: `En ligne (${count('online')})` },
    { id: 'stale', label: `À confirmer (${count('stale')})` },
    { id: 'rented', label: `Louées visibles (${count('rented')})` },
    { id: 'hidden', label: `Masquées (${count('hidden')})` },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Annonces en ligne</h1>
          <p className="page-subtitle">Toutes les annonces publiées, leur disponibilité et leur visibilité</p>
        </div>
        <div className="search-box">
          <Icon d={ICONS.search} size={16} strokeWidth={2.2} />
          <label htmlFor="annonce-search" className="sr-only">Rechercher une annonce</label>
          <input
            id="annonce-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Logement, quartier, bailleur"
          />
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="kpi__label">En ligne</span><span className="kpi__value">{count('online')}</span><span className="kpi__delta" style={{ color: 'var(--success)' }}>visibles par les locataires</span></div>
        <div className="kpi"><span className="kpi__label">À confirmer</span><span className="kpi__value">{count('stale')}</span><span className="kpi__delta" style={{ color: 'var(--warning-text)' }}>disponibilité non confirmée depuis 21 j</span></div>
        <div className="kpi"><span className="kpi__label">Louées, encore visibles</span><span className="kpi__value">{count('rented')}</span><span className="kpi__delta" style={{ color: 'var(--danger)' }}>à masquer</span></div>
        <div className="kpi"><span className="kpi__label">Masquées</span><span className="kpi__value">{count('hidden')}</span><span className="kpi__delta" style={{ color: 'var(--muted)' }}>par l'équipe ou le bailleur</span></div>
      </div>

      <Pills items={tabs} value={tab} onChange={setTab} label="Filtrer par statut" />

      <section className="card card--flush">
        <div className="table-scroll">
          <table className="table table--head-bg" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Annonce</th>
                <th>Bailleur</th>
                <th className="num">Loyer</th>
                <th className="num">Vues</th>
                <th>Disponibilité confirmée</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="list-who">
                      <img className="list-thumb" src={photoOf(a.photo)} alt="" loading="lazy" />
                      <span className="cell-stack">
                        <strong>{a.title}{a.boosted && <span className="annonces__boost">Boost</span>}</strong>
                        <span className="list-meta">{a.zone}</span>
                      </span>
                    </span>
                  </td>
                  <td>{a.owner}</td>
                  <td className="num"><strong>{fmt(a.price)} F</strong></td>
                  <td className="num">{fmt(a.views)}</td>
                  <td style={{ color: a.status === 'stale' ? 'var(--warning-text)' : 'var(--text-2)' }}>{a.confirmed}</td>
                  <td><Badge tone={ANNONCE_STATUS[a.status].tone}>{ANNONCE_STATUS[a.status].label}</Badge></td>
                  <td>
                    <div className="tx-actions">
                      {a.status === 'stale' && (
                        <button type="button" className="btn btn--sm" onClick={() => act(a, 'stale', 'Rappel de disponibilité envoyé', `Rappel SMS envoyé à ${a.owner}.`)}>
                          <Icon d={ICONS.bell} size={14} strokeWidth={2.2} /> Relancer
                        </button>
                      )}
                      {a.status !== 'hidden' && (
                        <button type="button" className="btn btn--sm btn--danger-outline" onClick={() => act(a, 'hidden', 'Annonce masquée', `« ${a.title} · ${a.zone} » n'est plus visible.`)}>
                          Masquer
                        </button>
                      )}
                      {a.status === 'hidden' && (
                        <button type="button" className="btn btn--sm" onClick={() => act(a, 'online', 'Annonce remise en ligne', `« ${a.title} · ${a.zone} » est de nouveau visible.`)}>
                          <Icon d={ICONS.eye} size={14} strokeWidth={2.2} /> Remettre en ligne
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="empty">Aucune annonce ne correspond.</p>}
      </section>

      <p className="annonces__rule">
        Règle automatique : une annonce dont la disponibilité n'est pas confirmée depuis 21 jours est masquée
        (modifiable dans Réclamations et paramètres).
      </p>

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  )
}

export default Annonces
